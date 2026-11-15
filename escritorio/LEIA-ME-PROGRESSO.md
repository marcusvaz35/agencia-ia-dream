# Barra de progresso circular (anel sobre a cabeça)

## O que o CEO vê
Quando um agente começa a trabalhar, aparece um anel sobre a cabeça dele. O arco colorido (cor do agente) cresce no sentido horário a partir do topo, com animação suave. No centro, a porcentagem.
- **Arco sólido, "40%"** = progresso REAL: o agente (ou o gerente) informou etapas concluídas. Passe o mouse: mostra "3/5 — etapa".
- **Arco tracejado, "≈40%"** = ESTIMATIVA pelo tempo decorrido. Passe o mouse: mostra "X de ~Y min, mediana de N execuções".
- Passou do tempo esperado: o anel fica em 95%, pulsa e mostra "demorando mais que o normal". Nunca fica em 100% antes do "terminou".
- Terminou: preenche até 100%, mostra ✔ por ~1,5 s e some com um "pop"; aí aparece o ✅ de sempre.
- Clicar no anel seleciona o agente (como o rótulo). O painel do agente mostra "progresso real 3/5" ou "estimativa pelo tempo".

## Como os agentes informam o progresso real
`node escritorio/progresso.mjs <slug> <feito> <total> ["etapa"]`   ou   `node escritorio/progresso.mjs <slug> --pct 40 ["etapa"]`
Grava uma linha `{"ev":"Progresso", agente, feito, total, pct, etapa, t}` em `escritorio/eventos.jsonl` (mesmo arquivo do `hook.mjs`). Slug inválido é recusado com a lista dos válidos. Regra escrita em `CLAUDE.md`, em `gerente-geral.md` e numa seção "Progresso" no fim de cada agente.

## Como a estimativa é calculada (`servidor.mjs`, `/estado`)
- Duração esperada = MEDIANA das últimas 20 execuções do agente (par início→fim em eventos.jsonl), ignorando as que duraram mais de 3x ou menos de 1/5 da mediana e as menores que 5 s ou maiores que 2 h.
- Sem histórico: padrão de 10 min (5 min para o gerente). É ESTIMATIVA, e o `/estado` avisa (`fonteEsperado: "padrao"`).
- Percentual = 95% x (tempo decorrido ÷ duração esperada), com teto de 95%.
- `/estado` devolve por agente: `inicio`, `fim`, `progresso {feito,total,pct,etapa,atualizadoEm}`, `esperadoMs`, `amostras`, `fonteEsperado`.

## Casos tratados
- Nova tarefa para quem já trabalha: reinicia o anel (novo `inicio`). O par PreToolUse + SubagentStart da MESMA tarefa não reinicia.
- Vários agentes ao mesmo tempo: cada um tem seu anel e seu histórico.
- "Terminou" sem "início": nenhum anel (não há o que fechar).
- Trabalho sem "terminou" há mais de 2 h: descartado (anel some).
- Relatório de progresso de quem estava parado: começa o trabalho daquele agente. Relatório até 3 s depois do "terminou" é ignorado.

## Arquivos
`escritorio/progresso-anel.js` (componente independente: `criarAnel`, `estimarPorTempo`; é um elemento HTML ancorado na etiqueta que já segue a cabeça, então tem tamanho constante na tela e serve para a Fase 2), `escritorio/progresso.mjs` (ferramenta), `servidor.mjs` (cálculo), `escritorio.js` (ligação: `atualizarAneis`), `estilo.css` (bloco "Anel de progresso").

## Testes feitos (13/11/2026)
Servidor de teste em outra porta com arquivo de eventos falso (`PORT=5174 EVENTOS_ARQ=/caminho/teste.jsonl node escritorio/servidor.mjs`; `progresso.mjs` também respeita `EVENTOS_ARQ`). O `eventos.jsonl` real não foi tocado (conferido: 0 eventos de teste).
- 16 agentes com anel ao mesmo tempo (4 reais, 12 estimados, 1 demorando, 1 reiniciado, 1 "terminou sem início"): anéis aparecem, enchem, ✔ e somem; console sem erros.
- Vista geral, zona Salão, modo andar (anel acompanha o gerente) e `?rapido`.
- Desempenho no painel do navegador do Mac: ~39 quadros/s com 14 anéis (antes ~46 sem anéis, ESTIMATIVA/medida do LEIA-ME-FASE1).
- Prints: `escritorio/progresso-prints/`.

## Limites
- Sem etapas reportadas, o % é só estimativa pelo tempo: pode errar muito (tarefas com tamanhos diferentes). Por isso o tracejado e o "≈".
- Na vista geral com muitos agentes trabalhando juntos na mesma sala os anéis se sobrepõem (ficam menores à distância; o de quem está mais perto fica por cima). Use os botões de zona para ver de perto.
- O histórico vem do `eventos.jsonl`, que o servidor corta em ~1500 linhas: poucas execuções antigas ficam guardadas.
- Os ganchos só valem em sessões do Claude Code abertas depois de configurados (como o resto do status ao vivo). O `progresso.mjs` não precisa de gancho.
- Não foi testado em celular. No modo andar, o fundo escuro do print é da câmera já existente, não do anel.

## Correção do modo "Assumir o Gerente" (tela preta) — 13/11/2026
Causa (não era o anel): o gerente assumido começava sentado na mesa, de frente para o sul, e a câmera de 3ª pessoa ficava 4,8 m atrás dele, ou seja, FORA do prédio, olhando a face externa preta da parede norte.
Correções em `escritorio.js`: (1) ao assumir, se ele está na mesa, levanta e aparece em frente à mesa, rumo à porta da sala (`PONTO_INICIAL_GERENTE`); (2) câmera com colisão (`posCamera3`): anda para trás até bater numa parede e, nesse caso, fica mais perto e mais alta (passa por cima da parede de 2,7 m); limites do prédio respeitados; (3) Esc: ele volta sozinho à mesa (testado: voltou e sentou); (4) a câmera já começa na posição certa, sem voar por dentro das paredes.
Testado no navegador (desktop e 375 px): início na sala da gerência, atravessar a porta da gerência, corredor, lounge (sinuca), cozinha, salão (porta de vidro abre), botões de seta na tela e WASD. Prints `andar-*.jpg` em `progresso-prints/`. Limite: nos corredores estreitos a câmera fica alta, olhando quase de cima.

## Nomes e balão da tarefa (13/11/2026)
- Tabela de nomes: `escritorio/nomes-agentes.json` (editável; `nome` e `apelido` opcional; sem entrada = cargo). Lida pela página ao carregar (`escritorio.js`, `NOMES`).
- Balão ao lado do anel (`.tarefa-bal`, DOM dentro da etiqueta que segue a cabeça, então funciona com os 3 motores de boneco, vista aérea, câmeras 1–7 e "Assumir o Gerente"). Texto = `tarefa · etapa`: tarefa = campo `tarefa` de `/estado` (vem do `desc` do `hook.mjs`: `description` do Agent, ou início do `prompt` se faltar, máx. 80 caracteres); etapa = `progresso.etapa` (`progresso.mjs`). Só tarefa ou só etapa: mostra a que houver. Agentes alternam lado direito/esquerdo para reduzir sobreposição.
- Concluído: o anel agora fica ✔ por ~4 s (antes 1,5 s) e o balão mostra "✔ concluído".
- Vista aérea: quem trabalha mostra só o nome (os demais viram bolinha) e o balão em 1 linha; de perto, nome + cargo + balão de 2 linhas.
- Limite: com muitos agentes na mesma sala os balões se sobrepõem na vista aérea (use os botões de zona). Os eventos de teste foram gravados num arquivo falso (`EVENTOS_ARQ`), o `eventos.jsonl` real não foi poluído.
- Regra: ao delegar, `description` curto e claro; reportar etapas com `progresso.mjs`.
