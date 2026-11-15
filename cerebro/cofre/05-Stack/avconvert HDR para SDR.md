---
tipo: stack
projetos: [todos]
tags: [stack, video]
criado: 2026-11-11
atualizado: 2026-11-11
resumo: Vídeo HDR do iPhone (HLG/PQ) convertido para SDR natural com avconvert -p Preset1920x1080
---
# avconvert HDR para SDR

`avconvert -s "<orig>" -p Preset1920x1080 -o "<saida>-sdr.mp4" --replace` (≈10 s para 3 min). Conferir antes com ffprobe `color_transfer` (arib-std-b67 ou smpte2084 = HDR).

Projetos: [[Agencia IA Dream]]
