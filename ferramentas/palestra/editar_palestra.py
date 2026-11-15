#!/usr/bin/env python3
"""Editor de palestras - UM comando: bruto -> corte 9:16 pronto (+ versao leve).

Uso (pelo editar-palestra.sh):  editar_palestra.py <bruto> [--modo rapido|completo] [--cliente X] [--plano plano.json]
Etapas (tempo impresso no fim): sonda -> transcricao -> plano -> render paralelo (HW) + audio paralelo -> mux+leve -> entrega.
"""
import os
os.environ.setdefault('OPENCV_LOG_LEVEL','ERROR')
import argparse, json, os, re, shutil, subprocess, sys, time, datetime, math
from pathlib import Path
from multiprocessing import get_context
import numpy as np, cv2
from scipy.io import wavfile
import scipy.signal as sg

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import gfx, gfx2

ROOT = HERE.parent.parent
SKILL = Path.home() / '.claude/skills/editor-video'
FPS = 30
SR = 48000
TS = []  # (etapa, segundos)
_t = [time.time()]


def lap(nome):
    now = time.time(); TS.append((nome, now - _t[0])); _t[0] = now
    print(f"[{fmt(TS[-1][1])}] {nome}", flush=True)


def fmt(s): return f"{int(s//60)}:{s%60:04.1f}"


def sh(cmd, **kw): return subprocess.run(cmd, check=True, **kw)


# ---------------------------------------------------------------- sonda
def sonda(src):
    j = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries',
        'stream=width,height:stream_side_data=rotation:format=duration', '-of', 'json', str(src)], capture_output=True, text=True).stdout)
    st = j['streams'][0]; w, h = st['width'], st['height']
    rot = 0
    for sd in st.get('side_data_list', []):
        if 'rotation' in sd: rot = int(sd['rotation'])
    if abs(rot) % 180 == 90: w, h = h, w
    return dict(W=w, H=h, rot=rot, dur=float(j['format']['duration']))


# ---------------------------------------------------------------- transcricao
def corrigir_nomes(words):
    """Gancho para corrigir nomes que o Whisper escreve errado (ex.: o nome da marca do cliente).
    Por padrao nao faz nada. Para usar: coloque um regex e o texto certo em NOMES_CORRIGIR."""
    NOMES_CORRIGIR = []  # exemplo: [(re.compile(r'(?i)^nomeerrado$'), 'Nome Certo')]
    for w in words:
        t = w['text']; core = t.strip('.,?!;:"\'…')
        for rx, certo in NOMES_CORRIGIR:
            if rx.match(core):
                w['text'] = t.replace(core, certo)

def transcrever(src, work):
    edit = work / 'edit'
    cache = edit / 'transcripts' / (src.stem + '.json')
    if not cache.exists():
        sh(['uv', 'run', '--directory', str(SKILL), 'python', 'helpers/transcribe.py', str(src), '--edit-dir', str(edit), '--language', 'pt'],
           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    words = json.load(open(cache))['words']
    corrigir_nomes(words)
    return [w for w in words if w['end'] > w['start'] - 1e-6]


def sentencas(words):
    out = []; cur = []
    for i, w in enumerate(words):
        if cur and w['start'] - words[cur[-1]]['end'] > 0.8:
            out.append(cur); cur = []
        cur.append(i)
        if w['text'][-1] in '.?!': out.append(cur); cur = []
    if cur: out.append(cur)
    return out


FORTES = {'nunca', 'sempre', 'verdade', 'erro', 'dinheiro', 'milhão', 'milhões', 'bilhão', 'segredo', 'ninguém', 'todo', 'mentira', 'fracasso', 'dívida', 'vida', 'pobre', 'rico'}


def score(words, idxs):
    t = ' '.join(words[i]['text'] for i in idxs).lower()
    s = 2 * ('?' in t) + 2 * bool(re.search(r'\d|%', t)) + sum(1 for w in re.findall(r'\w+', t) if w in FORTES)
    return s / max(1, len(idxs)) ** 0.3


def plano_auto(words, modo):
    """Escolhe janela de 35-55 s com maior pontuacao; gancho = melhor frase nos primeiros 12 s (reordena se preciso)."""
    sents = sentencas(words); sc = [score(words, s) for s in sents]
    dur = lambda ss: words[ss[-1]]['end'] - words[ss[0]]['start']
    best = None
    for a in range(len(sents)):
        tot = 0; b = a
        while b < len(sents) and tot < 52:
            tot = words[sents[b][-1]]['end'] - words[sents[a][0]]['start']; b += 1
            if tot >= 35:
                m = sum(sc[a:b]) / (b - a) + 0.15 * max(sc[a:b])
                if best is None or m > best[0]: best = (m, a, b)
    if best is None: best = (0, 0, len(sents))
    _, a, b = best
    win = list(range(a, b)); hk = max(win[:max(1, len(win) // 3)], key=lambda k: sc[k])
    ordem = [hk] + [k for k in win if k != hk] if hk != win[0] and sc[hk] > 1.5 else win
    segs = [[words[sents[k][0]]['start'], words[sents[k][-1]]['end']] for k in ordem]
    aviso = None if max(sc[k] for k in win) >= 2 else 'AVISO: material sem gancho forte (poucas perguntas/numeros/frases de impacto) - entreguei o melhor trecho possivel.'
    hs = ' '.join(words[i]['text'] for i in sents[ordem[0]]).strip()
    headline = hs if len(hs) <= 70 else hs[:67].rsplit(' ', 1)[0] + '...'
    # planos de camera: a cada ~2,6 s, ciclo de zooms
    zs = [(1.0, 1.10), (1.30, 1.30), (1.0, 1.08), (1.22, 1.22), (1.15, 1.28), (1.40, 1.40)]
    planos = []; last = -9; zi = 0; ult_flash = -9
    for n, k in enumerate(ordem):
        idx = sents[k]; t0 = words[idx[0]]['start']
        flash = n > 0 and (t0 - ult_flash > 6)
        planos.append(dict(t=t0, z=list(zs[zi % 6]), flash=flash, som=('hit' if not any(p['flash'] for p in planos) else 'medio') if flash else None))
        if flash: ult_flash = t0
        zi += 1
        for i in idx[1:]:
            if words[i]['start'] - words[i - 1]['end'] > 0.3 or (words[i - 1]['text'][-1] in ',') :
                if words[i]['start'] - last > 2.6 and words[i]['start'] - t0 > 2.0:
                    planos.append(dict(t=words[i]['start'], z=list(zs[zi % 6]), flash=False, som=None)); zi += 1; last = words[i]['start']
    # destaques (max 2)
    dest = []
    for k in ordem:
        for i in sents[k]:
            tx = words[i]['text']
            if re.search(r'\d', tx) and len(dest) < 2:
                dest.append(dict(t=words[i]['start'], dur=1.3, cy=960, linhas=[[tx.strip('.,?!'), 260, 'ciano', 0]]))
    return dict(headline=headline, segmentos=segs, planos=planos, destaques=dest, cards=[], aviso=aviso)


# ---------------------------------------------------------------- linha do tempo
class TL: pass


def montar(plano, words, a48, modo):
    tl = TL(); tl.plano = plano; SL = G.get('estilo') == 'so-legenda'
    a16 = a48[::3]
    def rms(t, hw=0.005):
        i = int(t * 16000); s = a16[max(0, i - int(hw * 16000)):i + int(hw * 16000)]
        return float(np.sqrt((s ** 2).mean() + 1e-12)) if len(s) else 1.0
    def minpos(t0, t1):
        ts = np.arange(t0, max(t1, t0 + 0.01), 0.004); return float(ts[int(np.argmin([rms(t) for t in ts]))])
    pieces = []
    for t0, t1 in plano['segmentos']:
        ids = [i for i, w in enumerate(words) if w['start'] >= t0 - 0.08 and w['end'] <= t1 + 0.08]
        if not ids: continue
        groups = []; cur = [ids[0]]
        for k in ids[1:]:
            if words[k]['start'] - words[k - 1]['end'] > 0.16: groups.append(cur); cur = [k]
            else: cur.append(k)
        groups.append(cur)
        for g in groups:
            s_ = words[g[0]]['start']; e_ = words[g[-1]]['end']
            ps = minpos(max(0.0, s_ - 0.12, words[g[0] - 1]['end'] if g[0] > 0 else 0.0), s_ + 0.01)
            nx = words[g[-1] + 1]['start'] + 0.02 if g[-1] + 1 < len(words) else e_ + 0.1
            ne = minpos(e_ - 0.02, min(e_ + 0.14, nx))
            pieces.append(dict(s=ps, e=ne, words=g))
    f0 = 0
    for p in pieces:
        p['n'] = max(1, round((p['e'] - p['s']) * FPS)); p['f0'] = f0; f0 += p['n']
    tl.pieces = pieces; tl.TAIL = int(0.45 * FPS); tl.N = f0 + tl.TAIL; tl.words = words

    def s2f(t, lead=0.03):
        best = None
        for p in pieces:
            if p['s'] - 0.05 <= t <= p['e'] + 0.05:
                return p['f0'] + min(p['n'] - 1, int(round(max(0, t - lead - p['s']) * FPS)))
        for p in pieces:
            if p['s'] >= t: return p['f0']
        return pieces[-1]['f0'] + pieces[-1]['n'] - 1
    tl.s2f = s2f
    # planos de camera
    sh_ = []
    for k, p in enumerate(plano['planos']):
        sh_.append([0 if k == 0 else s2f(p['t']), None, p['z'][0], p['z'][1], p])
    sh_.sort(key=lambda x: x[0])
    sh_ = [s for k, s in enumerate(sh_) if k == 0 or s[0] > sh_[k - 1][0] + 2]
    for k in range(len(sh_)): sh_[k][1] = sh_[k + 1][0] if k + 1 < len(sh_) else tl.N
    if SL: sh_ = [[0, tl.N, 1.0, 1.0, {}]]
    tl.shots = sh_
    tl.ramp = {}; tl.hits = []
    for s in ([] if SL else sh_):
        if s[4].get('flash') and s[0] > 3:
            for j, a in enumerate((0.30, 0.62, 0.92)): tl.ramp[s[0] - 3 + j] = (a, bool(s[4].get('branco')))
        if s[4].get('som'): tl.hits.append((s[0], s[4]['som']))
    if not SL:
        for j, a in enumerate((0.30, 0.62, 0.92)): tl.ramp[tl.N - 3 + j] = (a, False)
    tl.head_end = int(8 * FPS) if SL else (sh_[1][0] if len(sh_) > 1 else int(3.4 * FPS))
    # destaques
    COR = dict(branco=gfx2.WHITE, ciano=gfx2.CYAN, vermelho=gfx2.RED)
    tl.hls = []
    dests = plano.get('destaques', [])
    if modo == 'rapido': dests = dests[:2]
    if SL: dests = []
    for d in dests:
        f_a = s2f(d['t']); f_b = min(tl.N - 3, f_a + int(d.get('dur', 1.3) * FPS)) if 'fim' not in d else s2f(d['fim'])
        lines = [(l[0], l[1], COR[l[2]], l[3]) for l in d['linhas']]
        blk = gfx2.hl_block(lines, d.get('cy', 960), 900, 0.98 if len(lines) > 1 else 0.78)
        tl.hls.append((f_a, f_b, blk, len(lines) > 1))
    # inserções (só completo)
    tl.cards = []
    if modo == 'completo' and not SL:
        for c in plano.get('cards', []):
            fa = s2f(c['t0'], 0); fb = s2f(c['t1'] - 0.04, 0) + 1
            rel = lambda tt: max(0.0, (s2f(tt, 0) - fa) / FPS)
            if c['tipo'] == 'dots':
                T = dict(lab=0.05, l1=rel(c['l1_t']) - 0.05, fill=rel(c['fill_t']) + 0.05, l2=rel(c['l2_t']) - 0.05)
            else:
                T = dict(lab=0.05, l1=0.05, l2=rel(c['l2_t']) - 0.05, eq=rel(c['eq_t']) - 0.1, lit=rel(c['lit_t']) - 0.05)
            tl.cards.append((fa, fb, c, T))
            if c.get('whoosh', True): tl.hits.append((fa - 4, 'whoosh'))
            if c.get('riser'): tl.hits.append((fb - int(1.6 * FPS), 'riser'))
    # legenda
    toks = []
    for p in pieces:
        for i in p['words']:
            toks.append((i, p['f0'] + int(round(max(0, words[i]['start'] - 0.03 - p['s']) * FPS)), words[i]['text'], p))
    chunks = []; cur = []
    for tk in toks:
        cur.append(tk)
        if SL:
            if len(tk[2].strip(',.?!')) <= 2 and tk is not toks[-1] and tk[2][-1] not in ',.?!': continue
            chunks.append(cur); cur = []
        elif len(cur) >= 4 or tk[2][-1] in ',.?!' or tk is toks[-1]: chunks.append(cur); cur = []
    if cur: chunks.append(cur)
    tl.chunks = chunks; tl.leg = {}
    for ci, ch in enumerate(chunks):
        a_ = ch[0][1]; b_ = chunks[ci + 1][0][1] if ci + 1 < len(chunks) else ch[-1][3]['f0'] + ch[-1][3]['n']
        for f in range(a_, b_): tl.leg[f] = ci
    h, hb, hs, hl = gfx.headline_layer(plano['headline'], bottom=1540, size=52, S=G.get('S', 1)) if SL else gfx.headline_layer(plano['headline'], S=G.get('S', 1))
    ha = np.asarray(h)
    y0, y1, x0, x1 = hb[1], hb[3], hb[0], hb[2]
    tl.head = (max(0, y0 - 2), max(0, x0 - 2), ha[max(0, y0 - 2):y1 + 2, max(0, x0 - 2):x1 + 2].copy())
    return tl


# ---------------------------------------------------------------- render (workers)
G = {}


def lut_grade():
    x = np.arange(256, dtype=np.float32) / 255
    base = np.clip(x * 1.12, 0, 1) ** 0.90
    b = (np.clip(base * 0.96, 0, 1) * 255).astype(np.uint8); g = (base * 255).astype(np.uint8); r = (np.clip(base * 1.04, 0, 1) * 255).astype(np.uint8)
    return np.dstack([b, g, r]).astype(np.uint8)  # (256,1,3)? used per channel


def vignette():
    yy, xx = np.mgrid[0:1920, 0:1080]; r = np.sqrt(((xx - 540) / 540) ** 2 + ((yy - 900) / 1000) ** 2)
    v = (1 - 0.30 * np.clip(r - 0.55, 0, 1) ** 1.4)
    return np.repeat((v * 255).astype(np.uint8)[..., None], 3, 2)


def _face_range(args):
    src, t0, dur, W, H = args
    sc = 1280 / max(W, H); dw, dh = int(W * sc) // 2 * 2, int(H * sc) // 2 * 2
    cmd = ['ffmpeg', '-v', 'error', '-hwaccel', 'videotoolbox', '-ss', f"{t0:.3f}", '-t', f"{dur:.3f}", '-i', str(src),
           '-vf', f'fps=3,scale={dw}:{dh}:flags=fast_bilinear', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-']
    raw = subprocess.run(cmd, capture_output=True).stdout
    fsz = dw * dh * 3; n = len(raw) // fsz
    det = cv2.FaceDetectorYN.create(str(SKILL / 'assets/models/face_detection_yunet_2023mar.onnx'), '', (dw, dh), 0.6, 0.3, 50)
    pts = []
    for k in range(n):
        fr = np.frombuffer(raw[k * fsz:(k + 1) * fsz], np.uint8).reshape(dh, dw, 3)
        _, fs = det.detect(fr)
        if fs is not None and len(fs):
            b = max(fs, key=lambda r: r[2] * r[3]); pts.append((t0 + k / 3.0, float((b[0] + b[2] / 2) / dw), float((b[1] + b[3] / 2) / dh)))
    return pts


def face_all(src, info, pool, work):
    """rosto da gravacao inteira a 3 fps, em paralelo (roda junto com a transcricao). Cache em work/face.json."""
    cache = work / 'face.json'
    if cache.exists() and cache.stat().st_mtime > Path(src).stat().st_mtime: return json.load(open(cache))
    K = 4; d = info['dur'] / K
    res = pool.map(_face_range, [(str(src), k * d, d + 0.05, info['W'], info['H']) for k in range(K)])
    pts = sorted(p for r in res for p in r); json.dump(pts, open(cache, 'w')); return pts


def make_trk(pts):
    if not pts: return lambda t: (0.5, 0.30)
    pt = np.array([q[0] for q in pts]); px = np.array([q[1] for q in pts]); py = np.array([q[2] for q in pts])
    def f(t):
        i0, i1 = np.searchsorted(pt, [t - 2, t + 2]); i1 = max(i1, i0 + 1)
        w = np.exp(-0.5 * ((pt[i0:i1] - t) / 0.6) ** 2) + 1e-9
        if w.sum() < 1e-3: j = int(np.argmin(abs(pt - t))); return float(px[j]), float(py[j])
        return float((w * px[i0:i1]).sum() / w.sum()), float((w * py[i0:i1]).sum() / w.sum())
    return f


def ease(u): return 0.5 - 0.5 * math.cos(math.pi * min(1, max(0, u)))


def make_card(f):
    tl = G['tl']
    for (fa, fb, c, T) in tl.cards:
        if fa <= f < fb:
            ci = tl.leg.get(f); cap = None
            if ci is not None:
                ch_ = tl.chunks[ci]; kcur = 0
                for j, tk in enumerate(ch_):
                    if tk[1] <= f: kcur = j
                cap = ([t[2] for t in ch_], kcur)
            fn = gfx2.card_dots if c['tipo'] == 'dots' else gfx2.card_bars
            img = fn((f - fa) / FPS, T, cap, c)
            return f, cv2.imencode('.png', img, [cv2.IMWRITE_PNG_COMPRESSION, 1])[1].tobytes()
    return f, None


def render_job(args):
    PR = {'read': 0.0, 'proc': 0.0, 'write': 0.0}
    k, piece_ids, out = args
    tl = G['tl']; info = G['info']; src = G['src']; modo = G['modo']
    W, H = info['W'], info['H']
    S = G.get('S', 1); OW, OH = 1080 * S, 1920 * S
    sc = 1.0 if S > 1 else 0.75; Wd, Hd = int(W * sc) // 2 * 2, int(H * sc) // 2 * 2
    if S > 1:  # 4K: HEVC 10 Mbps-classe alta, matriz bt709 explicita (sem lavado), tag hvc1
        encv = ['-vf', 'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p', '-c:v', 'hevc_videotoolbox', '-b:v', '48M', '-tag:v', 'hvc1',
                '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-color_range', 'tv']
    else: encv = ['-c:v', 'h264_videotoolbox', '-b:v', '12M', '-prio_speed', '1', '-pix_fmt', 'yuv420p']
    enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{OW}x{OH}', '-r', '30', '-i', '-'] + encv +
                           ['-r', '30', '-g', '30', str(out)], stdin=subprocess.PIPE)
    lut = G['lut']; vig = G['vig']
    allp = tl.pieces + [dict(s=tl.pieces[-1]['e'], e=tl.pieces[-1]['e'] + tl.TAIL / FPS, n=tl.TAIL, f0=tl.pieces[-1]['f0'] + tl.pieces[-1]['n'], words=[], tail=True)]
    shots = tl.shots
    si = 0
    runs = []
    for pi in piece_ids:
        q = allp[pi]
        if runs and 0 <= q['s'] - allp[runs[-1][-1]]['e'] < 1.5: runs[-1].append(pi)
        else: runs.append([pi])
    first_of = {r[0]: r for r in runs}
    pr = None; cur = 0; s0 = 0.0; last = None
    for pi in piece_ids:
        p = allp[pi]
        trk0 = G['trk']
        if pi in first_of:
            if pr is not None: pr.kill(); pr.wait()
            run = first_of[pi]; s0 = p['s']; lp = allp[run[-1]]
            nfr = int(round((lp['s'] - s0) * FPS)) + lp['n'] + 2
            cmd = ['ffmpeg', '-v', 'error', '-hwaccel', 'videotoolbox', '-ss', f"{s0:.4f}", '-i', str(src), '-t', f"{nfr/FPS+0.2:.3f}",
                   '-vf', (f'fps=30' if S > 1 else f'fps=30,scale={Wd}:{Hd}:flags=fast_bilinear'), '-frames:v', str(nfr), '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-']
            pr = subprocess.Popen(cmd, stdout=subprocess.PIPE, bufsize=Wd * Hd * 3 * 2); cur = 0; last = None
        skip = int(round((p['s'] - s0) * FPS))
        while cur < skip:
            pr.stdout.read(Wd * Hd * 3); cur += 1
        for kk in range(p['n']):
            _t0 = time.time(); buf = pr.stdout.read(Wd * Hd * 3); cur += 1; PR['read'] += time.time() - _t0; _t1 = time.time()
            if len(buf) < Wd * Hd * 3:
                if last is None: raise RuntimeError('sem quadros em %.2f' % p['s'])
                fr = last
            else:
                fr = np.frombuffer(buf, np.uint8).reshape(Hd, Wd, 3); last = fr
            f = p['f0'] + kk
            while si + 1 < len(shots) and f >= shots[si][1]: si += 1
            s = shots[si]; u = (f - s[0]) / max(1, s[1] - s[0] - 1); z = s[2] + (s[3] - s[2]) * ease(u)
            cxn, cyn = trk0(p['s'] + kk / FPS)
            ch = Hd / z; cw = ch * 9 / 16
            if cw > Wd: cw = Wd; ch = cw * 16 / 9
            x0 = int(min(max(cxn * Wd - cw / 2, 0), Wd - cw)); y0 = int(min(max(cyn * Hd - 0.30 * ch, 0), Hd - ch)) if z > 1.01 or ch < Hd - 1 else 0
            crop = fr[y0:y0 + int(ch), x0:x0 + int(cw)]
            img = crop if (crop.shape[1] == OW and crop.shape[0] == OH) else cv2.resize(crop, (OW, OH), interpolation=cv2.INTER_AREA if S == 1 else cv2.INTER_CUBIC)
            if not img.flags['C_CONTIGUOUS'] or not img.flags['WRITEABLE']: img = np.ascontiguousarray(img).copy()
            if G['estilo'] != 'so-legenda':
                img = cv2.merge([cv2.LUT(img[..., 0], lut[0]), cv2.LUT(img[..., 1], lut[1]), cv2.LUT(img[..., 2], lut[2])])
                img = cv2.multiply(img, vig, scale=1 / 255)
            card = None
            if f in G['cardpng']: card = cv2.imdecode(np.frombuffer(G['cardpng'][f], np.uint8), cv2.IMREAD_COLOR)
            if card is not None: img = card
            else:
                hid = False
                for (ha, hb, blk, multi) in tl.hls:
                    if ha <= f < hb:
                        img = gfx2.hl_apply(img, blk, (f - ha) / FPS); hid = hid or multi
                if f in tl.leg and not p.get('tail') and not hid:
                    if G['estilo'] == 'so-legenda': y_, x_, a_ = gfx2.legend_word([t[2] for t in tl.chunks[tl.leg[f]]], 1230, S=S)
                    else: y_, x_, a_ = gfx2.legend_layer([t[2] for t in tl.chunks[tl.leg[f]]], 1010 if f < tl.head_end else 1290)
                    img = gfx2.blend(img, y_, x_, a_)
            if f < tl.head_end:
                img = gfx2.blend(img, *tl.head)
            if f in tl.ramp:
                a, br = tl.ramp[f]; col = (255, 255, 255) if br else (140, 200, 255)
                img = cv2.addWeighted(img, 1 - a, np.full_like(img, col), a, 0)
            PR['proc'] += time.time() - _t1; _t2 = time.time(); enc.stdin.write(img.tobytes()); PR['write'] += time.time() - _t2
    if pr is not None: pr.kill(); pr.wait()
    enc.stdin.close(); enc.wait()
    if os.environ.get('PROF'): print('PROF', k, {a: round(b, 1) for a, b in PR.items()}, flush=True)
    return str(out)


# ---------------------------------------------------------------- audio
def audio_job(args):
    tl_hits, pieces, N, a48, work, NT = args
    voice = np.zeros(N, np.float32)
    for p in pieces:
        o = int(round(p['f0'] / FPS * SR)); L = int(round(p['n'] / FPS * SR)); s = int(round(p['s'] * SR))
        seg = a48[s:s + L].copy(); fi = int(0.004 * SR); fo = int(0.007 * SR)
        seg[:fi] *= np.linspace(0, 1, fi); seg[-fo:] *= np.linspace(1, 0, fo); voice[o:o + len(seg)] = seg
    wavfile.write(work / 'voice_raw.wav', SR, voice)
    sh(['ffmpeg', '-v', 'error', '-y', '-i', str(work / 'voice_raw.wav'), '-af', 'highpass=f=75,acompressor=threshold=-24dB:ratio=3:attack=8:release=120:makeup=4,loudnorm=I=-14:TP=-2:LRA=7',
        '-ar', str(SR), '-ac', '1', str(work / 'voice_n.wav')])
    _, v = wavfile.read(work / 'voice_n.wav'); v = v.astype(np.float32)
    if abs(v).max() > 2: v = v / 32768
    v = np.pad(v, (0, max(0, N - len(v))))[:N]
    env = np.sqrt(np.convolve(v ** 2, np.ones(int(0.05 * SR)) / int(0.05 * SR), 'same')); speak = env > np.percentile(env, 40)
    vr = np.sqrt((v[speak] ** 2).mean())
    ld = lambda n: wavfile.read(HERE / 'sons' / f'{n}.wav')[1].astype(np.float32)
    t = np.arange(N) / SR
    bed = np.zeros(N, np.float32) if G.get('estilo') == 'so-legenda' else ld('drone')[:N]; bed = np.pad(bed, (0, N - len(bed)))
    fade = np.minimum(1, t / 1.5) * np.clip((NT - t) / 0.6, 0, 1); bed = bed * fade * vr * 10 ** (-23 / 20)
    envs = sg.lfilter(*sg.butter(1, 6, 'low', fs=SR), speak.astype(np.float32)); bed *= (1 - 0.29 * envs.clip(0, 1))
    fx = np.zeros(N, np.float32)
    def put(x, ts, db):
        i = max(0, int(ts * SR)); x = x * vr * 10 ** (db / 20) * 3.0; e = min(N, i + len(x)); fx[i:e] += x[:e - i]
    first = True
    for f, kind in sorted(tl_hits):
        tsec = f / FPS
        if kind == 'hit': put(ld('hit_grande'), tsec, 2)
        elif kind == 'medio': put(ld('hit_medio'), tsec, 0)
        elif kind == 'final': put(ld('hit_grande'), tsec, 3)
        elif kind == 'whoosh': put(ld('whoosh'), tsec - 0.05, -9)
        elif kind == 'riser': put(ld('riser'), tsec, -9)
    if G.get('estilo') != 'so-legenda': put(ld('hit_final'), NT - 0.14, 3)
    mix = v if G.get('estilo') == 'so-legenda' else v + bed + fx
    wavfile.write(work / 'mix_pre.wav', SR, np.stack([mix, mix], 1).astype(np.float32))
    sh(['ffmpeg', '-v', 'error', '-y', '-i', str(work / 'mix_pre.wav'), '-af', 'alimiter=limit=0.84:level=false,loudnorm=I=-14:TP=-1.5:LRA=7', '-ar', '48000', str(work / 'mix.wav')])
    return 'ok'


# ---------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('bruto'); ap.add_argument('--modo', default='rapido', choices=['rapido', 'completo'])
    ap.add_argument('--cliente', default='cliente-exemplo'); ap.add_argument('--plano'); ap.add_argument('--nome')
    ap.add_argument('--saida-dir'); ap.add_argument('--sem-aviso', action='store_true'); ap.add_argument('--so-transcrever', action='store_true')
    ap.add_argument('--workers', type=int, default=6); ap.add_argument('--estilo', default='padrao', choices=['padrao','so-legenda'])
    ap.add_argument('--res', default='1080', choices=['1080','4k'], help='4k = 2160x3840 (HEVC, tipografia dobrada; so no estilo so-legenda)')
    a = ap.parse_args()
    src = Path(a.bruto).resolve(); t_start = time.time()
    work = Path.home() / 'Movies/agencia-palestras' / src.stem; work.mkdir(parents=True, exist_ok=True)
    info = sonda(src); lap(f"sonda ({info['W']}x{info['H']} orientado, rotacao {info['rot']}, {info['dur']:.0f}s)")
    # transcricao || decodificacao do audio
    ctx = get_context('fork')
    with ctx.Pool(5) as pool:
        r_tr = pool.apply_async(transcrever, (src, work))
        r_au = pool.apply_async(lambda_audio, (str(src),))
        pts = face_all(src, info, pool, work)
        words = r_tr.get(); a48 = r_au.get()
    lap(f"transcricao ({len(words)} palavras) + audio + rosto (em paralelo)")
    sents = sentencas(words)
    with open(work / 'transcricao.txt', 'w') as fh:
        for k, s in enumerate(sents): fh.write(f"[{k}] {words[s[0]]['start']:.1f}-{words[s[-1]]['end']:.1f}  " + ' '.join(words[i]['text'] for i in s) + '\n')
    if a.so_transcrever:
        print(open(work / 'transcricao.txt').read()); return
    plano = json.load(open(a.plano)) if a.plano else plano_auto(words, a.modo)
    if not a.plano: json.dump(plano, open(work / 'plano-auto.json', 'w'), ensure_ascii=False, indent=1)
    if plano.get('aviso'): print(plano['aviso'])
    G['estilo'] = a.estilo; G['S'] = 2 if a.res == '4k' else 1
    if G['S'] > 1 and a.estilo != 'so-legenda': sys.exit('--res 4k so esta implementado no estilo so-legenda')
    tl = montar(plano, words, a48, a.modo); NT = tl.N / FPS
    lap(f"plano + linha do tempo ({len(tl.pieces)} pedacos, {NT:.1f}s, {len(tl.shots)} enquadramentos, modo {a.modo})")
    G['estilo'] = a.estilo
    G.update(tl=tl, info=info, src=src, modo=a.modo, trk=make_trk(pts))
    x = np.arange(256, dtype=np.float32) / 255; base = np.clip(x * 1.12, 0, 1) ** 0.90
    G['lut'] = [(np.clip(base * 0.96, 0, 1) * 255).astype(np.uint8), (base * 255).astype(np.uint8), (np.clip(base * 1.04, 0, 1) * 255).astype(np.uint8)]
    G['vig'] = vignette()
    # pre-aquece caches (legenda, headline) antes do fork
    for ch in tl.chunks:
        for yy in (1010, 1290): gfx2.legend_layer([t[2] for t in ch], yy)
        gfx2.legend_word([t[2] for t in ch], 1230, S=G.get('S', 1))
    # divide pedacos em grupos contiguos balanceados
    allp = tl.pieces + [dict(n=tl.TAIL)]
    tot = sum(p['n'] for p in allp); K = max(1, min(a.workers, len(allp))); groups = []; cur = []; acc = 0
    for i, p in enumerate(allp):
        cur.append(i); acc += p['n']
        if acc >= tot / K * (len(groups) + 1) and len(groups) < K - 1: groups.append(cur); cur = []
    if cur: groups.append(cur)
    segs = [work / f'seg{k}.mp4' for k in range(len(groups))]
    G['cardpng'] = {}
    cf = [f for (fa, fb, c, T) in tl.cards for f in range(fa, fb)]
    if cf:
        with ctx.Pool(8) as pc: G['cardpng'] = dict(pc.map(make_card, cf, chunksize=6))
        lap(f'inserções pré-renderizadas ({len(cf)} quadros, 8 processos)')
    with ctx.Pool(len(groups) + 1) as pool:
        r_a = pool.apply_async(audio_job, ((tl.hits, tl.pieces, int(round(NT * SR)), a48, work, NT),))
        outs = pool.map(render_job, [(k, g, segs[k]) for k, g in enumerate(groups)], chunksize=1)
        r_a.get()
    lap(f"render paralelo ({len(groups)} processos, VideoToolbox) + audio")
    with open(work / 'segs.txt', 'w') as fh:
        for s_ in segs: fh.write(f"file '{s_}'\n")
    # saida
    dia = datetime.date.today().isoformat()
    outdir = Path(a.saida_dir) if a.saida_dir else ROOT / 'entregas/clientes' / a.cliente / 'videos' / dia
    outdir.mkdir(parents=True, exist_ok=True)
    nome = a.nome or f"palestra-{len(list(outdir.glob('palestra-*.mp4'))) // 2 + 1}-{src.stem.lower()}"
    out = outdir / f'{nome}.mp4'; leve = outdir / f'{nome}-leve.mp4'
    sh(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', str(work / 'segs.txt'), '-i', str(work / 'mix.wav'),
        '-map', '0:v', '-map', '1:a', '-c:v', 'copy'] + (['-tag:v', 'hvc1', '-bsf:v', 'hevc_metadata=colour_primaries=1:transfer_characteristics=1:matrix_coefficients=1:video_full_range_flag=0'] if G['S'] > 1 else []) + ['-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', str(out),
        '-map', '0:v', '-map', '1:a'] + (['-vf', 'scale=1080:1920:flags=lanczos,format=yuv420p'] if G['S'] > 1 else []) + ['-c:v', 'h264_videotoolbox', '-b:v', '1450k', '-maxrate', '1800k', '-bufsize', '3000k', '-pix_fmt', 'yuv420p',
        '-c:a', 'aac', '-b:a', '96k', '-shortest', '-movflags', '+faststart', str(leve)])
    lap('mux + versao leve (uma passada, duas saidas)')
    icloud = Path.home() / 'Library/Mobile Documents/com~apple~CloudDocs/Agência/Prontos'
    if icloud.is_dir():
        shutil.copy2(out, icloud / out.name); shutil.copy2(leve, icloud / leve.name); print('copiado para iCloud/Agência/Prontos')
    if not a.sem_aviso:
        subprocess.run(['node', str(ROOT / 'ferramentas/video-pronto.mjs'), str(out), a.cliente, 'palestra', nome], cwd=str(ROOT))
    lap('entrega')
    tot_s = time.time() - t_start
    print('\nTEMPO POR ETAPA'); [print(f"  {fmt(s)}  {n}") for n, s in TS]
    print(f"  {fmt(tot_s)}  TOTAL  ->  {out}  ({out.stat().st_size/1e6:.1f} MB)  leve {leve.stat().st_size/1e6:.1f} MB")


def lambda_audio(src):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-vn', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.float32).copy()


if __name__ == '__main__':
    main()
