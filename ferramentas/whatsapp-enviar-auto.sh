#!/bin/zsh
# Envia o texto do arquivo para o chat do próprio CEO no WhatsApp do Mac, SEM clicar (deep link + Enter via Acessibilidade).
# Requisitos: WHATSAPP_PARA em ~/.maquina-4h/segredos.env, WhatsApp instalado e logado, Mac desbloqueado, Acessibilidade liberada.
# Uso: ferramentas/whatsapp-enviar-auto.sh <arquivo.txt>
DIR="$(cd "$(dirname "$0")" && pwd)"
[ -f "$HOME/.maquina-4h/segredos.env" ] && set -a && . "$HOME/.maquina-4h/segredos.env" && set +a
[ -n "$WHATSAPP_PARA" ] || { echo "WHATSAPP_PARA não definido: não envio (evita mandar para o chat errado)"; exit 2; }
"$DIR/whatsapp-abrir.sh" "$1" || exit 1
sleep 5
osascript -e 'tell application "WhatsApp" to activate' -e 'delay 1.5' -e 'tell application "System Events" to keystroke return' && echo "Enter enviado"
