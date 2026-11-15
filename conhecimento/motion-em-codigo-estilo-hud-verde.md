# Motion em código (estilo HUD verde) — análise quadro a quadro

Referência do CEO (14/11/2026): vídeo de um perfil de referência, 82,6 s, 720x1280, 30 fps. Cópia de trabalho: `conhecimento/referencias-video/motion-hud-verde-ref24.mp4`.
É uma **gravação de um monitor** (celular filmando a tela, com legenda preta "Vídeo 100% feito com Claude Opus 5.5 sem usar ferramentas externas" e depois "Comenta MOTION"). O motion em si é feito por CÓDIGO e renderizado quadro a quadro — o mesmo princípio do HyperFrames (skill `hyperframes`, já instalada).

## A tese do vídeo (palavras do criador, FATO)
1. Pedir só "faz um vídeo legal" = "um PowerPoint de 2009".
2. O que faz o modelo acertar são **as referências certas**: tipografia, grade, ritmo, easing, paleta.
3. O modelo não gera o vídeo: **escreve a animação como código** (texto, forma, posição, easing, partícula = matemática), que é renderizado quadro a quadro.
4. Fluxo: pedido → código → render → vídeo (no lugar de After Effects: camada → keyframe → graph editor → render).
5. Por ser código, o ajuste é por conversa ("deixa mais suave", "muda a cor", "desacelera aqui", "faz o final voltar pro começo").
6. Eles empacotaram isso numa **Skill** com 3 coisas: referências, cenas, transições. (É isso que o CEO quer ter.)

## Estrutura (19 cenas ≈ 4 s cada, numeradas MOTION / 001…019)
| Tempo | Cena | Visual | Fala |
|---|---|---|---|
| 0–3 s | abertura | tela escura com grão; um "E" nasce de um flare de luz horizontal | — |
| 3–8 | 001 | "que dá pra criar um" + **MOTION DESSE NÍVEL** gigante verde com brilho, linhas-guia cruzando | E se eu te dissesse… |
| 8–11 | 002 | fio 3D de arame girando + logo Ae riscado; "sem nem abrir o After Effects?" | |
| 11–13 | 003/004 | caixa tracejada "não é plugin"; estrela laranja (única cor fora da paleta) → **CLAUDE OPUS 5.5** em 3D | |
| 13–17 | 005 | "Você não controla programa nenhum" + caixa de prompt verde digitando "só descreve como quer que fique" | |
| 17–23 | 006 | prompt maior, menu de opções (cinematográfica/épica…), previews montando, contador de segundos; mergulha num **túnel de grade 3D** | |
| 23–27 | 007 | radar com mira "Só que tem um detalhe que ninguém te conta" | |
| 27–31 | 008 | **quebra de estilo de propósito**: cartaz arco-íris "PowerPoint de 2009" | gag que prova a tese |
| 31–38 | 009 | alvo com flecha "acertar"; 4 cartões de referência (Aa tipografia, grade, ritmo, easing) enchem um a um; faixa verde de palavras passa na tela | |
| 38–46 | 010 | "o Claude não gera o vídeo direto": caixa de vídeo → vira bloco de **código real** (texto, forma, posição…) | |
| 46–50 | 011 | "MOTION" com caixas de medida; forma e partícula entram; "tudo definido em matemática" | |
| 50–57 | 012 | tira de filme (frames) correndo com marcador vertical "quadro a quadro" | |
| 57–66 | 013–015 | "Em vez de…" 5 cartões (After Effects→camada→keyframe→graph editor→render) com linha vermelha cortando; vira 3 cartões "pedido → código → render" com luz verde | |
| 66–73 | 015–016 | cubo deslizando com curva de easing e painel de código; cada comando falado aparece como balão ("deixa mais suave", "muda a cor"…) | |
| 73–77 | 016 | chuva de centenas de losangos (keyframes) com contador | |
| 77–85 | 017 | logo **M** em losango neon com raios; chips voando e encaixando (referências, cenas, transições) | |
| 85–93 | 018 | arco gigante: "Substitui o After Effects?" → resposta em 3 linhas; palavra **ABSURDO** com bloom enorme | |
| 93–97 | 019 | "Comenta MOTION": caixa de comentários + raios | |
| fim | loop | volta ao "E" do início (vídeo que se repete) | |

## Sistema visual (repetir sempre — é o que dá a cara de produto caro)
- **Paleta:** fundo verde-quase-preto (~#07120C) com gradiente radial mais claro no centro; UM verde neon (~#3DFF3D / #7CFF4F) para destaque; texto off-white (~#EAF3E4); vermelho só para "errado/cortado"; laranja só no ícone Claude. Nada além disso.
- **Tipografia:** títulos em grotesca pesada, apertada (tracking negativo, ex.: Inter Tight/Archivo/Space Grotesk 800), 1 palavra-chave por frase em verde; rótulos HUD em monoespaçada pequena e caixa-alta (JetBrains Mono/Space Mono).
- **Moldura HUD fixa em TODA cena:** canto sup. esq. "MOTION / 0NN" (número da cena muda), sup. dir. "REC 00:MM:SS" (relógio correndo), cruzes "+" nos 4 cantos, rodapé com micro-rótulo da cena ("PROMPT · 1 LINHA", "REFERÊNCIAS", "FLUXO ANTIGO · 5 PROGRAMAS"), chão em grade com perspectiva.
- **Acabamento (o que tira o ar de PowerPoint):** grão de filme, vinheta, bloom/glow nos verdes, leve aberração cromática, partículas de poeira, flare de lente, profundidade (3D com perspectiva) e câmera sempre em micro-movimento (push-in lento).
- **Uma ideia por cena, uma metáfora por ideia:** "acertar" = alvo + flecha; "keyframes" = chuva de losangos; "quadro a quadro" = tira de filme; "prompt" = caixa que digita; "fluxo antigo vs novo" = 5 cartões cortados vs 3 cartões acesos.
- **Texto sincronizado com a fala:** palavras entram no tempo exato da voz (cascata com blur→nítido), palavra-chave acende em verde NO momento em que é falada, a frase some antes da próxima.
- **Movimento (easing):** entradas com desaceleração forte (expo/cubic out), saídas rápidas; elementos com leve "overshoot"; nada linear; escalonamento (stagger) de 60–120 ms entre itens.
- **Transições:** varredura de luz, mergulho no túnel de grade, flash verde de tela cheia (fim → loop), corte seco no pico da palavra. Nunca "slide" padrão.
- **Ritmo:** troca de cena a cada 3–5 s, sempre num respiro/ênfase da fala; a cada 15–20 s um "quebra-padrão" (gag do PowerPoint 2009).
- **Estrutura de roteiro:** gancho-pergunta → promessa → "não é X, é Y" → detalhe que ninguém conta (tensão) → demonstração/explicação → antes×depois → "substitui? não, mas…" → CTA por comentário (palavra-chave "MOTION").

## Como produzir (nosso caminho)
1. Skill `hyperframes` (HTML + GSAP renderizado quadro a quadro; `npx hyperframes@0.9.46 init/check/render`) + `hyperframes-registry` (~450 blocos prontos: kinetic type, bloom, glitch, grão, câmera 3D) + `media-use` (trilha/efeitos sonoros).
2. Roteiro → áudio (voz do CEO ou voz gerada) → transcrição com tempo por palavra (`transcribe.py`) → storyboard por cena (1 ideia, 1 metáfora, palavras-chave em verde) → código por cena → `check` → ver quadros → render → mixar áudio.
3. A "Skill de Motion" da Agência = esta ficha + biblioteca de CENAS (alvo, prompt digitando, tira de filme, chuva de keyframes, cartões de referência, antes×depois, logo com chips, arco, CTA) + biblioteca de TRANSIÇÕES + tokens (cores, fontes, easings, moldura HUD). Guardar em `~/.claude/skills/motion-agencia/` quando o CEO aprovar.
4. Para outros clientes/nichos: trocar a PALETA e o jargão HUD, manter o esqueleto (moldura, ritmo, metáforas, sincronia).

## Limites / cuidados
- "Vídeo 100% feito com Claude sem ferramentas externas" é a afirmação do criador; o render do vídeo precisa de ferramenta (navegador/ffmpeg). Não repetir a frase como FATO nosso.
- Não copiar a identidade do criador (nome "MOTION", textos, logo M); usar o estilo e o método com nossa marca.
- Música/efeitos: só com licença livre.
