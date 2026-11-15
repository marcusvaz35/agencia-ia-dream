#!/bin/zsh
# Liga o MiroFish (backend em :5001 e site em :3000). Usa o ambiente Python no disco interno
# (o disco externo gera arquivos ._ que quebram a instalação). NÃO roda simulação sozinho.
R="$(cd "$(dirname "$0")" && pwd)/repo"
find "$R" -name '._*' -not -path '*/node_modules/*' -delete 2>/dev/null
cd "$R/backend" && set -a && . "$R/.env" && set +a
"$HOME/.maquina-4h/mirofish-venv/bin/python" run.py &
cd "$R/frontend" && npm run dev
