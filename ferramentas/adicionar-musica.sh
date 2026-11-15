#!/bin/bash
# Coloca uma música de fundo num vídeo (sem renderizar a imagem de novo).
# Uso: ferramentas/adicionar-musica.sh "<video>" "<musica>" [inicio_em_segundos=auto] [saida=sobrescreve o vídeo]
# - "auto": pula o silêncio do começo da faixa.
# - volume da música normalizado (~ -14 LUFS), entrada suave 0,3 s e saída suave 0,8 s.
# - substitui o áudio do vídeo (os posts de frase não têm fala).
set -euo pipefail
VIDEO="$1"; MUSICA="$2"; INICIO="${3:-auto}"; SAIDA="${4:-}"
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$VIDEO")
if [ "$INICIO" = "auto" ]; then
  INICIO=$(ffmpeg -v info -t 30 -i "$MUSICA" -af silencedetect=noise=-40dB:d=0.3 -f null - 2>&1 | awk '/silence_end/{print $5; exit}')
  INICIO="${INICIO:-0}"
fi
TMP="$(mktemp -d)/com-musica.mp4"
FADE_OUT=$(awk -v d="$DUR" 'BEGIN{printf "%.2f", (d>1.2? d-0.8 : 0)}')
ffmpeg -v error -y -i "$VIDEO" -ss "$INICIO" -t "$DUR" -i "$MUSICA" \
  -filter_complex "[1:a]loudnorm=I=-14:TP=-1.5:LRA=11,afade=t=in:st=0:d=0.3,afade=t=out:st=${FADE_OUT}:d=0.8,aresample=48000[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "$TMP"
mv -f "$TMP" "${SAIDA:-$VIDEO}"
echo "${SAIDA:-$VIDEO}"
