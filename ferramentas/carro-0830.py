"""Edição rápida do vídeo falado do cliente (gravado no carro, em casa…) no padrão do CEO — 2 comandos.

Padrão (clientes/<cliente>/GRADE-DIARIA.md, seção do vídeo falado; referência em clientes/<cliente>/referencias/):
gancho de fala no começo · headline em caixa branca CENTRALIZADA com texto centralizado (preto negrito, altura do peito,
primeiros ~5 s) · legenda 1 palavra por vez (branca, sombra, centro, logo acima da headline) · nenhum respiro
≥ 0,2 s · sem muletas ("éééé", "então", "iiii") e sem frase repetida (fica a última versão, a certa) · sem trilha.

1) PREPARAR (≈ 2–3 min): converte HDR→SDR no disco interno, transcreve palavra por palavra, marca sozinho as
   muletas e repetições e escreve <pasta>/texto.txt (para ler) e <pasta>/plano.json (para ajustar).
     uv run --directory ~/.claude/skills/editor-video python "<este arquivo>" preparar "<bruto.MOV>"
2) Ajustar plano.json: "headline", "gancho" ([i, j] = palavras que vão para o começo), "cortar_extra"
   (["i-j", ...]), "manter" (["i-j"] para desmarcar um corte automático), "trocar" ({"i": "palavra certa"}).
3) RENDERIZAR (≈ 3–5 min): corta, monta gancho + corpo, aplica headline e legenda, volume −14 LUFS e grava o
   final + a versão leve (< 9,5 MB, para enviar pelo navegador) + 6 quadros para conferir.
     uv run --directory ~/.claude/skills/editor-video python "<este arquivo>" renderizar "<pasta>/plano.json" "<saida.mp4>"
"""
import json
import os
import re
import subprocess
import sys
import time
import unicodedata
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H, FPS = 1080, 1920, 30
TRABALHO = Path.home() / 'Movies' / 'agencia-carro'
AVENIR = '/System/Library/Fonts/Avenir Next.ttc'  # índice 0 = Bold
SKILL = Path.home() / '.claude' / 'skills' / 'editor-video' / 'helpers'

# Medidas da referência (720x1280 → 1080x1920)
HL_X, HL_Y, HL_TAM, HL_LARG = 140, 1300, 58, 740      # headline: margem esq., topo, fonte, largura máx. do texto
LEG_Y, LEG_TAM = 1230, 76                             # legenda: centro vertical da palavra, fonte
GAP_MAX = 0.16      # silêncio máximo que fica dentro de um trecho (regra: nada ≥ 0,2 s)
PAD_INI, PAD_FIM = 0.03, 0.08

MULETAS_SEMPRE = {'eh', 'ehh', 'ah', 'ahn', 'hã', 'han', 'hum', 'humm', 'hmm', 'uh', 'ãh', 'ã', 'éé', 'ééé', 'eee', 'iii'}
MULETAS_SE_ARRASTADA = {'é', 'e', 'i', 'então', 'entao', 'tipo', 'assim', 'né', 'aí', 'ai', 'bom', 'olha'}


def norm(t):
    t = unicodedata.normalize('NFC', t.lower())
    return re.sub(r"[^\wà-úç]+", '', t)


def sh(cmd):
    subprocess.run(cmd, check=True)


def fonte(tam):
    return ImageFont.truetype(AVENIR, tam, index=0)


# ---------------------------------------------------------------- preparar
def preparar(bruto):
    t0 = time.time()
    bruto = Path(bruto).absolute()
    pasta = TRABALHO / bruto.stem
    pasta.mkdir(parents=True, exist_ok=True)
    trc = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=color_transfer',
                          '-of', 'csv=p=0', str(bruto)], capture_output=True, text=True).stdout.strip()
    sdr = pasta / f'{bruto.stem}-sdr.mp4'
    if not sdr.exists():
        if trc in ('arib-std-b67', 'smpte2084'):
            sh(['avconvert', '-s', str(bruto), '-p', 'Preset1920x1080', '-o', str(sdr), '--replace'])
        else:
            sh(['ffmpeg', '-v', 'error', '-y', '-i', str(bruto), '-c', 'copy', str(sdr)])
    t1 = time.time()
    sys.path.insert(0, str(SKILL))
    from transcribe import transcribe_one  # noqa: E402
    tj = transcribe_one(sdr, edit_dir=pasta, verbose=False)
    words = json.loads(Path(tj).read_text())['words']
    t2 = time.time()

    pal = [{'i': i, 'texto': w['text'].strip(), 'ini': round(w['start'], 3), 'fim': round(w['end'], 3), 'cortar': '', }
           for i, w in enumerate(words)]
    # muletas
    for k, p in enumerate(pal):
        n = norm(p['texto'])
        dur = p['fim'] - p['ini']
        antes = p['ini'] - pal[k - 1]['fim'] if k else 1
        depois = pal[k + 1]['ini'] - p['fim'] if k + 1 < len(pal) else 1
        if n in MULETAS_SEMPRE or re.fullmatch(r'(e|é|i|a|ã)\1{1,}', n or 'x'):
            p['cortar'] = 'muleta'
        elif n in MULETAS_SE_ARRASTADA and (dur > 0.45 or (antes > 0.3 and depois > 0.3)):
            p['cortar'] = 'muleta (arrastada/solta)'
    # repetições / começos falsos: bloco de n palavras que se repete logo adiante → corta a 1ª versão
    ns = [norm(p['texto']) for p in pal]
    for n in range(6, 0, -1):
        for i in range(len(pal) - n):
            if any(pal[k]['cortar'] for k in range(i, i + n)) or not all(ns[i:i + n]):
                continue
            for salto in range(0, 4):  # até 3 palavras soltas entre as duas versões
                j = i + n + salto
                if j + n <= len(pal) and ns[i:i + n] == ns[j:j + n]:
                    if salto == 0:  # "a gente dá, a gente dá…" = começo falso → corta a 1ª
                        for k in range(i, j):
                            if not pal[k]['cortar']:
                                pal[k]['cortar'] = f'repetição (fica a de #{j})'
                    elif n >= 3:  # pode ser correção OU paralelismo de propósito → só sugere
                        for k in range(i, j):
                            if not pal[k]['cortar']:
                                pal[k]['sugestao'] = f'talvez repetição (fica a de #{j})'
                    break
    plano = {'fonte': str(sdr), 'headline': '', 'gancho': None, 'cortar_extra': [], 'manter': [], 'trocar': {},
             'headline_seg': 5.0, 'palavras': pal}
    (pasta / 'plano.json').write_text(json.dumps(plano, ensure_ascii=False, indent=1))
    escrever_texto(pasta, pal)
    print(f'pasta: {pasta}\nSDR {t1 - t0:.0f}s · transcrição {t2 - t1:.0f}s · {len(pal)} palavras · '
          f'{sum(1 for p in pal if p["cortar"])} marcadas para cortar')
    print(f'leia: {pasta / "texto.txt"}')


def escrever_texto(pasta, pal):
    linhas, atual = [], []
    for p in pal:
        atual.append(p)
        if re.search(r'[.?!]$', p['texto']) or len(atual) >= 28:
            linhas.append(atual)
            atual = []
    if atual:
        linhas.append(atual)
    out = []
    for ln in linhas:
        txt = ' '.join(f"[{p['texto']}]" if p['cortar'] else ('{' + p['texto'] + '}' if p.get('sugestao') else p['texto'])
                       for p in ln)
        out.append(f"#{ln[0]['i']}-{ln[-1]['i']} ({ln[0]['ini']:.1f}s) {txt}")
    out.append('\n[entre colchetes] = cortado automaticamente (muleta ou começo falso repetido)'
               '\n{entre chaves} = talvez repetição/correção — decidir (cortar_extra) ou deixar')
    (pasta / 'texto.txt').write_text('\n'.join(out))


# ---------------------------------------------------------------- renderizar
def faixas(lista):
    r = set()
    for f in lista:
        a, _, b = str(f).partition('-')
        r.update(range(int(a), int(b or a) + 1))
    return r


def trechos(pal, idx):
    """Palavras mantidas (em ordem) → trechos [ini, fim] da fonte sem respiro ≥ 0,2 s."""
    seg = []
    for k, i in enumerate(idx):
        p = pal[i]
        ini = p['ini'] - PAD_INI
        fim = p['fim'] + PAD_FIM
        if k + 1 < len(idx) and idx[k + 1] == i + 1:
            fim = min(fim, pal[i + 1]['ini'])  # não invade a próxima palavra
        if seg and idx[k - 1] == i - 1 and p['ini'] - pal[i - 1]['fim'] < GAP_MAX:
            seg[-1][1] = max(seg[-1][1], fim)
        else:
            if k and seg and idx[k - 1] == i - 1:
                ini = max(ini, pal[i - 1]['fim'])
            seg.append([max(0.0, ini), fim, []])
        seg[-1][2].append(i)
    return seg


def render_parte(fonte, segs, saida):
    expr = '+'.join(f'between(t,{a:.3f},{b:.3f})' for a, b, _ in segs)
    sh(['ffmpeg', '-v', 'error', '-y', '-i', fonte, '-filter_complex',
        f"[0:v]fps={FPS},select='{expr}',setpts=N/{FPS}/TB,scale={W}:{H},setsar=1[v];"
        f"[0:a]aselect='{expr}',asetpts=N/SR/TB[a]",
        '-map', '[v]', '-map', '[a]', '-c:v', 'h264_videotoolbox', '-b:v', '20M', '-c:a', 'pcm_s16le', saida])


def caixa_headline(img, texto):
    f = fonte(HL_TAM)
    palavras, linhas, atual = texto.split(), [], ''
    for w in palavras:
        t = (atual + ' ' + w).strip()
        if f.getlength(t) <= HL_LARG:
            atual = t
        else:
            linhas.append(atual)
            atual = w
    linhas.append(atual)
    d = ImageDraw.Draw(img)
    # Padrão do CEO (11/11/2026): caixa centralizada na tela e texto centralizado dentro dela
    passo, padx, pady = int(HL_TAM * 1.25), 30, 14
    larg = max(f.getlength(ln) for ln in linhas) + 2 * padx
    x0 = (W - larg) / 2
    alt = passo * len(linhas) + 2 * pady
    d.rounded_rectangle([x0, HL_Y, x0 + larg, HL_Y + alt], radius=22, fill='white')
    y = HL_Y + pady
    for ln in linhas:
        topo = f.getbbox(ln)
        d.text(((W - f.getlength(ln)) / 2, y + (passo - (topo[3] + topo[1])) / 2), ln, font=f, fill='black')
        y += passo


def quadro(palavra, headline, caminho):
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    if headline:
        caixa_headline(img, headline)
    if palavra:
        f = fonte(LEG_TAM)
        lw = f.getlength(palavra)
        x, y = (W - lw) / 2, LEG_Y - LEG_TAM * 0.6
        sombra = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        ImageDraw.Draw(sombra).text((x + 2, y + 3), palavra, font=f, fill=(0, 0, 0, 200))
        img = Image.alpha_composite(img, sombra.filter(ImageFilter.GaussianBlur(4)))
        ImageDraw.Draw(img).text((x, y), palavra, font=f, fill='white')
    img.save(caminho)


def renderizar(plano_path, saida):
    t0 = time.time()
    plano_path = Path(plano_path)
    pasta = plano_path.parent
    pl = json.loads(plano_path.read_text())
    pal = pl['palavras']
    for k, v in pl.get('trocar', {}).items():
        pal[int(k)]['texto'] = v
    cortar = {p['i'] for p in pal if p['cortar']} | faixas(pl.get('cortar_extra', []))
    cortar -= faixas(pl.get('manter', []))
    gancho = set(range(pl['gancho'][0], pl['gancho'][1] + 1)) if pl.get('gancho') else set()
    corpo_idx = [p['i'] for p in pal if p['i'] not in cortar and p['i'] not in gancho]
    gancho_idx = [i for i in sorted(gancho) if i not in cortar]

    partes, tempo_palavra = [], []  # (arquivo, duração) e (i, t_saida_ini)
    t_out = 0.0
    for nome, idx in (('gancho', gancho_idx), ('corpo', corpo_idx)):
        if not idx:
            continue
        segs = trechos(pal, idx)
        arq = pasta / f'parte-{nome}.mov'
        render_parte(pl['fonte'], segs, str(arq))
        for a, b, ids in segs:
            for i in ids:
                tempo_palavra.append((i, t_out + max(0.0, pal[i]['ini'] - a)))
            t_out += round((b - a) * FPS) / FPS
        partes.append(arq)
    dur = t_out
    t1 = time.time()

    # legenda (1 palavra por vez) + headline nos primeiros segundos → sequência de PNG com duração
    qd = pasta / 'quadros'
    qd.mkdir(exist_ok=True)
    for f in qd.glob('*.png'):
        f.unlink()
    hl_fim = min(pl.get('headline_seg', 5.0), dur)
    eventos = []
    for k, (i, t) in enumerate(tempo_palavra):
        fim = tempo_palavra[k + 1][1] if k + 1 < len(tempo_palavra) else dur
        eventos.append((t, fim, pal[i]['texto']))
    cortes_t = sorted({0.0, hl_fim, dur} | {e[0] for e in eventos} | {e[1] for e in eventos})
    lista, cache = [], {}
    for a, b in zip(cortes_t, cortes_t[1:]):
        if b - a < 1e-3:
            continue
        palavra = next((tx for s, e, tx in eventos if s <= a < e), '')
        hl = pl['headline'] if a < hl_fim else ''
        chave = (palavra, hl)
        if chave not in cache:
            cache[chave] = qd / f'{len(cache):04d}.png'
            quadro(palavra, hl, cache[chave])
        lista.append((cache[chave], b - a))
    txt = pasta / 'quadros.txt'
    txt.write_text(''.join(f"file '{p}'\nduration {d:.4f}\n" for p, d in lista) + f"file '{lista[-1][0]}'\n")
    conc = pasta / 'partes.txt'
    conc.write_text(''.join(f"file '{p}'\n" for p in partes))
    t2 = time.time()

    saida = Path(saida)
    leve = saida.with_name(saida.stem + '-leve.mp4')
    kbps = int(9.3 * 8 * 1024 / dur) - 130
    sh(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', str(conc),
        '-f', 'concat', '-safe', '0', '-i', str(txt), '-filter_complex',
        f'[1:v]fps={FPS},format=rgba[t];[0:v][t]overlay=0:0:shortest=1,format=yuv420p,split[v1][v2];'
        '[0:a]loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000,asplit[a1][a2]',
        '-map', '[v1]', '-map', '[a1]', '-c:v', 'h264_videotoolbox', '-b:v', '12M',
        '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
        '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', str(saida),
        '-map', '[v2]', '-map', '[a2]', '-c:v', 'libx264', '-preset', 'fast', '-b:v', f'{kbps}k',
        '-maxrate', f'{int(kbps * 1.5)}k', '-bufsize', f'{kbps * 2}k',
        '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
        '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', str(leve)])
    t3 = time.time()
    folha = saida.with_name(saida.stem + '-conferir.jpg')
    sh(['ffmpeg', '-v', 'error', '-y', '-i', str(saida), '-vf',
        f'fps=6/{dur:.2f},scale=270:-1,tile=6x1', '-frames:v', '1', str(folha)])
    texto_final = ' '.join(pal[i]['texto'] for i, _ in tempo_palavra)
    (saida.with_name(saida.stem + '-texto.txt')).write_text(texto_final)
    print(f'final: {saida} ({dur:.1f}s) · leve: {leve} ({leve.stat().st_size / 1e6:.1f} MB) · conferir: {folha}')
    print(f'tempos: cortes {t1 - t0:.0f}s · textos {t2 - t1:.0f}s · render {t3 - t2:.0f}s · total {time.time() - t0:.0f}s')


if __name__ == '__main__':
    if len(sys.argv) >= 3 and sys.argv[1] == 'preparar':
        preparar(sys.argv[2])
    elif len(sys.argv) >= 4 and sys.argv[1] == 'renderizar':
        renderizar(sys.argv[2], sys.argv[3])
    else:
        print(__doc__)
