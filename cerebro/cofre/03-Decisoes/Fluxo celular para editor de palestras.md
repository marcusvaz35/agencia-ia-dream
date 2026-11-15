---
tipo: decisao
projetos: [Agencia IA Dream]
tags: [editor-de-palestras, icloud, automacao, celular]
criado: 2026-11-12
resumo: Plano para o CEO mandar a palestra do celular ao editor e receber o corte pronto — iCloud Drive Entrada/Prontos + vigia no Mac (aguardando OK)
---
# Fluxo celular → editor de palestras

- Pedido do CEO (12/11/2026): mandar vídeo do celular para o editor de palestras com fluxo rápido.
- Proposta: iPhone → Compartilhar → "Salvar em Arquivos" → iCloud Drive/Agência/Entrada → um vigia no Mac (launchd WatchPaths + `claude -p` headless em `~/.local/bin/claude`) chama o `editor-de-palestras` → corte em iCloud Drive/Agência/Prontos + notificação no Mac (+ opcional iMessage) → CEO salva no Rolo e posta. iCloud Drive já está ativo no Mac (`~/Library/Mobile Documents/com~apple~CloudDocs`). Alternativas: AirDrop manual; WhatsApp só para entrega (depende do Meta).
- Requisitos: Mac ligado/online com o app Claude aberto; usa o plano do Claude do CEO.
- Estado: aguardando o CEO confirmar (1) mesmo Apple ID/iCloud Drive no iPhone e (2) OK para o vigia permanente (configuração permanente exige OK explícito). Nada criado ainda.

Projetos: [[Agencia IA Dream]]

- DECIDIDO (CEO, 12/11 ~01h): vai enviar por AIRDROP mesmo (cai em ~/Downloads do Mac) e avisar no chat; sem iCloud/vigia por ora (plano acima fica arquivado). Editor roda `ferramentas/palestra/editar-palestra.sh <arquivo> --modo rapido`. Gravado no agente `.claude/agents/editor-de-palestras.md`.
