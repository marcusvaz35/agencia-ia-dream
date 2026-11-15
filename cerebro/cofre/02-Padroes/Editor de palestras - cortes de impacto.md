---
tipo: padrao
projetos: [Agencia IA Dream]
tags: [editor-de-palestras, cortes, cinematografico, agente]
criado: 2026-11-12
resumo: Novo agente editor-de-palestras — corta palestras quase em tempo real no estilo cinematográfico das referências do CEO; sem efeitos cômicos/alegres; análise quadro a quadro em conhecimento/edicao-palestras.md
---
# Editor de palestras — cortes de impacto

- Pedido do CEO (12/11/2026): agente sênior que recebe a palestra gravada e devolve o corte pronto para aprovar/postar, quase em tempo real, "igual" a 2 referências (`conhecimento/referencias-video/palestras/ref-palestra-1.mp4` 66 s e `ref-palestra-2.mp4` 26,5 s, 720x1280, 30 fps).
- Regras do CEO: gancho forte, headline forte, inserções; clima CINEMATOGRÁFICO de impacto — trilha com peso/emoção, efeitos sonoros que prendem e seguem a mesma linha; PROIBIDO efeito cômico/alegre; rápido (do arquivo ao vídeo em minutos).
- Arquivos: agente `.claude/agents/editor-de-palestras.md` (também no gerente e em `PERFIL`/`VISUAL` do escritório 3D, cor #0f766e, 🎤); receita/checklist em `conhecimento/edicao-palestras.md` (análise feita pelo editor-de-video; em andamento ao registrar). Diferente do [[Editor Viral AI - inteligencia do editor de podcasts]] (podcast, base visual caixa branca/legenda 1 palavra): palestra segue as referências, mais cinematográfica.
- Cada novo agente: ver [[Como adicionar agente na agencia]].

Projetos: [[Agencia IA Dream]]

## Resultado da análise (12/11, ~22h) — `conhecimento/edicao-palestras.md`
- Referência 1 (66 s): entrevista em cafeteria, 19 planos (~3,3 s cada), tela dividida 50/50 em ~60% do tempo, 3 inserções (2 cartões creme com lettering de caneta/pincel + B-roll de mãos em oração com miniatura redonda). Referência 2 (26,4 s): palestra ao vivo, câmera em movimento, cor teal + laranja escura. Clarão amarelo-laranja de ~0,1 s (3 quadros) entre ideias, corte no pico (6 no v1, 4 no v2); v2 termina no clarão (loop).
- Regras de ouro: frase de maior impacto abre (primeiros ~3 s) e volta/fecha; headline 3 linhas, caixa branca arredondada, texto preto negrito, presente desde o quadro 0 sem animação e sai no 1º corte; zero silêncio ≥0,12 s e sem muletas; voz ~−14 LUFS comprimida; plano muda a cada 3–5 s, inserção a cada ~20 s ligada à palavra dita; legenda sem caixa que cresce com a fala (2–5 palavras), destaque em serifa negrito; lettering da palavra-chave com elipse (JESUS) 2,5D; sem emoji/sticker/logo/CTA/glitch/transição de slide.
- Áudio (medido, não ouvido): sem trilha detectável nas referências; só 1 som projetado (varredura 3–9 kHz em 1,0–2,7 s + batida 20–100 Hz em 2,75–3,4 s, 5–7 dB acima da voz, após o 1º clarão). Receita de trilha de peso (22–24 dB abaixo da voz, ducking 3 dB) é PROPOSTA do editor, precisa de OK do CEO.
- Incertezas: headline da referência começa em y 170 (acima da zona segura de 230) × padrão do carro (altura do peito); fontes aproximadas; origem do B-roll/clarão desconhecida. Fluxo rápido realista 10–20 min (ESTIMATIVA) — falta criar 6 scripts (ingestão, headline PNG, legenda crescente, clarão, áudio, entrega) e banco de sons livres.
- Pendentes do CEO: posição da headline, trilha (receita do editor × músicas dele), Apple ID/iCloud + OK do vigia ([[Fluxo celular para editor de palestras]]).

- Regra do CEO (12/11, noite): TODO corte tem GANCHO (0–3 s) → CONTEXTO (~3–20 s, só o essencial) → IMPACTO (frase final/virada) e é feito para viralizar; precisa de motivo para compartilhar/comentar/salvar; 20–60 s. Se a gravação não sustenta isso, o editor avisa com franqueza o que falta e propõe o melhor corte — não entrega corte morno; nunca promete viralização nem inventa métricas. Gravado em `.claude/agents/editor-de-palestras.md` e `conhecimento/edicao-palestras.md`.

- Decisão do CEO (12/11): HEADLINE do corte de palestra vai na parte de BAIXO, em caixa branca arredondada com texto preto negrito centralizado (até 3 linhas), borda inferior acima de ~y 1540 (1080×1920), centralizada, do quadro 0 até o 1º corte (~3 s); substitui a posição da referência (topo). Legenda não colide com a headline. Gravado no agente e em `conhecimento/edicao-palestras.md`. Pendentes: trilha (receita do editor × músicas do CEO) e vigia iCloud.

- 1º teste real (12/11, noite): `<arquivo-bruto>.mov` (4K horizontal, 141 s). Brutos 4K/HEVC pesados: trabalhar em cópia/proxy no disco interno (`~/Movies/agencia-palestras/`) e renderizar só o final em 1080×1920. Resultado e tempos vão no RELATORIO ao lado do vídeo.

## Lições do 1º corte real (exemplo de evento)
- Corte de ~41 s em 1080×1920 + versão leve ~8 MB. Gancho em caixa branca embaixo (3 linhas, borda em y ~1500); contexto com cartões creme; impacto com clarão + sub-drop. 14 enquadramentos com push-in, sem silêncio ≥0,12 s, −14,6 LUFS. Trilha = drone grave sintetizado (−23 dB sob a voz, ducking 3 dB) + hit/whoosh/riser/sub-drop; nunca usar música com risco de direitos.
- Aprendizados: (1) o bruto do iPhone pode ser VERTICAL 2160×3840 com rotação gravada no arquivo (ffprobe engana; proxy sai esticado) — ler a rotação (displaymatrix) antes de criar proxy; (2) o tempo real do 1º corte foi ~35 min (meta 10–20): faltam scripts (ler rotação, rastrear rosto direto no proxy certo, render+áudio+mux em 1 comando); (3) conferir fatos ditos sem fonte antes de postar; (4) gancho em forma de pergunta é mais fraco que frase de choque — avisar o CEO.

## Padrão da casa (legenda e inserções profissionais)
- Legenda (medida na referência): sans geométrica branca ~44 px, blocos de 2–4 palavras com troca seca (sem fade nem "frase que cresce"), ~67% da altura (y ~1290); sobe para y ~1010 enquanto a headline está na tela. Nas inserções, legenda escura com a palavra falada sublinhada em azul.
- Destaques de palavra: palavra grande em itálico extra-pesado com gradiente/brilho, entrada blur→nítido com revelação esq→dir na palavra falada, saída seca; poucos (a referência tem 2 em 83 s) e longe do rosto.
- Inserções: off-white com grade, etiqueta com quadradinho, título bold + 2ª linha serifa itálica azul, easing; gráficos que PROVAM a frase (ex.: 100 bolinhas com 3 azuis); inserção em tela cheia 3–4 s.
- Ferramentas: `ferramentas/palestra/` (render, áudio, gfx, `editar-palestra.sh`). Lição: parâmetros errados custam renders — validar legenda/posição em 1 quadro antes de renderizar tudo. Relacionado: [[Legenda e insercoes profissionais nas palestras]].

## Velocidade
Vídeos de palestra são editados e postados NA HORA do evento: meta ≤ 5 min (ideal 2–3) do bruto ao vídeo, num comando (`ferramentas/palestra/editar-palestra.sh <bruto> --modo rapido|completo`): proxy correto com hwaccel videotoolbox, transcrição rápida em paralelo, escolha de trecho em 1 passo, rastreio de rosto leve, encoder por hardware, render em 1 passada, pré-render paralelo de legenda/destaques/inserções, banco de sons pronto, versão leve na mesma passada. Entrada do material: AirDrop do iPhone.
