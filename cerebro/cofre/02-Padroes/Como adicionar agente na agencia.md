---
tipo: padrao
projetos: [Agencia IA Dream]
tags: [padrao, agentes, escritorio]
criado: 2026-11-11
atualizado: 2026-11-11
resumo: Checklist para contratar um agente novo na Agência IA Dream (arquivo, gerente, grade, escritório 3D)
---
# Como adicionar agente na agencia

1. `.claude/agents/<slug>.md` com frontmatter `name`/`description`, missão, antes de começar, tarefas, formato de entrega e regras da empresa (não inventar, perguntar, nada vai ao ar sem OK).
2. Linha na tabela da equipe em `.claude/agents/gerente-geral.md`.
3. Se mexe na rotina do cliente: atualizar o fluxo em `clientes/<cliente>/GRADE-DIARIA.md`.
4. Escritório 3D: entrada em `PERFIL` (`escritorio/escritorio.js`: nome, cor, sala, ícone) e em `VISUAL` (`escritorio/personagem.js`). A Área de Trabalho tem 10 mesas.
5. Agente criado no meio da sessão pode não ser chamável pelo nome até uma sessão nova — usar general-purpose com o arquivo do agente.

Projetos: [[Agencia IA Dream]]
