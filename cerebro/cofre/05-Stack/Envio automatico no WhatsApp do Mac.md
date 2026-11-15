---
tipo: stack
projetos: [Agencia IA Dream]
tags: [whatsapp, automacao, acessibilidade, osascript, tarefa-agendada]
criado: 2026-11-13
resumo: Como enviar mensagem automática ao próprio CEO pelo WhatsApp do Mac (deep link com número + Enter via Acessibilidade) e a rotina diária da véspera
---
# Envio automático no WhatsApp do Mac

- Funciona sem Computer use: `ferramentas/whatsapp-enviar-auto.sh <arquivo.txt>` → lê `WHATSAPP_PARA` (DDI+DDD+número, só dígitos, em `~/.maquina-4h/segredos.env`, chmod 600; número NÃO vai para o cofre) → `open "whatsapp://send?phone=…&text=…"` (abre o chat do próprio CEO com o texto) → espera 5 s → `osascript … keystroke return` (envia). Se `WHATSAPP_PARA` não existir, não envia (evita chat errado). `whatsapp-abrir.sh` só abre o rascunho.
- Exige: WhatsApp instalado e logado, Mac LIGADO e DESBLOQUEADO, permissão de Acessibilidade para o app que executa o `osascript` (sem ela: erro 1002 "não tem permissão para acionar teclas"; conceda em Ajustes do Sistema > Privacidade e Segurança > Acessibilidade).
- Rotina: tarefa agendada `gancho-do-dia` (diária, [horário da véspera, ex.: 17:30]) monta o pacote do dia seguinte, escreve `entregas/clientes/<cliente>/video-falado/whatsapp/AAAA-MM-DD.txt`, envia por este script e manda cópia ao Claude do celular (`SendUserFile` proativo). Falha (Mac bloqueado/dormindo, WhatsApp deslogado) → registrar, não trocar de chat.
- Limites: só para o próprio CEO; mensagens a terceiros exigem fluxo próprio e OK. Relacionado: [[Mensagem do pacote no WhatsApp]], [[Remote Control e envio de arquivos ao celular]].

Projetos: [[Agencia IA Dream]]
