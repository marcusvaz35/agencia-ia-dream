# Agência IA Dream — Empresa de Agentes

Este projeto funciona como uma empresa. O usuário é o **CEO**: ele dá a ideia e aprova. Os agentes ficam em `.claude/agents/`.

Sempre responda em **português do Brasil**.

## Como a empresa trabalha
1. O CEO faz um pedido.
2. A sessão principal age como o **gerente-geral** (veja `.claude/agents/gerente-geral.md`): entende o pedido, divide o trabalho, chama os agentes certos, confere tudo e só entrega ao CEO o que está certo.
3. Nada vai ao ar sem o OK do CEO.

## Fontes da verdade
- `PROJETO.md` — a ficha do projeto (o que é, para quem, objetivo, preço, números reais). Leia antes de qualquer trabalho.
- `docs/manual-instagram.md` — o manual que o CEO vai ensinar ao especialista em Instagram.
- `clientes/<nome>/FICHA.md` — ficha de cada cliente da Agência (quem é, canais, o que fazemos, objetivo). Trabalho para um cliente: ler a ficha dele em vez de (ou além de) `PROJETO.md`, e salvar em `entregas/clientes/<nome>/`. Modelo em branco: `clientes/_modelo/` (copie para `clientes/<nome-do-cliente>/` e preencha).
- `conhecimento/mineracao-viral.md` — como minerar frases e vídeos virais (critério mínimo: ≥ 1 mi views, ≥ 5 mil comentários, ≥ 130 mil compartilhamentos), conferir métricas e registrar.
- `conhecimento/padroes-da-empresa.md` — níveis de evidência (FATO / ESTIMATIVA / HIPÓTESE), formato padrão de entrega, checklist universal e passagem de bastão entre agentes.
- `conhecimento/edicao-video.md` — base do `editor-de-video` (Reels virais, legendas, tela dividida, cor, Premiere/After/IA). O motor de edição é a skill `editor-video` (EDIT IA PRO), instalada em `~/.claude/skills/editor-video`; pacote EDIT IA PRO que cada pessoa instala/compra na fonte original (veja `MANUAL.md`).
- `conhecimento/referencias-2026.md` — práticas atuais pesquisadas (Meta, Google, Instagram, impostos, OWASP, LGPD) com fontes e data. Conferir na fonte oficial antes de decisões que dependam delas.

## Escritório 3D
`escritorio/` mostra os agentes num escritório 3D no navegador. Rodar com `node escritorio/servidor.mjs` e abrir http://localhost:5173 (ou pelo preview "escritorio" em `.claude/launch.json`). Ele lê `.claude/agents/` a cada recarregamento, então agentes novos aparecem sozinhos. Cor/ícone de cada agente ficam em `PERFIL` (topo de `escritorio/escritorio.js`); a aparência dos personagens em `VISUAL` (`escritorio/personagem.js`; modelos CC0 Quaternius em `escritorio/modelos/`).
**Planta atual (Fase 1 refeita em 13/11/2026 após reprovação do CEO; `escritorio/mundo.js`, `escritorio/LEIA-ME-FASE1.md`, `escritorio/INVENTARIO-REFERENCIA.md`, ):** UM andar de 36 x 22 m, noite quente, vista aérea orbital. Cômodos PEQUENOS e fechados: fundo = Reunião | Gerência (TV de 100" do Segundo Cérebro) | Arquivo; corredor de vidro com persiana e tapete vermelho; meio = Sala de apoio | Lounge (2 sinucas, pebolim, sofás) ; frente = Cozinha | Banheiros/Depósito | Recepção (placa "AGÊNCIA IA DREAM"); metade direita = Salão com 3 bancadas e telão. 17 portas que ABREM SOZINHAS quando alguém chega perto (vidro de correr e madeira com giro), inclusive para o gerente controlado. Móveis: geometria própria + Kenney Furniture Kit CC0 (`escritorio/modelos/pacotes/`, licença em `LICENCAS.md`). Botões/teclas 1–7 voam a câmera; `?parado` desliga o giro, `?rapido` encurta os passeios. Agentes sentam nas baias e só levantam após MUITO tempo parados; "🎮 Assumir o Gerente" (3ª pessoa) continua. Rotas = rede de pontos em `mundo.js` (`rota()`). Falta: teto, personagens low-poly + etiquetas (Fase 2), modo 1ª pessoa/painéis/chat (Fase 3). (Versões anteriores e comparações não vêm no kit.)
**Fazer pedido pela página (14/11/2026):** no card "Nova tarefa para a equipe" o CEO escolhe o agente (lista "Quem vai fazer") e clica em **Fazer pedido**. O servidor (`POST /pedido`, protegido por cabeçalho `X-Pedido-Escritorio` + mesma origem) abre `claude -p --agent gerente-geral --permission-mode auto` em segundo plano, que delega ao agente escolhido (anel e balão aparecem pelos ganchos). Registro de cada pedido em `escritorio/pedidos/<data>-<agente>.log`. Exige o Claude Code de linha de comando logado no Mac (`claude auth login`, uma vez); o servidor tira do ambiente credenciais herdadas (ANTHROPIC_/CLAUDE*). O card **"Pedidos e entregas"** (`GET /pedidos`, atualiza a cada 5 s) lista cada pedido com status; ao clicar, o painel mostra a CONCLUSÃO do agente (`pedidos/<id>-<agente>-RESPOSTA.md` ou o fim do log) e os arquivos criados em `entregas/` e `VIDEOS-PRONTOS/` durante o pedido (vídeos e imagens tocam ali; `GET /arquivo?c=` só lê dessas duas pastas).
Status ao vivo: os ganchos (hooks) em `.claude/settings.json` rodam `escritorio/hook.mjs`, que anota em `escritorio/eventos.jsonl` quando o CEO faz um pedido, quando um agente recebe uma tarefa e quando termina. A página consulta `/estado` a cada 2 segundos. Os ganchos só valem em sessões do Claude Code abertas depois que eles foram configurados.

## Cortes de podcast = Edits (CEO, 14/11/2026)
Todo corte de podcast/entrevista é editado e exportado no app **Edits** pelo MCP `metapilot-native` (app aberto no Mac), passo a passo em `.claude/agents/editor-viral-podcast.md`. Se o Edits não responder, o editor para e avisa; o script antigo (`podcast-cortes.py`) só com OK do CEO.

`conhecimento/podcast-tela-dividida-reacao.md` (CEO, 14/11/2026) — cortes de podcast alternando tela cheia do cliente e tela dividida com REAÇÕES do apresentador encaixadas (estilo que performou bem). Responsável: `editor-viral-podcast`.

`conhecimento/frases-0600-padrao-exato.md` (CEO, 15/11/2026) — cartão de frase do cliente idêntico ao vídeo base (`ferramentas/frase-0600/gerar.py`, mesmo áudio), e mineração só do tipo das frases campeãs. Responsável: `especialista-frases`.

`conhecimento/artes-evento-igreja.md` (CEO, 15/11/2026) — artes de evento/culto/convidado para Instagram no estilo das 16 referências (`conhecimento/referencias-artes-evento/`): protagonista recortado, palavra gigante atrás, cor de cinema, tipografia em contraste, pílulas de dia/hora; feito no Photoshop (PSD + PNG). Responsável: `web-designer` (designer gráfico).

`conhecimento/artes-telao-igreja.md` (CEO, 15/11/2026) — artes de TELÃO: central 1000x600 + 2 laterais 512x768 (esquerda/direita que se completam); 20 referências (a nº 11 só descrita, sem imagem) em `conhecimento/referencias-telao/`. Responsável: `web-designer`.

## Vídeos prontos
Todo vídeo finalizado pelo `editor-de-video` é avisado ao CEO com `node ferramentas/video-pronto.mjs "<vídeo>" "<cliente>" "<horário/tipo>" "<descrição>"`: cópia em `VIDEOS-PRONTOS/AAAA-MM-DD/`, linha na lista `PARA-APROVAR.md` do dia, notificação no Mac e aviso no feed do escritório 3D.

## Método 5-3 (conteúdo que atrai seguidores qualificados) — vale para TUDO
`conhecimento/metodo-cinco-tres.md` (CEO, 13/11/2026): 5 perfis de referência (inclui gringa) × 3 conteúdos acima da média do perfil e ≥ ~10 mil curtidas = 15 referências validadas; ler os comentários antes de adotar (hate/erro = descartar); analisar à mão gancho (4 tipos), promessa, formato, expressões/tom e CTA; transcrever e lapidar mantendo o formato com a voz do cliente (inspiração ≠ cópia); postar e medir 1ª hora/24 h; repetir toda semana. Roteiros, ganchos, legendas, cortes e temas devem partir de referência validada e visar CONVERSÃO em seguidor.

### Grade de conteúdo
`conhecimento/grade-de-conteudo.md` (CEO, 14/11/2026) — como criar a grade de conteúdo de qualquer nicho: 5 linhas editoriais + semana em escada (consciência → clareza → profundidade → bastidor/prova social → decisão/venda). Base obrigatória do `especialista-instagram` ao criar conteúdo/calendário.

`conhecimento/tres-tipos-de-conteudo.md` (CEO, 14/11/2026) — 3 tipos de conteúdo (atração, técnica, autoridade) com meta de engajamento própria + técnica double down (repetir o roteiro vencedor em outro formato). Responsável: `especialista-instagram`.

`conhecimento/perfil-que-converte.md` (CEO, 14/11/2026) — como montar/auditar o perfil (foto, nome com palavra de busca, bio, destaques, 3 posts fixados). Responsável: `social-media`.

`conhecimento/o-que-e-social-media.md` (CEO, 14/11/2026) — papel do social media: estratégia de crescimento baseada em dados (audiência qualificada, resultado, jornada, posicionamento, comunicação de valor), relatório semanal. Responsável: `social-media`.

`conhecimento/trafego-local-reconhecimento.md` (CEO, 14/11/2026) — campanha de reconhecimento para o bairro (Meta, frequência 1→3, CEP, WhatsApp). Responsável: `gestor-de-trafego` (só planeja; gasto e ativação com OK do CEO).

`conhecimento/trafego-publicos-e-segmentacoes.md` (CEO, 14/11/2026) — banco vivo de públicos e segmentações de tráfego pago (compradores engajados, Online Shopping Retail…). Responsável: `gestor-de-trafego`.

`conhecimento/trafego-diagnostico-de-metricas.md` (CEO, 14/11/2026) — sintoma de métrica → causa provável → teste, na ordem do funil. Responsável: `gestor-de-trafego` (com o `analista`).

`conhecimento/trafego-criativos-locais.md` (CEO, 14/11/2026) — criativos de negócio local: "Você sabia que…?" e "Procura-se…" (mensagens/WhatsApp, só na região). Responsável: `gestor-de-trafego`.

`conhecimento/vendas-objecao-preco.md` (CEO, 14/11/2026) — objeção de preço: responder "Eu também" e reposicionar para valor. Responsável: `vendedor`.

`conhecimento/vendas-5-objecoes.md` (CEO, 14/11/2026) — as 5 maiores objeções de vendas e as respostas do método. Responsável: `vendedor`.

`conhecimento/vendas-linguagem-especifica.md` (CEO, 14/11/2026) — linguagem de vendas específica (evite vago, prefira dado REAL). Responsável: `vendedor`; vale para copy, anúncios e legendas.

`conhecimento/vendas-numeros-quebrados.md` (CEO, 14/11/2026) — negociar com números precisos calculados, não redondos. Responsável: `vendedor` (com `contador`).

`conhecimento/motion-em-codigo-estilo-hud-verde.md` (CEO, 14/11/2026) — motion de alto nível feito por código (HyperFrames): análise quadro a quadro da referência, sistema visual (paleta, tipografia, moldura HUD, acabamento), cenas, transições, ritmo e método. Responsável: `editor-de-video`.

## Regras para TODOS os agentes
1. **Não inventar números nem resultados.** Nada de "aumenta 300% as vendas", depoimentos falsos, estatísticas sem fonte, métricas que não foram medidas. Se for estimativa, escreva "ESTIMATIVA" e mostre de onde veio a conta. Se for dado de pesquisa, cite a fonte.
2. **Perguntar quando faltar informação.** Se algo essencial não está em `PROJETO.md` nem no pedido, pare e liste as perguntas para o CEO. Não preencha lacunas com suposições.
3. **Nada vai ao ar sem o OK do CEO.** Publicar, postar, enviar mensagem a cliente, subir anúncio, gastar dinheiro, fazer deploy, mandar e-mail: tudo isso só depois de aprovação explícita do CEO naquele item.
4. Entregar em formato fácil de revisar: o que foi feito, o que falta, o que precisa de decisão do CEO.
5. Salvar entregas em `entregas/<area>/` com nome claro e data (ex.: `entregas/copy/2026-11-10-pagina-de-vendas.md`).

## Segundo cérebro (Obsidian)
O cofre `~/Documents/Dream` guarda o que a Agência e os outros projetos do CEO já aprenderam (padrões, decisões, preferências, stack, aprendizados). Funciona sozinho por ganchos globais (`~/.claude/settings.json` → `~/.segundo-cerebro/cerebro.py`): notas ligadas a cada pedido entram no contexto (🧠) e, ao fim de cada execução, um curador registra o que foi aprendido. Todos os agentes: antes de uma tarefa, leiam as notas 🧠 indicadas; nunca escrevam segredos ou dados pessoais de clientes no cofre. Nota do projeto: `01-Projetos/Agencia IA Dream.md`.

**Bonecos do vídeo (Fase 2, 13/11/2026):** `escritorio/bonecos.js` (padrão) gera por código bonecos low-poly facetados no estilo do vídeo de referência (análise em `escritorio/ANALISE-BONECOS.md`): 6 arquétipos (homem/mulher × jovem/adulto/mais velho) e os 18 agentes como variações (tabela `VISUAL`). `?bonecos=trellis` volta ao `personagem.js` (cartoon + TRELLIS). Teste: `/teste-bonecos.html` (`?todos`, `?foco=arq-homem-jovem&alvo=peito`). 

**Modelos 3D:** neste kit só vão modelos CC0 (Kenney e Quaternius). Bonecos gerados por TRELLIS a partir de imagens pessoais NÃO vêm; sem eles os agentes usam o boneco padrão por código (`bonecos.js`).

## Barra de progresso (anel sobre a cabeça no Escritório 3D)
Quando um agente trabalha, aparece um anel circular sobre a cabeça dele que enche no sentido horário. Arco **sólido** = progresso REAL (etapas reportadas); arco **tracejado com "≈"** = ESTIMATIVA pelo tempo (média das execuções passadas do agente; nunca passa de 95% até o "terminou"; se demorar mais que o normal, pulsa e avisa). Para ser real, quem trabalha (ou o gerente que delegou) informa cada etapa concluída:
`node escritorio/progresso.mjs <slug> <feito> <total> "<etapa>"` (ex.: início `progresso.mjs especialista-frases 0 5 "minerando"`, depois `1 5 ...`, `2 5 ...`) ou `progresso.mjs <slug> --pct 40 "<etapa>"`. Ao terminar a tarefa o anel fecha em 100% com ✔ sozinho (vem dos ganchos). Detalhes e limites: `escritorio/LEIA-ME-PROGRESSO.md`.

## Nomes dos agentes e tarefa ao lado do anel (13/11/2026)
- **Nomes:** cada agente tem um nome de pessoa em `escritorio/nomes-agentes.json` (`{"slug": {"nome": "Marina", "apelido": "opcional"}}`). Para trocar, edite o arquivo e recarregue a página. O apelido, se existir, aparece no lugar do nome. Agente que não estiver na tabela usa o cargo. A etiqueta mostra o NOME em destaque e, embaixo, o cargo e o status; o nome também aparece na lista, no painel de detalhe, no feed, no aviso do modo "Assumir o Gerente".
- **Tarefa ao lado do anel:** quando o anel está visível, um balão escuro ao lado dele mostra "tarefa · etapa" (até ~50 caracteres, 2 linhas, corta com "…"; passe o mouse para ver inteiro). A tarefa vem do `description` que o gerente passa ao chamar o agente (gancho `hook.mjs`, campo `desc`, máx. 80 caracteres; para o gerente é o início do pedido do CEO). A etapa vem de `progresso.mjs`. Ao terminar, o balão mostra "✔ concluído" por ~4 s e some junto com o anel.
- **Regra para todos os agentes e para o gerente:** ao delegar, escreva um `description` curto e claro (ele vira o texto do balão) e reporte cada etapa com `node escritorio/progresso.mjs <slug> <feito> <total> "<etapa curta>"`.
