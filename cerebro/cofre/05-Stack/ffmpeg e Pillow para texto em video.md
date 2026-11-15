---
tipo: stack
projetos: [todos]
tags: [stack, video, ffmpeg]
criado: 2026-11-11
atualizado: 2026-11-11
resumo: O ffmpeg desta máquina não tem drawtext nem libass: texto vai como PNG (Pillow) sobreposto com overlay
---
# ffmpeg e Pillow para texto em video

- Sequência de PNG com duração via concat demuxer + `overlay` = legenda palavra a palavra rápida.
- Encoder rápido: `h264_videotoolbox`; versão leve com libx264 por bitrate.

Projetos: [[Agencia IA Dream]]
