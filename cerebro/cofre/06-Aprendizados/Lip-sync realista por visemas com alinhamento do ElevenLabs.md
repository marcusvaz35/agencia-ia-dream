---
tipo: aprendizado
projetos: [Agencia IA Dream]
tags: [lipsync, visemas, elevenlabs, forced-alignment, video]
criado: 2026-11-13
resumo: Receita de lip-sync realista para rosto desenhado — alinhamento por letra do ElevenLabs → visemas do português → 9 bocas, antecipação 40 ms, b/p/m fecham ≥2 quadros, piscar e leve balanço
---
# Lip-sync realista por visemas (ElevenLabs forced alignment)

- Entrada: áudio + texto exato → `POST /v1/forced-alignment` (permissão Forced Alignment na chave) → `characters[{text,start,end}]` e `words`. Salvo em `~/Movies/agencia-marca-do-cliente/lip/eleven-alignment.json` (exemplo: 590 letras, 191 palavras).
- Visemas do português usados (v4 do Reel "a marca do cliente nos EUA", 13/11/2026): fechada (b/p/m e pausas), estreita (e/i), pouco aberta (l,n,t,d,r,k), média, bem aberta (a), arredondada (o), "u" pequena, dentes (s,z,c,x,ch,j,g), f/v (dentes sobre lábio inferior); nasais ã/õ como a/o; "h" mudo; qu/gu sem "u"; consoantes < 70 ms se misturam à vogal vizinha; pausa/pontuação fecha.
- Temporização: visema antecipa ~40 ms; segurar ≥ 2 quadros a 30 fps; bilabiais fecham ≥ 2 quadros. Extras: piscar a cada 3–5 s (~167 ms), balanço de cabeça ±0,5°, vaivém ±1 px, respirar.
- Verificação: tiras a 30 fps com letra+tempo+visema para ≥ 6 palavras (Brasil, brasileira, primeira, novembro, Estados, marca-do-cliente) mostrando fechamento em b/p/m; clipe curto só do rosto grande para o CEO ver de perto.
- Limites: dígitos viram letras erradas ("20" ≠ "vinte" — escrever números por extenso no texto do alinhamento); bocas derivadas são aproximação; verificação por quadros, não em tempo real.
- Conecta: [[Video com graficos explicativos]], [[Voz ElevenLabs e WhatsApp na Maquina das 4h]].

Projetos: [[Agencia IA Dream]]

- 13/11 (v5, o que funcionou melhor): trocar "9 sprites de boca" por REUSO dos quadros reais do rosto do exemplo (860) com seleção por Viterbi: custo = visema esperado (letras do alinhamento) + continuidade de pose; assim mandíbula, barba e giro da cabeça vêm "de graça" e o movimento fica humano. Não correlacionar abertura com volume (corr. 0,09): a boca segue vogal/palavra. Piscar medido automaticamente confunde com giro de cabeça. Limite: repertório de bocas = o que o exemplo falou; para cobrir toda a fala só geração por IA (ElevenLabs Image & Video/Aurora) ou mais material.

- 13/11 (solução final): o CEO preferiu a geração por IA do ElevenLabs. Passo a passo que funcionou: History → card do retrato → ⋮ → Lip sync (ou clicar na miniatura "Reference image" do card HeyGen anterior) para anexar o avatar; **o modelo (HeyGen Avatar 4) deve ser escolhido ANTES**; "Speech → Upload audio" (file_upload no segundo input hidden; o arquivo precisa estar numa pasta da sessão); proporção 1:1 (16:9 muda); conferir tooltip do custo; enviar; ~2 min até concluir. Custo = 606 créditos/s × duração (22.420 para 36,28 s). Download pela automação do Chrome abre aba em branco mas o arquivo chega a ~/Downloads depois de ~1 min (ElevenLabs_video_<modelo>_<data>.mp4) — esperar e conferir antes de pedir ao CEO. Depois: compor com multiply sobre o fundo claro.
