---
tipo: stack
projetos: [Agencia IA Dream]
tags: [remote-control, iphone, sendUserFile, celular]
criado: 2026-11-13
resumo: Como o CEO acompanha a sessão e recebe vídeos prontos no iPhone — Remote Control ligado + SendUserFile proativo (versão leve < ~10 MB)
---
# Remote Control + envio de arquivos ao celular

- Ligar: ferramenta `mcp__ccd_session_mgmt__set_remote_control` (`session_id: "self"`, `enabled: true`) — só quando o usuário pede ("claude rc"). Se o classificador disser que um hook alterou a entrada, repetir a chamada UMA vez com o campo `session` indicado. Verificar com `get_session` (`remoteControlState`).
- Enviar arquivo: `SendUserFile` com `status: "proactive"` e `display: "attach"` (cartão de download) ou `"render"` (prévia). Usar a versão leve do vídeo (< 9,5 MB). A resposta traz `file_uuid` (entrega na conversa; chegada no iPhone não é verificável por mim).
- Limites: Mac ligado, app Claude aberto e online; sessão só aparece no app do celular com a mesma conta; vídeo bruto continua entrando por AirDrop.
- Relacionado: [[Fluxo postar rapido]], [[Fluxo celular para editor de palestras]].

Projetos: [[Agencia IA Dream]]

- 13/11: WhatsApp como canal alternativo — WhatsApp Web no Chrome do CEO pediu QR (não logado). Se o CEO escanear (Aparelhos conectados), dá para enviar texto/arquivo ao chat "Você" via Chrome; envio programado exige sessão do WhatsApp Web ativa e Chrome aberto. Via oficial: Cloud API (guia em `entregas/projetos/maquina-4h/`). Subagentes de pesquisa devem fechar suas abas do Chrome ao terminar.

- 13/11: usar apps nativos do Mac (ex.: WhatsApp desktop) exige as ferramentas de Computer use (`mcp__computer-use__*`), que dependem de Configurações › Este computador › Computer use LIGADO pelo CEO; sem isso não há controle de apps nativos nem fallback por Chrome (WhatsApp Web pede QR). Acesso por app + tela desbloqueada; tarefas agendadas sem o CEO por perto não são confiáveis para isso.

- 13/11 atalho WhatsApp desktop sem Computer use: `open "whatsapp://send?text=$(python3 -c 'import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]))' "<texto>")"` abre o app com rascunho; o usuário escolhe o chat e envia. Para enviar sozinho: Computer use (só em sessão que carregou as ferramentas), API oficial da Meta ou o app Claude no iPhone (SendUserFile proativo).

- 13/11 envio automático no WhatsApp do Mac: deep link com `phone=` (variável `WHATSAPP_PARA`, DDI+DDD+número, só dígitos) abre o chat com o texto; o Enter exige Acessibilidade para o app que roda o `osascript` (erro 1002 sem ela). Teste depois da permissão: `osascript -e 'tell application "WhatsApp" to activate' -e 'delay 1.5' -e 'tell application "System Events" to keystroke return'`. Só envia para o chat que o deep link abriu (próprio CEO).

- 14/11: SendUserFile só chega ao celular até 30 MiB (acima disso fica só no app do Mac). Para postar pelo celular em qualidade total: copiar o vídeo original + legenda .txt para iCloud Drive › "Agencia - Para postar/<Cliente>/<AAAA-MM-DD>/" (pasta POR CLIENTE, ex.: `~/Library/Mobile Documents/com~apple~CloudDocs/Agencia - Para postar/Cliente Exemplo/2026-11-14/`) e cópia em `entregas/clientes/<cliente>/videos/<data>/`; o CEO abre no app Arquivos. Nunca mandar a versão leve para postar ([[Nao subir a versao leve no Instagram]]).

- 14/11: se o iCloud estiver sem espaço (erro CKErrorDomain 25 / needs-upload), arquivos salvos no iCloud Drive não chegam ao iPhone. Conferir com `brctl status | grep -A4 "<pasta>"`. Caminho que funciona: cópia para celular H.264 ~5 Mbps + AAC 192k (`-CELULAR.mp4`, ~25 MB para 39 s, abaixo do limite de 30 MiB) via SendUserFile proactive/attach, ou AirDrop pelo Finder.
