#!/bin/zsh
# Abre o WhatsApp do Mac com o texto do arquivo pronto (NÃO envia: o usuário confere e aperta Enter).
# Uso: ferramentas/whatsapp-abrir.sh <arquivo.txt>
# Se WHATSAPP_PARA (DDI+DDD+número, só dígitos) existir em ~/.maquina-4h/segredos.env, abre direto o chat dele ("Você").
f="$1"; [ -f "$f" ] || { echo "arquivo não existe: $f"; exit 1; }
[ -f "$HOME/.maquina-4h/segredos.env" ] && set -a && . "$HOME/.maquina-4h/segredos.env" && set +a
txt=$(python3 -c 'import sys,urllib.parse;print(urllib.parse.quote(open(sys.argv[1],encoding="utf-8").read()))' "$f")
if [ -n "$WHATSAPP_PARA" ]; then open "whatsapp://send?phone=${WHATSAPP_PARA}&text=${txt}"; else open "whatsapp://send?text=${txt}"; fi
