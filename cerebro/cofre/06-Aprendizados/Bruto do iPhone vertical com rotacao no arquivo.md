---
tipo: aprendizado
projetos: [Agencia IA Dream]
tags: [ffmpeg, iphone, rotacao, proxy, video]
criado: 2026-11-12
resumo: Vídeo do iPhone pode parecer horizontal no ffprobe e ser vertical por rotação gravada no arquivo; ler a rotação antes de criar proxy ou o resultado sai esticado
---
# Bruto do iPhone: vertical com rotação gravada no arquivo

- `<arquivo-bruto>.mov` apareceu como 3840×2160 HEVC a ~300 fps (container) mas é na verdade 2160×3840 vertical a ~59,55 fps, com rotação nos metadados. Proxy criado sem aplicar a rotação saiu esticado e atrasou o corte em ~10 min.
- Regra: antes de qualquer proxy/rastreio de rosto, ler `side_data` rotation/displaymatrix (`ffprobe -show_streams`) e o avg_frame_rate real; fazer o proxy já com a rotação aplicada.
- Ver [[Editor de palestras - cortes de impacto]] e [[Video HDR do iPhone estoura]].

Projetos: [[Agencia IA Dream]]
