---
tipo: stack
projetos: [todos]
tags: [stack, tokens, claude-code]
criado: 2026-11-11
atualizado: 2026-11-11
resumo: caveman, rtk e context-mode foram testados em 11/11/2026 e REMOVIDOS a pedido do usuário; não reinstalar sem ele pedir
---
# Ferramentas para economizar tokens

> **Removidas no mesmo dia (11/11/2026)** — o usuário pediu para voltar tudo como antes. Não reinstalar sem pedido explícito. Motivos observados: rtk quebra a aprovação do modo auto (cada Bash precisava ser reenviado) e caveman deixa as respostas truncadas.

Instaladas em 11/11/2026 a pedido do usuário (valem em todos os projetos do Claude Code):
- **caveman** 4.1.0 (plugin) — respostas curtas. Telemetria desligada com `DO_NOT_TRACK=1` em `~/.claude/settings.json`. Desligar: `claude plugin uninstall caveman@caveman` ou "stop caveman". Choca com a preferência [[Responder em portugues simples]].
- **rtk** 1.2.0 (brew) — gancho PreToolUse Bash `rtk hook claude` + `@RTK.md` no `~/.claude/CLAUDE.md`. `rtk gain` mostra economia. Desligar: `rtk init -g --uninstall`. **Problema:** no modo auto o classificador recusa o comando reescrito e exige reenviar cada Bash.
- **context-mode** 2.1.7 (plugin) — saídas grandes ficam fora do contexto. Desligar: `claude plugin uninstall context-mode@context-mode`.
- **code-review-graph** — não instalado (Agência tem pouco código).
- **claude-token-optimizer** — `measure`: 2.759 tokens carregados na Agência; `prune`: nada a podar.
Dica: antes de mexer em `~/.claude/settings.json` ou no `CLAUDE.md`, faça uma cópia de backup datada.

Projetos: [[Agencia IA Dream]]
