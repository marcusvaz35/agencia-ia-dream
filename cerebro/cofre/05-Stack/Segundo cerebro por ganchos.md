---
tipo: stack
projetos: [todos]
tags: [stack, obsidian, ganchos]
criado: 2026-11-11
atualizado: 2026-11-11
resumo: Cofre Obsidian ligado a qualquer projeto: SessionStart/UserPromptSubmit injetam notas; Stop pede registro à própria sessão
---
# Segundo cerebro por ganchos

- Motor `~/.segundo-cerebro/cerebro.py` (inicio, buscar, registrar, indices); ganchos em `~/.claude/settings.json` e `~/.codex/hooks.json` (Codex pede para aprovar uma vez).
- Modo `sessao` (padrão): o gancho Stop devolve `decision: block` uma vez por turno e a própria sessão registra.
- Escritório 3D: `/cerebro` no servidor + `escritorio/cerebro-tv.js` desenham a TV.

Projetos: [[Agencia IA Dream]]
