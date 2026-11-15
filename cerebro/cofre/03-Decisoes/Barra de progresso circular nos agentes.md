---
tipo: decisao
projetos: [Agencia IA Dream]
tags: [escritorio-3d, progresso, agentes]
criado: 2026-11-12
resumo: Pedido do CEO — anel de progresso sobre a cabeça de cada agente quando começa a trabalhar, enchendo conforme o trabalho avança; progresso real por etapas + estimado pelo histórico, com honestidade visual
---
# Barra de progresso circular sobre os agentes

- Pedido do CEO (12/11/2026, ~01h): ao começar a trabalhar, cada agente ganha um anel de progresso acima da cabeça que enche conforme o trabalho avança, para saber quanto falta.
- Limite honesto: os ganchos só sabem "recebeu tarefa" e "terminou"; não há % real. Solução (desenvolvedor, em andamento): (A) progresso REAL por etapas via `node escritorio/progresso.mjs <slug> <feito> <total> "<etapa>"` (agentes/gerente reportam a cada etapa; arco sólido); (B) progresso ESTIMADO pelo tempo decorrido ÷ duração esperada (mediana do histórico em `eventos.jsonl`, teto ~95% até "terminou"; arco tracejado com "~"; pulsa com "demorando mais que o normal"). `/estado` passa a devolver `inicio`, `progresso`, `fim`. Documentar em CLAUDE.md, no gerente-geral e numa linha em cada `.claude/agents/*.md`; `escritorio/LEIA-ME-PROGRESSO.md`.
- Anel é componente independente (billboard ancorado à cabeça) para a Fase 2 (personagens low-poly + etiquetas). Relacionado: [[Agente trabalhando senta na mesa]], [[Escritorio 3D igual ao Agent Office (referencia do CEO)]].

Projetos: [[Agencia IA Dream]]

- ENTREGUE (12/11, ~01h30): anel circular sobre a cabeça (cor do agente, % no centro, ✔ ao concluir, pop; clique seleciona o agente); REAL (arco sólido) via `node escritorio/progresso.mjs <slug> <feito> <total> "etapa"` ou `--pct`; ESTIMADO (tracejado "≈40%") por tempo ÷ mediana das últimas 20 execuções (padrão 10 min; 5 para o gerente; teto 95%; pulsa "demorando mais que o normal"). `/estado` devolve inicio/fim/progresso/esperadoMs/amostras. Arquivos: `progresso-anel.js` (componente reaproveitável p/ Fase 2), `progresso.mjs`, `LEIA-ME-PROGRESSO.md`, CLAUDE.md + seção "Progresso" nos 17 agentes (só valem em sessões novas). ~39 FPS com 14 anéis. Servidor real (5173) reiniciado solto no terminal. Conferi: anel aparece (≈48% → ≈75% no gerente). Limites: sem etapas reportadas é só estimativa; anéis se sobrepõem na vista aérea do salão; não testado no celular.
- BUG ACHADO por mim: "Assumir o Gerente" dá TELA PRETA (câmera 3ª pessoa dentro de parede/móvel atrás da mesa da gerência) após a reconstrução. Devolvi ao desenvolvedor: gerente levanta e começa em ponto livre, câmera com colisão, testes com prints em 4+ pontos e no celular. Lição: testar o modo andar (não só a vista aérea) antes de dar a fase como pronta.

- Ajuste (12/11, ~01h50): CEO achou o anel grande ("pode ser menor"). Reduzido de 64 px para 40 px (espessura 8→5, texto 10 px, ✔ 16 px) em `escritorio/progresso-anel.js` (`TAM`, `ESPESSURA`) e `estilo.css` (`.anel-prog`); `body.longe` ainda reduz a 72%. Conferido no navegador: legível com "≈71%", "≈31%", "≈4%". Preferência: elementos de interface sobre os personagens devem ser discretos.
