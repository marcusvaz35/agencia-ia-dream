# Modelo de tarefa agendada: Gancho do dia

Roda todo dia no horário que você escolher (ex.: [horário da véspera, ex.: 17:30]) e prepara o gancho e o tema do vídeo do dia seguinte. Como recriar: veja `MANUAL.md`, seção 7 (peça ao Claude: "crie uma tarefa agendada com este texto, todo dia às [horário da véspera, ex.: 17:30]").

Texto da tarefa (troque `<cliente>` pelo nome da pasta do cliente em `clientes/`):

> Você é o gerente-geral da Agência (pasta __PASTA_AGENCIA__). Responda em português simples. Rode SOZINHO a rotina diária "gancho e tema de AMANHÃ" para o vídeo falado do cliente `<cliente>`: execute o que está em `.claude/commands/gancho-do-dia.md` (leia também `.claude/agents/especialista-ganchos.md` e `conhecimento/ganchos/README.md`). Monte o pacote do DIA SEGUINTE pelo rodízio de pilares do cliente (nunca o mesmo pilar 2 dias seguidos; sem repetir tema/gancho em 30 dias), com o radar de assuntos em alta como "OPÇÃO B — TEMA DO MOMENTO". Nada é postado em redes; não invente número nem fato; fatos pessoais do cliente só marcados [CLIENTE CONFIRMA]. Se o Instagram limitar (erro 429/login), use só portais e avise. No final, deixe um resumo curto.

Envio no WhatsApp (opcional): só funciona com `WHATSAPP_PARA` preenchido no `segredos.env` e com a permissão de Acessibilidade (veja o manual).
