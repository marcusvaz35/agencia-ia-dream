"""Cartão de frase — cópia EXATA do vídeo base do cliente (use o SEU video-base.mp4).

Medido em `video-base.mp4` (720x1280, 6,2 s) e escalado x1,5 para 1080x1920:
- fundo preto puro; texto branco Hoefler Text Regular, 68 px, centralizado, passo de linha 75 px,
  largura máxima ~0,70 da tela (as linhas quebram por largura; "/" força quebra; linha vazia = parágrafo);
- aspa de abertura amarela (#FFD71D, glifo Impact) FIXA em x=218 (0,20 da tela), 68x62 px, acima do texto;
- aspa de fechamento amarela FIXA com a borda direita em x=872 (0,807 da tela), abaixo do texto;
- @cliente pequeno, cinza (70,70,70), centralizado, na altura do topo da aspa de fechamento;
- bloco (topo da aspa de abertura -> fim da aspa de fechamento) centrado em 0,466 da altura;
- duração 6,2 s; ÁUDIO = o áudio do vídeo base, igual, do início (mesma música no mesmo tempo).

Uso:
  uv run --directory ~/.claude/skills/editor-video python "__PASTA_AGENCIA__/ferramentas/frase-0600/gerar.py" \
     --texto "Acredite, mas se mova. / Ore, mas tome posição." --saida saida.mp4 [--png previa.png]
  (texto com linhas em branco: use --arquivo texto.txt)
"""
import argparse, os, subprocess, tempfile
from PIL import Image, ImageDraw, ImageFont

AQUI = os.path.dirname(os.path.abspath(__file__))
BASE = os.path.join(AQUI, 'video-base.mp4')
W, H = 1080, 1920
FONTE = ('/System/Library/Fonts/Supplemental/Hoefler Text.ttc', 0)
ASPA = '/System/Library/Fonts/Supplemental/Impact.ttf'
TAM, PASSO = 68, 73
LARG_MAX = 2000  # nunca quebra sozinho: as quebras vêm do texto (cópia das referências)
LARG_AJUSTE = 860  # linha mais larga permitida (~0,80 da tela)
AMARELO = (255, 215, 29)
CINZA = (70, 70, 70)
ASPA_W, ASPA_H = 68, 62
ABRE_X = 218
FECHA_DIR = 872
GAP_ABRE = 50      # fim da aspa de abertura -> topo da 1ª linha (base: 439 -> 472 no 720 = 33 px x1,5)
GAP_FECHA = 48     # fim da última linha -> topo da aspa de fechamento (base: 720 -> 752 = 32 x1,5)
CENTRO_Y = 0.468


def quebrar(par, fonte):
    linhas = []
    for trecho in par.split(' / '):
        atual = ''
        for p in trecho.split():
            t = (atual + ' ' + p).strip()
            if fonte.getlength(t) <= LARG_MAX or not atual:
                atual = t
            else:
                linhas.append(atual); atual = p
        if atual:
            linhas.append(atual)
    return linhas


def aspa(char):
    f = ImageFont.truetype(ASPA, 400)
    t = Image.new('L', (700, 700), 0)
    ImageDraw.Draw(t).text((50, 0), char, font=f, fill=255)
    t = t.crop(t.getbbox()).resize((ASPA_W, ASPA_H), Image.LANCZOS)
    cor = Image.new('RGB', t.size, AMARELO)
    return cor, t


def desenhar(texto, caminho):
    # Tamanho: o do vídeo base (68). Se a linha mais larga (quebras do texto) passar de LARG_AJUSTE,
    # a letra diminui só o necessário para caber — como nos posts originais com texto longo.
    global PASSO
    tam = TAM
    f0 = ImageFont.truetype(FONTE[0], TAM, index=FONTE[1])
    maior = max(f0.getlength(l.strip()) for l in texto.split('\n') if l.strip())
    if maior > LARG_AJUSTE:
        tam = int(TAM * LARG_AJUSTE / maior)
    PASSO = round(73 * tam / TAM)
    fonte = ImageFont.truetype(FONTE[0], tam, index=FONTE[1])
    linhas = []
    for i, par in enumerate([p for p in texto.strip().split('\n\n')]):
        if i:
            linhas.append('')
        for sub in par.strip().split('\n'):
            linhas += quebrar(sub.strip(), fonte)
    asc = fonte.getbbox('É')[1]            # topo do acento em relação à origem
    alt_texto = PASSO * (len(linhas) - 1) + fonte.getbbox('Ég')[3] - asc
    bloco = ASPA_H + GAP_ABRE + alt_texto + GAP_FECHA + ASPA_H
    topo = int(H * CENTRO_Y - bloco / 2)
    img = Image.new('RGB', (W, H), (0, 0, 0))
    d = ImageDraw.Draw(img)
    cor, m = aspa('“'); img.paste(cor, (ABRE_X, topo), m)
    y0 = topo + ASPA_H + GAP_ABRE - asc
    for i, l in enumerate(linhas):
        if l:
            d.text((W / 2, y0 + i * PASSO), l, font=fonte, fill=(255, 255, 255), anchor='ma')
    fim_texto = topo + ASPA_H + GAP_ABRE + alt_texto
    yf = fim_texto + GAP_FECHA
    cor, m = aspa('”'); img.paste(cor, (FECHA_DIR - ASPA_W, yf), m)
    fa = ImageFont.truetype(FONTE[0], 23, index=0)
    d.text((W / 2, yf + 2), '@cliente', font=fa, fill=CINZA, anchor='ma')
    img.save(caminho)
    return linhas


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--texto'); ap.add_argument('--arquivo'); ap.add_argument('--saida', required=True)
    ap.add_argument('--png')
    a = ap.parse_args()
    texto = open(a.arquivo, encoding='utf-8').read() if a.arquivo else a.texto
    png = a.png or os.path.join(tempfile.mkdtemp(), 'cartao.png')
    linhas = desenhar(texto, png)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-loop', '1', '-framerate', '30', '-i', png, '-i', BASE,
                    '-map', '0:v', '-map', '1:a', '-t', '6.2', '-c:v', 'libx264', '-preset', 'slow', '-crf', '16',
                    '-pix_fmt', 'yuv420p', '-r', '30', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart',
                    a.saida], check=True)
    print('ok', a.saida, len(linhas), 'linhas')


if __name__ == '__main__':
    main()
