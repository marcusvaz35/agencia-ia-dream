"""Caixinha de pergunta do Instagram por cima de um vídeo (padrão do CEO, 15/11/2026).

Modelo: print do CEO (faixa escura #262A31 com o título em branco + corpo branco com a pergunta em preto,
cantos arredondados). Fonte: Roboto (pedido do CEO). O vídeo NÃO é reeditado (sem corte de respiro):
só recebe a caixinha do começo ao fim. Qualidade mantida: mesma resolução, mesmos quadros por segundo,
HEVC com taxa alta; vídeo HDR do iPhone é convertido para SDR para a caixa ficar BRANCA de verdade (como no Instagram).

Uso:
  uv run --directory ~/.claude/skills/editor-video python ferramentas/caixinha-instagram/caixinha.py \
     --video entrada.MOV --pergunta "Qual foi a pior decisão q vc já tomou nos negócios?" \
     --saida saida.mp4 [--titulo "Faça uma pergunta"] [--y 1400] [--png previa.png]
"""
import argparse, json, os, subprocess, tempfile
from PIL import Image, ImageDraw, ImageFont

AQUI = os.path.dirname(os.path.abspath(__file__))
MED = os.path.join(AQUI, 'fontes', 'Roboto-Medium.ttf')
LARG = 840            # largura da caixa a 1080 (78% da tela, como no print)
RAIO = 30
CAB_H = 122           # faixa escura
PAD_V, PAD_H = 52, 56
ESCURO = (38, 42, 49)


def quebrar(txt, fonte, larg):
    linhas, atual = [], ''
    for p in txt.split():
        t = (atual + ' ' + p).strip()
        if fonte.getlength(t) <= larg or not atual:
            atual = t
        else:
            linhas.append(atual); atual = p
    if atual:
        linhas.append(atual)
    # equilibra: evita última linha com 1 palavra
    if len(linhas) >= 2 and len(linhas[-1].split()) == 1 and len(linhas[-2].split()) > 2:
        a = linhas[-2].split(); linhas[-1] = a[-1] + ' ' + linhas[-1]; linhas[-2] = ' '.join(a[:-1])
    return linhas


def desenhar(titulo, pergunta, W, H, cy, hdr, caminho):
    k = W / 1080
    f_t = ImageFont.truetype(MED, round(42 * k))
    f_p = ImageFont.truetype(MED, round(46 * k))
    larg, raio, cab = round(LARG * k), round(RAIO * k), round(CAB_H * k)
    linhas = quebrar(pergunta, f_p, larg - 2 * round(PAD_H * k))
    passo = round(60 * k)
    corpo = 2 * round(PAD_V * k) + passo * len(linhas)
    alt = cab + corpo
    x0, y0 = (W - larg) // 2, round(cy - alt / 2)
    # em vídeo HDR (HLG) o branco de interface fica em ~88% do sinal (branco como o das partes claras da cena) para não estourar
    g = 0.88 if hdr else 1.0
    branco = tuple(round(255 * g) for _ in range(3))
    escuro = tuple(round(c * g) for c in ESCURO)
    esc = 4
    big = Image.new('RGBA', (W * esc, H * esc), (0, 0, 0, 0))
    d = ImageDraw.Draw(big)
    # sombra suave
    d.rounded_rectangle([(x0) * esc, (y0 + 6) * esc, (x0 + larg) * esc, (y0 + alt + 6) * esc], raio * esc, fill=(0, 0, 0, 40))
    d.rounded_rectangle([x0 * esc, y0 * esc, (x0 + larg) * esc, (y0 + alt) * esc], raio * esc, fill=branco + (255,))
    d.rounded_rectangle([x0 * esc, y0 * esc, (x0 + larg) * esc, (y0 + cab + raio) * esc], raio * esc, fill=escuro + (255,))
    d.rectangle([x0 * esc, (y0 + cab) * esc, (x0 + larg) * esc, (y0 + cab + raio) * esc], fill=branco + (255,))
    img = big.resize((W, H), Image.LANCZOS)
    d = ImageDraw.Draw(img)
    d.text((W / 2, y0 + cab / 2), titulo, font=f_t, fill=branco + (255,), anchor='mm')
    ty = y0 + cab + round(PAD_V * k) + passo / 2
    for i, l in enumerate(linhas):
        d.text((W / 2, ty + i * passo), l, font=f_p, fill=(0, 0, 0, 255), anchor='mm')
    img.save(caminho)
    return (x0, y0, larg, alt), linhas


def sonda(v):
    j = json.loads(subprocess.check_output(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries',
        'stream=width,height,r_frame_rate,bit_rate,color_transfer,color_primaries,color_space,pix_fmt:stream_side_data=rotation',
        '-of', 'json', v]))['streams'][0]
    return j


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--video', required=True); ap.add_argument('--pergunta', required=True)
    ap.add_argument('--saida', required=True); ap.add_argument('--titulo', default='Faça uma pergunta')
    ap.add_argument('--y', type=float, default=1400, help='centro vertical da caixa numa tela de 1920 de altura')
    ap.add_argument('--png'); ap.add_argument('--so-png', action='store_true')
    a = ap.parse_args()
    s = sonda(a.video)
    if s.get('color_transfer') in ('arib-std-b67', 'smpte2084'):
        # CEO (15/11/2026): com o vídeo em HDR a caixa branca parecia CINZA ("ficou falsa"). O Instagram mostra a
        # caixinha em branco puro sobre vídeo SDR, então o HDR do iPhone é convertido antes para SDR (avconvert,
        # 1080x1920, mesmos fps, ~16 Mbps) e a caixa entra em branco 255.
        sdr = os.path.join(tempfile.mkdtemp(), 'sdr.mp4')
        subprocess.run(['avconvert', '-s', a.video, '-p', 'Preset1920x1080', '-o', sdr, '--replace'], check=True,
                       stdout=subprocess.DEVNULL)
        a.video = sdr
        s = sonda(a.video)
    W, H = s['width'], s['height']
    hdr = False
    png = a.png or os.path.join(tempfile.mkdtemp(), 'caixa.png')
    caixa, linhas = desenhar(a.titulo, a.pergunta, W, H, a.y * H / 1920, hdr, png)
    print('caixa', caixa, linhas, 'HDR' if hdr else 'SDR')
    if a.so_png:
        return
    dez = '10' in s.get('pix_fmt', '')
    taxa = max(int(int(s.get('bit_rate', 12000000)) * 1.4), 20000000)
    cmd = ['ffmpeg', '-v', 'error', '-y', '-i', a.video, '-i', png, '-filter_complex',
           f"[0:v][1:v]overlay=0:0:format=auto,format={'p010le' if dez else 'yuv420p'}[v]",
           '-map', '[v]', '-map', '0:a:0', '-c:v', 'hevc_videotoolbox', '-profile:v', 'main10' if dez else 'main',
           '-b:v', str(taxa), '-tag:v', 'hvc1', '-r', s['r_frame_rate'], '-c:a', 'copy', '-movflags', '+faststart']
    for k, c in (('-color_primaries', 'color_primaries'), ('-color_trc', 'color_transfer'), ('-colorspace', 'color_space')):
        if s.get(c):
            cmd += [k, s[c]]
    subprocess.run(cmd + [a.saida], check=True)
    print('ok', a.saida)


if __name__ == '__main__':
    main()
