---
tipo: aprendizado
projetos: [Agencia IA Dream]
tags: [aprendizado, edits, video, podcast]
criado: 2026-11-14
resumo: O que o Edits (MCP metapilot-native) faz bem e onde precisa de remendo nos cortes de podcast — volume, sombra, exportação, tela dividida
---
# Limites do Edits nos cortes de podcast
1º teste real (corte 1 do o podcast, 14/11/2026, ~24 min para 2 versões):
- Bem: `splitAt`/`delete` em lote, `autoReframe` no rosto, `findPauses`/`audioLevels`, legenda `generateCaptions` estilo "Short Hard Cut" (1 palavra), headline = `addText` + `addShape` retângulo branco + `moveToLayer`, `frameSheet`/`captureFrame`, `duplicateProject`.
- Volume: "melhorar voz" deixa pico ~0 dBTP e LUFS imprevisível; não há limitador → acertar com `portao.py --ajustar-volume` depois da exportação.
- Exportação: não grava no HD externo (exportar em ~/Movies e copiar); só HEVC; configurações de exportação se perdem ao reabrir projeto (conferir 1080×1920).
- Legenda: sem sombra (só contorno); tamanho por legenda; palavras às vezes somem (corrigir com `editCaption`).
- `setEmphasis` backgroundPill quebra uma palavra por linha; `splitScreen` só divide o MESMO vídeo — tela dividida de reação = duas camadas (`setCrop`/`setTransform`).
- `transcribeClip` envia o áudio para a nuvem da Meta; tempos das palavras até 0,3 s adiantados → cortar pela onda.
- o podcast: apresentadora calada só aparece no plano aberto → reação ampliada ~2× fica mais macia.
- Headline com fundo por linha (estilo Instagram): Edits não tem preset; montar 3 `addShape` + 3 `addText` (fonte IGUIBetav9-Bold) + `moveToLayer`. `addShape` é imagem do tamanho da tela; x/y do `setTransform` é deslocamento a partir de 0,5; mudar tamanho = apagar e recriar. Portão exige bloco começando em x≥138 (a faixa branca conta como texto).
- CEO achou fala cortada pela metade (00:06) no 1º corte do Edits: antes de exportar, ouvir/medir CADA emenda pela onda (início e fim de cada pedaço), não confiar nos tempos das palavras.
- Causa do corte em 00:06: sílaba final fraca ("-de", −37 a −45 dB) depois do ponto de corte; checar a cauda de cada pedaço até cair abaixo de ~−45 dB. Legenda automática pode inventar palavra repetida ("pro pro").
Ver [[Edits via MCP metapilot-native]], [[Podcast com tela dividida de reacao]].

Projetos: [[Agencia IA Dream]]
