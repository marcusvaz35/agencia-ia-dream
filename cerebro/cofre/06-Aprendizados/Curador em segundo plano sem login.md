---
tipo: aprendizado
projetos: [todos]
tags: [aprendizado, ganchos, automacao]
criado: 2026-11-11
atualizado: 2026-11-11
resumo: claude -p e codex exec em segundo plano podem falhar: variáveis do app desktop (API key sem crédito), OAuth do terminal vencido, limite do Codex
---
# Curador em segundo plano sem login

- Dentro do app, o ambiente traz ANTHROPIC_API_KEY do host → `Credit balance is too low`. Limpar ANTHROPIC_*/CLAUDE_CODE_* não basta se o terminal não tem login.
- Solução adotada: registro feito pela própria sessão (gancho Stop com block).

Projetos: [[Agencia IA Dream]]
