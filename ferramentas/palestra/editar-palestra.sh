#!/bin/bash
# Uso: ferramentas/palestra/editar-palestra.sh <bruto> [--modo rapido|completo] [--cliente cliente-exemplo] [--plano plano.json] [--nome X] [--so-transcrever]
# Sem --plano o proprio script escolhe o trecho (gancho -> contexto -> impacto) e imprime AVISO se o material nao sustenta.
cd "$(dirname "$0")" && exec uv run --directory "$HOME/.claude/skills/editor-video" python "$PWD/editar_palestra.py" "$@"
