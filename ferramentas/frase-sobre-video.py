"""Gera o post de frase por cima de um trecho curto do cliente (padrão da referência do CEO).

Padrão (medido no vídeo de referência, 3,8 s, 1080x1920):
- vídeo do cliente escurecido, ocupando a tela toda (9:16);
- texto branco, negrito, alinhado à esquerda, margem ~124 px, bloco no meio da tela;
- estrutura: [título opcional, ex. "Assim diz o Senhor:"] · linha em branco · "frase entre aspas" · linha em branco · [referência, ex. "Colossenses 3:23-24"];
- texto parado do começo ao fim, sem animação; duração máxima 5 s.

Uso (roda no ambiente do EDIT IA PRO, que tem a biblioteca Pillow):
  uv run --directory ~/.claude/skills/editor-video python "__PASTA_AGENCIA__/ferramentas/frase-sobre-video.py" \
    --video "<vídeo base>" --frase "Faça o seu trabalho..." --titulo "Assim diz o Senhor:" --ref "Colossenses 3:23-24" \
    --inicio 0.5 --dur 4 --saida "<arquivo.mp4>"
O áudio sai em silêncio: a música é escolhida no Instagram na hora de postar.
"""
import argparse
import os
import subprocess
import tempfile

from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1920
MARGEM = 124
LARGURA_TEXTO = W - MARGEM - 150
FONTE = ('/System/Library/Fonts/HelveticaNeue.ttc', 1)  # Helvetica Neue Bold
TAM = 60
ENTRELINHA = 1.22


def quebrar(texto, fonte, largura):
    linhas, atual = [], ''
    for palavra in texto.split():
        teste = (atual + ' ' + palavra).strip()
        if fonte.getlength(teste) <= largura:
            atual = teste
        else:
            if atual:
                linhas.append(atual)
            atual = palavra
    if atual:
        linhas.append(atual)
    return linhas


def desenhar_texto(titulo, frase, ref, caminho):
    fonte = ImageFont.truetype(FONTE[0], TAM, index=FONTE[1])
    linhas = []
    if titulo:
        linhas += quebrar(titulo, fonte, LARGURA_TEXTO) + ['']
    frase = frase.strip().strip('"“”')
    linhas += quebrar(f'"{frase}"', fonte, LARGURA_TEXTO)
    if ref:
        linhas += [''] + quebrar(ref, fonte, LARGURA_TEXTO)
    passo = int(TAM * ENTRELINHA)
    altura = passo * len(linhas)
    y = int(H * 0.49 - altura / 2)
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    for linha in linhas:
        if linha:
            d.text((MARGEM + 2, y + 2), linha, font=fonte, fill=(0, 0, 0, 90))  # sombra leve para leitura
            d.text((MARGEM, y), linha, font=fonte, fill=(255, 255, 255, 255))
        y += passo
    img.save(caminho)
    return len(linhas)


def desenhar_texto_longo(texto, caminho):
    """Post de frase com TEXTO LONGO (padrão do CEO, 12/11/2026): branco, negrito, CENTRALIZADO, no meio da tela.
    Parágrafos separados por linha em branco no arquivo de texto. A letra é a MAIOR que cabe na zona segura."""
    paragrafos = [x.strip() for x in texto.strip().split('\n\n') if x.strip()]
    larg = W - 2 * 140                  # margem maior (CEO, 15/11/2026): zona segura rígida x 140–940
    topo, base = 230, 1530              # zona segura rígida (CEO 15/11/2026: "dê mais margem nas frases longas")
    for tam in range(74, 30, -2):
        fonte = ImageFont.truetype(FONTE[0], tam, index=FONTE[1])
        linhas = []
        for i, par in enumerate(paragrafos):
            if i:
                linhas.append('')
            for sub in par.split('\n'):
                linhas += quebrar(sub.strip(), fonte, larg)
        passo = int(tam * 1.2)
        if len(linhas) * passo <= base - topo:
            break
    y = int((topo + base) / 2 - len(linhas) * passo / 2)
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    for linha in linhas:
        if linha:
            x = (W - fonte.getlength(linha)) / 2
            d.text((x + 2, y + 2), linha, font=fonte, fill=(0, 0, 0, 110))
            d.text((x, y), linha, font=fonte, fill=(255, 255, 255, 255))
        y += passo
    img.save(caminho)
    return tam, len(linhas)


SERIFA = '/System/Library/Fonts/Supplemental/Georgia.ttf'
DOURADO = (245, 197, 24, 255)


def desenhar_cartao(titulo, frase, ref, caminho):
    """Post de frase em cartão (padrão das referências do CEO): cartão preto; texto branco com serifa, grande,
    centralizado; aspa dourada grande de abertura acima do texto à esquerda e de fechamento abaixo à direita;
    assinatura @cliente pequena e apagada, centralizada logo abaixo do texto.
    Quebras manuais: use " / " na frase para forçar nova linha (ex.: uma frase por linha)."""
    aspas = ImageFont.truetype('/System/Library/Fonts/Supplemental/Georgia Bold.ttf', 150)
    ass = ImageFont.truetype(SERIFA, 26)
    largura = W - 2 * 85
    # TEXTO MAIOR (regra do CEO, 11/11/2026): usa a MAIOR letra que cabe na zona segura (entre 74 e 104 px).
    for tam in range(104, 73, -2):
        fonte = ImageFont.truetype(SERIFA, tam)
        blocos = []
        if titulo:
            blocos += quebrar(titulo, fonte, largura) + ['']
        for parte in frase.strip().strip('"“”').split(' / '):
            blocos += quebrar(parte.strip(), fonte, largura)
        if ref:
            blocos += ['', '- ' + ref]
        if len(blocos) * int(tam * 1.17) <= 1150:
            break
    passo = int(tam * 1.17)
    total = len(blocos) * passo
    y0 = int(H * 0.50 - total / 2)
    img = Image.new('RGB', (W, H), (0, 0, 0))
    d = ImageDraw.Draw(img)
    esq = min((W - fonte.getlength(l)) / 2 for l in blocos if l)
    d.text((max(150, esq + 10), y0 - 150), '“', font=aspas, fill=DOURADO)
    y = y0
    for linha in blocos:
        if linha:
            d.text(((W - fonte.getlength(linha)) / 2, y), linha, font=fonte, fill=(255, 255, 255))
        y += passo
    texto_ass = '@cliente'
    ya = y + 30
    d.text(((W - ass.getlength(texto_ass)) / 2, ya), texto_ass, font=ass, fill=(58, 58, 58))
    d.text((W - 250, ya - 35), "”", font=aspas, fill=DOURADO)
    img.save(caminho)


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--video', default='', help='vídeo base do cliente. Sem vídeo = cartão de fundo preto')
    p.add_argument('--frase', default='')
    p.add_argument('--titulo', default='')
    p.add_argument('--ref', default='')
    p.add_argument('--inicio', type=float, default=0.5)
    p.add_argument('--dur', type=float, default=4.0)
    p.add_argument('--escurecer', type=float, default=0.36, help='0 a 1: quanto escurecer o vídeo')
    p.add_argument('--saida', required=True)
    p.add_argument('--texto-longo', default='', help='arquivo .txt com o texto longo: centralizado, parágrafos separados por linha em branco; sem limite de 5 s')
    p.add_argument('--loop', action='store_true', help='repete o vídeo base até completar --dur')
    a = p.parse_args()
    dur = a.dur if a.texto_longo else min(a.dur, 5.0)
    if not a.video:  # cartão de fundo preto
        with tempfile.TemporaryDirectory() as tmp:
            png = os.path.join(tmp, 'cartao.png')
            desenhar_cartao(a.titulo, a.frase, a.ref, png)
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-loop', '1', '-framerate', '30', '-t', str(dur), '-i', png,
                            '-f', 'lavfi', '-t', str(dur), '-i', 'anullsrc=r=48000:cl=stereo',
                            '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p',
                            '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart', a.saida], check=True)
        print(a.saida)
        return
    with tempfile.TemporaryDirectory() as tmp:
        png = os.path.join(tmp, 'texto.png')
        if a.texto_longo:
            print('letra', desenhar_texto_longo(open(a.texto_longo, encoding='utf-8').read(), png))
        else:
            desenhar_texto(a.titulo, a.frase, a.ref, png)
        filtro = (
            # Só escurece (cor fiel ao original): sem mexer em saturação nem vinheta, que deixavam a imagem esverdeada.
            f'[0:v]scale={W}:{H}:force_original_aspect_ratio=increase:out_range=tv,crop={W}:{H},fps=30,setsar=1,format=gbrp,'
            f'drawbox=x=0:y=0:w=iw:h=ih:color=black@{a.escurecer}:t=fill[base];'
            f"[base][1:v]overlay=0:0:format=rgb,format=yuv420p[v]"
        )
        cmd = [
            'ffmpeg', '-v', 'error', '-y', *(['-stream_loop', '-1'] if a.loop else []), '-ss', str(a.inicio), '-t', str(dur), '-i', a.video,
            '-i', png, '-f', 'lavfi', '-t', str(dur), '-i', 'anullsrc=r=48000:cl=stereo',
            '-filter_complex', filtro, '-map', '[v]', '-map', '2:a',
            '-c:v', 'libx264', '-crf', '18', '-preset', 'medium',
            '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
            '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart', a.saida,
        ]
        subprocess.run(cmd, check=True)
    print(a.saida)


if __name__ == '__main__':
    main()
