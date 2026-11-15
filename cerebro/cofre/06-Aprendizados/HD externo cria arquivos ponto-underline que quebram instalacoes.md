---
tipo: aprendizado
projetos: [Agencia IA Dream]
tags: [macos, hd-externo, uv, python]
criado: 2026-11-12
resumo: No HD externo (Agência) o macOS cria arquivos ._* que quebram uv sync e leitores de JSON; criar venv no disco interno e apagar ._*
---
# HD externo cria arquivos `._*` que quebram instalações

- Sintoma 1: `uv sync` falha copiando `._*.h` ("No such file"). Solução: `UV_PROJECT_ENVIRONMENT=~/.maquina-4h/<nome>-venv UV_LINK_MODE=copy uv sync` (venv no disco interno).
- Sintoma 2: código que lê `*.json` por glob lê `._arquivo.json` e dá UnicodeDecodeError. Solução: `find <pasta> -name '._*' -delete` (excluir node_modules) antes de rodar.
- Visto ao instalar o MiroFish ([[MiroFish e agente Oraculo]]).

Projetos: [[Agencia IA Dream]]
