---
tipo: aprendizado
projetos: [todos]
tags: [aprendizado, video, cor]
criado: 2026-11-11
atualizado: 2026-11-11
resumo: Mexer em saturação/vinheta deixou os vídeos esverdeados; para escurecer, só uma camada preta em RGB com tags bt709
---
# Escurecer video sem esverdear

Filtro: `format=gbrp,drawbox=...color=black@0.36:t=fill` + overlay em RGB + `-colorspace bt709 -color_primaries bt709 -color_trc bt709`.

Projetos: [[Agencia IA Dream]]
