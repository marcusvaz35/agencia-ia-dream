---
tipo: stack
projetos: [Agencia IA Dream]
tags: [palestras, 4k, ffmpeg, videotoolbox]
criado: 2026-11-13
atualizado: 2026-11-13
resumo: editar-palestra.sh --estilo so-legenda --res 4k entrega 2160x3840 HEVC ~48 Mbps direto do bruto 4K (sem proxy); só funciona no estilo so-legenda
---
# Palestras em 4K

- Pedido do CEO (13/11/2026): resultado final em 4K para não perder qualidade; não postar até validar.
- Comando: `ferramentas/palestra/editar-palestra.sh <bruto> --estilo so-legenda --res 4k --plano <caminho ABSOLUTO>`. Padrão continua 1080x1920.
- Saída: 2160x3840, HEVC hvc1, bt709 SDR, ~48 Mbps, 30 fps; legenda 192 px (y 2460), headline 104 (borda 3080). 47 s de corte rendem em ~1 min.
- Backups em ferramentas/palestra/legado/*-antes-res4k.py. Modo 1080 não foi retestado depois da mudança.
- Arquivo de 285 MB não vai pelo celular: mandar prévia leve de 1080.
Ver [[Palestras so legenda e com contexto]].
