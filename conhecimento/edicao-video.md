# Edição de vídeo — base de conhecimento do editor (pesquisa de novembro de 2026)

Complementa o método do **EDIT IA PRO** (skill `editor-video`, instalada em `~/.claude/skills/editor-video`; pacote original com exemplos em `~/EDIT-IA-PRO`). Quando houver conflito, **o método do EDIT IA PRO vale** (corte pela onda, entrada na palavra, amostra antes do todo, portão de qualidade).

> A maior parte das fontes abaixo é de blogs de ferramentas e criadores. Números que elas citam (retenção, "% assistem sem som") são indicativos, **não** garantia, e não devem ser prometidos ao CEO ou a clientes.

---

## 1. Corte viral para Instagram (Reels)
- **Gancho em 1–3 s:** o assunto aparece logo, sem "oi, gente", sem logo, sem respiro. Texto na tela + fala + movimento no primeiro quadro.
- **Retenção vem de sequência, não só de velocidade:** abertura forte, ritmo enxuto, legenda que se lê num relance, mudanças visuais que **avançam a ideia** e corte de tudo que atrasa o ponto. Cada "é…", repetição ou respiro é uma chance de a pessoa rolar a tela.
- **Algo muda na tela a cada 2–4 s** (regra do EDIT IA PRO): zoom, peça gráfica, troca de enquadramento, B-roll. Uma ideia por vez.
- **Um clipe = uma promessa.** Corte de podcast/live não resume o episódio: escolhe um trecho que se sustenta sozinho (começo, tensão, desfecho).
- **Duração:** decidir pelo conteúdo, não por regra fixa. As fontes variam (15–30 s, 30–60 s, até 90 s). Medir no Insights.
- **Final:** payoff claro ou CTA único; quando fizer sentido, final que "volta" ao começo (loop).
- **Medir:** gráfico de retenção do Reel ~48 h depois de postar; ver onde as pessoas saem e corrigir o padrão.
- Fontes: [Async — 17 dicas de retenção](https://async.com/blog/how-to-edit-instagram-reels/), [Captions — como fazer Reels](https://captions.ai/blog/how-to-make-instagram-reels), [Quso — boas práticas Reels 2026](https://quso.ai/blog/instagram-reels-best-practices.html), [Creatify](https://creatify.ai/blog/how-to-make-a-great-reel-create-engaging-instagram-content-in-minutes), [Subclip — vídeos longos em curtos](https://subclip.app/blogs/how-to-turn-long-videos-into-shorts), [Opus — estratégia de vídeo curto 2026](https://www.opus.pro/blog/short-form-video-strategy-2026), [Descript](https://descript.com/blog/article/edit-short-form-video)

## 2. Headline e legendas dinâmicas
- **Headline fixa no topo** (zona segura) nos primeiros segundos: promessa ou curiosidade em até ~8 palavras, letra grande, alto contraste.
- **Legenda é o "veículo do gancho"**, não enfeite: muita gente assiste sem som.
- Regras do EDIT IA PRO: **até 3 palavras por vez**, nenhuma palavra dita some, entra no tempo exato da palavra (medido na onda). Quando a frase vira lettering grande, a legenda discreta continua só nas palavras que não estão grandes.
- Legível no celular: fonte sem serifa e grossa, alto contraste (branco com contorno/sombra preta é a escolha segura), palavra-chave em cor de destaque, posição dentro da zona segura do Reels (1080×1920: texto entre y 230–1530 e x 140–940).
- Colocar texto **depois** do corte travado — a história manda no texto, não o contrário.
- Bloco de texto denso faz a pessoa escolher entre ler e assistir, e ela sai.
- Fontes: [Captions](https://www.captions.ai/blog-post/how-to-make-a-reel), [Quso — podcast shorts](https://quso.ai/blog/how-to-edit-podcast-shorts-like-a-pro.html), [Reap](https://reap.video/blog/ai-video-editing-for-podcasters)

## 3. Lettering, gráficos e exemplos na tela
- Peça que **transforma o que está sendo dito** (número vira contador, lista vira checklist, passos viram passo a passo, comparação vira antes/depois, prova vira prova) — tabela "Que peça para cada tipo de fala" do EDIT IA PRO (`references/direcao-por-blocos.md`).
- Lettering com 3 papéis (principal, apoio, chamada) e movimento que combina com o sentido da frase (`references/lettering.md`).
- Rosto livre: nada em cima de olhos e boca. Peças acima da cabeça quando a pessoa está em cena.
- Cena de tela cheia sem a pessoa: no máximo 1 a cada 15–20 s.

## 4. Tela dividida (split screen)
Não encontrei fonte confiável com regras específicas; usar estes padrões de mercado como ponto de partida e validar no Insights:
- **Reação / comentário:** conteúdo de referência em cima, pessoa reagindo embaixo (9:16 empilhado 50/50 ou 60/40).
- **Antes × depois / comparação:** lado a lado ou em cima/embaixo, com rótulo em cada metade (peça `comparar` do EDIT IA PRO).
- **Tutorial:** tela gravada em cima, rosto embaixo (ou rosto pequeno em moldura — `contida`/moldura).
- **Podcast com 2 pessoas:** uma em cima, outra embaixo, com destaque em quem fala.
- Regras: legenda na divisa ou na metade de baixo sem cobrir rostos; uma metade "principal" por vez (a outra pode ficar menos saturada); nada de texto importante fora da zona segura.

## 5. Cor (correção e grading)
**Ordem obrigatória: corrigir antes de estilizar.**
1. **Correção técnica:** exposição (waveform/parade: pretos sem esmagar, brancos sem estourar), balanço de branco, contraste, igualar tomadas da mesma cena.
2. **Pele:** isolar um pedaço de pele (máscara) e conferir no **vectorscópio** na linha de tom de pele (entre vermelho e amarelo, ~10h30–11h). Consistência entre planos da mesma pessoa importa mais que a posição exata.
3. **Grading criativo:** look da marca/referência (contraste, curvas, separação de cores, saturação seletiva com curvas Hue vs Sat).
4. **LUT é ponto de partida, não o look final**; sempre ajustar depois. Copiar o ajuste/usar camada de ajuste para manter consistência.
5. Conferir no celular (onde o público assiste) e não confiar só no monitor.
- **No Premiere:** painel Lumetri Color (Basic → Creative → Curves → Color Wheels/Match → HSL Secondary) e Lumetri Scopes.
- **Fora do Premiere (automático):** filtros do ffmpeg (`eq`, `colorbalance`, `curves`, `lut3d` com `.cube`) — dá para gerar um `.cube` e usar o **mesmo** look no Premiere e no ffmpeg.
- Fontes: [Adobe — corrigir tons de pele](https://helpx.adobe.com/lt/premiere-pro/how-to/correct-skin-tones.html), [Artlist — color grading no Premiere](https://artlist.io/blog/premiere-pro-color-grading/), [Boris FX — tons de pele](https://borisfx.com/blog/expert-tips-correct-skin-tones-in-premiere-pro/), [PremiumBeat — vectorscópio](https://www.premiumbeat.com/blog/vectorscope-premiere-pro/), [Pixflow — tutorial de grading](https://pixflow.net/blog/premiere-pro-color-grading-tutorial/)

## 6. Premiere, After Effects e IA — o que é possível de verdade
- **O agente não clica dentro do Premiere ou do After Effects.** Ele entrega arquivos que esses programas abrem:
  - **Corte para o Premiere:** lista de cortes/XML (FCP XML/EDL) gerada a partir do `edl.json` do EDIT IA PRO, legendas `.srt`, LUT `.cube`, guia de cor com valores do Lumetri.
  - **After Effects:** script `.jsx` (ExtendScript) que cria composições de texto animado/lettering com os tempos de cada palavra; o editor humano abre e roda em Arquivo > Scripts.
  - **MOGRT** (modelo de gráfico para o Premiere) é criado no After Effects; a automação dos parâmetros por script é limitada.
- **Estado da automação Adobe (2026):** a Adobe está migrando o Premiere para **UXP**; o ExtendScript do Premiere não recebe melhorias e o calendário de fim é controverso nos fóruns. O After Effects ainda não tem UXP; segue com ExtendScript. Conferir antes de construir automação nova.
- **Recursos de IA do Premiere (versão 26, agora chamada só "Premiere"):** Object Mask (selecionar e rastrear pessoa/objeto com um clique), Generative Extend (Firefly), Media Intelligence (busca por conteúdo), transcrição/legendas. Conferir a página oficial "What's New" para detalhes atuais.
- **IA generativa paga** (imagem, vídeo, voz, trilha) só com OK do CEO — custa dinheiro (regra do EDIT IA PRO e da empresa).
- Fontes: [Adobe Community — Premiere 26.0](https://community.adobe.com/announcements-727/welcome-to-adobe-premiere-26-0-1552341), [ProVideo Coalition — IA e máscaras no Premiere](https://www.provideocoalition.com/new-ai-and-masking-tools-in-premiere-plus-major-upgrade-to-after-e%ef%ac%80ects/), [Digital Production — Premiere 26](https://digitalproduction.com/2026/01/22/premiere-drops-the-pro-and-picks-up-some-serious-ai/), [Guia de scripting do Premiere](https://ppro-scripting.docsforadobe.dev/), [Fórum Adobe — UXP e MOGRT](https://forums.creativeclouddeveloper.com/t/uxp-api-parity-for-mogrt-parameter-control-current-extendscript-support-status/12131)

## 7. Referências enviadas pelo CEO
Fluxo do EDIT IA PRO: **medir** a referência (`references/referencia-medir.md`: ritmo de cortes, tamanho e posição de texto, paleta, transições, som) → resumo de 5 linhas do que será aproveitado → **aplicar** no vídeo do CEO (`references/referencia-aplicar.md`). Copiar o **estilo e a estrutura**, nunca o conteúdo, a marca ou a música de terceiros.
