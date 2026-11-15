#!/usr/bin/env python3
"""Tela dividida (react com vídeo minerado) — padrão do CEO.

Minerado na metade de cima inteira (1080x960), reação do cliente embaixo (SOMENTE os arquivos de reação do cliente sdr),
gancho em caixa branca arredondada, texto preto negrito (Avenir Next Bold), centralizada na divisa (y=960).
Áudio = só o do minerado, cortado pela onda (sem respiro >= 0,25 s), -14 LUFS, pico <= -1,5 dBTP.

Uso (roda com o Python da skill editor-video, que tem numpy/PIL e o corte_por_onda):
  uv run --directory ~/.claude/skills/editor-video python ferramentas/tela-dividida-1600.py <plano.json> [id ...]

plano.json: {"saida_dir": ..., "reacao_dir": ..., "videos": [ {id, src, saida, faixas:[[a,b],...],
  gancho:[l1,l2], crop:{y0, zoom, xoff}, reacao:"arquivo de reação do cliente", reacao_ini: s} ]}
Nunca altera os originais.
"""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

SKILL = Path.home() / ".claude/skills/editor-video/helpers"
sys.path.insert(0, str(SKILL))
import corte_por_onda as onda  # noqa: E402

W, H, HALF = 1080, 1920, 960
FONT = "/System/Library/Fonts/Avenir Next.ttc"
PAD = 0.08          # sobra de silêncio de cada lado de um respiro tirado (emenda ~0,16 s)
MIN_PAUSA = 0.22
XF = 0.5            # fusão quando a reação volta ao começo


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        raise SystemExit(f"ERRO ffmpeg:\n{r.stderr[-3000:]}")
    return r


def probe(p: Path) -> dict:
    r = run(["ffprobe", "-v", "error", "-show_entries", "stream=width,height:format=duration", "-select_streams", "v:0",
             "-of", "json", str(p)])
    j = json.loads(r.stdout)
    return {"w": j["streams"][0]["width"], "h": j["streams"][0]["height"], "dur": float(j["format"]["duration"])}


def pedacos(src: Path, faixas: list[list[float]]) -> list[tuple[float, float]]:
    """Corta pela onda: aperta as pontas e tira cada respiro >= MIN_PAUSA dentro das faixas."""
    db = onda.envelope(src, None)
    hop = onda.HOP_S
    sel = np.concatenate([db[int(a / hop):int(b / hop)] for a, b in faixas])
    th = onda.threshold(sel)
    out = []

    def snap(t: float, viz: float = 0.25) -> float:
        """leva a ponta da faixa para o ponto mais quieto em volta (vale da onda, nunca no meio da palavra)."""
        i, k = int(round(t / hop)), int(viz / hop)
        lo, hi = max(0, i - k), min(len(db), i + k + 1)
        j = lo + int(np.argmin(np.convolve(db[lo:hi], np.ones(5) / 5, mode="same")))
        return j * hop

    faixas = [(snap(a) if a > 0.3 else a, snap(b)) for a, b in faixas]
    for a, b in faixas:
        i0, i1 = int(round(a / hop)), int(round(b / hop))
        seg = db[i0:i1]
        loud = seg >= th
        if not loud.any():
            continue
        # corridas de silêncio
        runs, r0 = [], None
        for k, v in enumerate(loud):
            if not v and r0 is None:
                r0 = k
            if v and r0 is not None:
                runs.append((r0, k)); r0 = None
        if r0 is not None:
            runs.append((r0, len(loud)))
        cur = a
        first = int(np.argmax(loud)); last = len(loud) - int(np.argmax(loud[::-1]))
        start = max(a, a + first * hop - PAD)
        end = min(b, a + last * hop + PAD)
        cur = start
        for s, e in runs:
            ts, te = a + s * hop, a + e * hop
            if ts <= start or te >= end:
                continue
            if (e - s) * hop >= MIN_PAUSA:
                out.append((cur, ts + PAD))
                cur = te - PAD
        out.append((cur, end))
    out = [(x, y) for x, y in out if y - x > 0.05]
    # 2ª passada: mede como o portão mede (limiar do áudio JÁ emendado) e tira o que sobrou >= 0,25 s
    for _ in range(4):
        cat, mapa = [], []
        for x, y in out:
            i0, i1 = int(round(x / hop)), int(round(y / hop))
            cat.append(db[i0:i1]); mapa.extend(range(i0, i1))
        cat = np.concatenate(cat)
        th2 = onda.threshold(cat)
        tira = np.zeros(len(cat), dtype=bool)
        r0, achou = None, 0
        for k, v in enumerate(cat):
            q = v < th2
            if q and r0 is None:
                r0 = k
            if (not q or k == len(cat) - 1) and r0 is not None:
                if (k - r0) * hop >= 0.2 and r0 > 0 and k < len(cat) - 1:
                    tira[r0 + 5:k - 5] = True; achou += 1
                r0 = None
        if not achou:
            break
        novo, ini, prev = [], None, None
        for idx, keep in zip(mapa, ~tira):
            if not keep:
                continue
            if ini is None:
                ini = prev = idx
            elif idx == prev + 1:
                prev = idx
            else:
                novo.append((ini * hop, (prev + 1) * hop)); ini = prev = idx
        if ini is not None:
            novo.append((ini * hop, (prev + 1) * hop))
        out = [(x, y) for x, y in novo if y - x > 0.05]
    return [(round(x, 3), round(y, 3)) for x, y in out]


def caixa_png(linhas: list[str], saida: Path) -> dict:
    size = 74
    while size > 46:
        f = ImageFont.truetype(FONT, size, index=0)
        if max(f.getlength(l) for l in linhas) <= 780:
            break
        size -= 1
    f = ImageFont.truetype(FONT, size, index=0)
    tw = max(f.getlength(l) for l in linhas)
    pitch = round(size * 1.2)
    padx, pady = round(size * 0.66), round(size * 0.48)
    bw = max(770, round(tw + 2 * padx))
    asc, desc = f.getmetrics()
    bh = round(pitch * (len(linhas) - 1) + size * 1.05 + 2 * pady)
    S = 3
    img = Image.new("RGBA", (W * S, H * S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    x0, y0 = (W - bw) // 2, HALF - bh // 2
    d.rounded_rectangle([x0 * S, y0 * S, (x0 + bw) * S, (y0 + bh) * S], radius=34 * S, fill=(255, 255, 255, 255))
    fS = ImageFont.truetype(FONT, size * S, index=0)
    bloco = pitch * (len(linhas) - 1)
    cy = HALF - bloco / 2
    for i, l in enumerate(linhas):
        d.text((W * S / 2, (cy + i * pitch) * S), l, font=fS, fill=(0, 0, 0, 255), anchor="mm")
    img = img.resize((W, H), Image.LANCZOS)
    img.save(saida)
    return {"fonte_px": size, "caixa": [x0, y0, bw, bh]}


def montar(v: dict, plano: dict, tmp: Path):
    src = Path(v["src"])
    info = probe(src)
    pcs = pedacos(src, v["faixas"])
    dur = sum(b - a for a, b in pcs)
    # --- minerado (vídeo + áudio) ---
    c = v.get("crop", {})
    zoom = c.get("zoom", 1.0)
    cw = info["w"] / zoom
    ch = cw * HALF / W
    cx = (info["w"] - cw) / 2 + c.get("xoff", 0)
    cy = c.get("y0", 0)
    cy = max(0, min(cy, info["h"] - ch))
    fc = []
    for i, (a, b) in enumerate(pcs):
        fc.append(f"[0:v]trim={a}:{b},setpts=PTS-STARTPTS[v{i}]")
        fa = min(0.008, (b - a) / 4)
        fc.append(f"[0:a]atrim={a}:{b},asetpts=PTS-STARTPTS,afade=t=in:d={fa},afade=t=out:st={b - a - fa:.4f}:d={fa}[a{i}]")
    n = len(pcs)
    fc.append("".join(f"[v{i}][a{i}]" for i in range(n)) + f"concat=n={n}:v=1:a=1[mv][ma]")
    # y por trecho (tempo do vídeo final): [[t0, t1, y], ...] para planos com o rosto em outra altura
    yexpr = f"{cy:.0f}"
    for t0, t1, yy in reversed(c.get("y_trechos", [])):
        yexpr = f"'if(between(t,{t0},{t1}),{yy},{yexpr})'" if not yexpr.startswith("'") else f"'if(between(t,{t0},{t1}),{yy},{yexpr[1:-1]})'"
    borr = v.get("borrar", [])
    lbl = "top" if not borr else "top0"
    fc.append(f"[mv]fps=30,crop={cw:.0f}:{ch:.0f}:{cx:.0f}:{yexpr},scale={W}:{HALF}:flags=lanczos,setsar=1,format=yuv420p[{lbl}]")
    for k, bz in enumerate(borr):
        # tempos da fonte -> tempos do vídeo final
        en = ""
        if bz.get("faixas"):
            ts, acc = [], 0.0
            for a, b in pcs:
                for fa0, fb0 in bz["faixas"]:
                    lo, hi = max(a, fa0), min(b, fb0)
                    if hi > lo:
                        ts.append(f"between(t,{acc + lo - a:.3f},{acc + hi - a:.3f})")
                acc += b - a
            en = ":enable='" + "+".join(ts) + "'" if ts else ":enable='0'"
        nxt = "top" if k == len(borr) - 1 else f"top{k + 1}"
        fc.append(f"[top{k}]split[bA{k}][bB{k}];[bB{k}]crop={bz['w']}:{bz['h']}:{bz['x']}:{bz['y']},boxblur=lr=12:lp=3:cr=10:cp=3[bC{k}];"
                  f"[bA{k}][bC{k}]overlay={bz['x']}:{bz['y']}{en}[{nxt}]")
    # --- reação ---
    rp = Path(plano["reacao_dir"]) / f"{v['reacao']}-sdr.mp4"
    rdur = probe(rp)["dur"] - 0.1
    ini = v["reacao_ini"]
    partes, t, pos = [], 0.0, ini
    need = dur + 0.2
    while t < need:
        ln = min(rdur - pos, need - t + (XF if partes else 0))
        partes.append((pos, pos + ln))
        t += ln - (XF if len(partes) > 1 else 0)
        pos = 0.0
    ry = v.get("reacao_y", 600)
    for j, (a, b) in enumerate(partes):
        fc.append(f"[1:v]trim={a}:{b},setpts=PTS-STARTPTS,fps=30,crop={W}:{HALF}:0:{ry},setsar=1,format=yuv420p[r{j}]")
    if len(partes) == 1:
        fc.append("[r0]null[rx]")
    else:
        prev, acc = "r0", partes[0][1] - partes[0][0]
        for j in range(1, len(partes)):
            outl = "rx" if j == len(partes) - 1 else f"rr{j}"
            fc.append(f"[{prev}][r{j}]xfade=transition=fade:duration={XF}:offset={acc - XF:.3f}[{outl}]")
            acc += partes[j][1] - partes[j][0] - XF
            prev = outl
    fc.append(f"[rx]trim=0:{dur:.3f},setpts=PTS-STARTPTS[bot]")
    fc.append("[top][bot]vstack[st]")
    fc.append("[st][2:v]overlay=0:0:format=auto,format=yuv420p[vout]")
    box = tmp / f"{v['id']}-caixa.png"
    cx_info = caixa_png(v["gancho"], box)
    bruto = tmp / f"{v['id']}-bruto.mp4"
    graph = tmp / f"{v['id']}.graph"
    graph.write_text(";\n".join(fc))
    run(["ffmpeg", "-y", "-v", "error", "-i", str(src), "-i", str(rp), "-loop", "1", "-i", str(box),
         "-filter_complex_script", str(graph), "-map", "[vout]", "-map", "[ma]", "-t", f"{dur:.3f}",
         "-c:v", "libx264", "-preset", "medium", "-b:v", "12M", "-maxrate", "14M", "-bufsize", "24M",
         "-pix_fmt", "yuv420p", "-r", "30", "-c:a", "pcm_s16le", "-ar", "48000", str(bruto.with_suffix(".mov"))])
    bruto = bruto.with_suffix(".mov")
    # --- volume: loudnorm em 2 passadas ---
    r = subprocess.run(["ffmpeg", "-v", "info", "-i", str(bruto), "-vn", "-af",
                        "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                       capture_output=True, text=True)
    js = json.loads(r.stderr[r.stderr.rindex("{"):r.stderr.rindex("}") + 1])
    af = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={js['input_i']}:measured_TP={js['input_tp']}:"
          f"measured_LRA={js['input_lra']}:measured_thresh={js['input_thresh']}:offset={js['target_offset']}:"
          "linear=true,aresample=48000")
    out = Path(v["saida"])
    out.parent.mkdir(parents=True, exist_ok=True)
    run(["ffmpeg", "-y", "-v", "error", "-i", str(bruto), "-map", "0:v", "-map", "0:a", "-c:v", "copy",
         "-af", af, "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-shortest", "-movflags", "+faststart", str(out)])
    rel = {"id": v["id"], "saida": str(out), "dur": round(dur, 2), "pedacos": pcs, "caixa": cx_info,
           "reacao": f"{v['reacao']} {ini:.0f}s", "reacao_partes": partes}
    (tmp / f"{v['id']}.json").write_text(json.dumps(rel, indent=1, ensure_ascii=False))
    print(json.dumps({k: rel[k] for k in ("id", "dur", "caixa", "reacao")}, ensure_ascii=False))


def main():
    plano = json.loads(Path(sys.argv[1]).read_text())
    so = set(sys.argv[2:])
    tmp = Path(plano["tmp_dir"]); tmp.mkdir(parents=True, exist_ok=True)
    for v in plano["videos"]:
        if so and v["id"] not in so:
            continue
        montar(v, plano, tmp)


if __name__ == "__main__":
    main()
