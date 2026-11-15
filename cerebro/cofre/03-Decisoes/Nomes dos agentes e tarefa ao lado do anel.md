---
tipo: decisao
projetos: [Agencia IA Dream]
tags: [escritorio-3d, agentes, progresso, nomes]
criado: 2026-11-13
atualizado: 2026-11-13
resumo: CEO quer nomes próprios nos agentes e, quando trabalham, a tarefa ao lado do anel de progresso; nomes em escritorio/nomes-agentes.json (editável)
---
# Nomes dos agentes e tarefa ao lado do anel

- Pedido do CEO (13/11/2026): "quero colocar nomes nos agentes e sempre que eles tiverem fazendo alguma tarefa aparecer ao lado da barra de progresso a tarefa que eles estão fazendo".
- Plano (desenvolvedor, em andamento): nome próprio brasileiro por agente (coerente com gênero/idade do boneco) em escritorio/nomes-agentes.json; etiqueta 'Nome · função'; balão ao lado do anel com 'tarefa · etapa' (tarefa vem da description da delegação via hook, etapa via progresso.mjs); 'concluído' por alguns segundos.
- Regra para o gerente/agentes: ao delegar, usar description curta e clara (vira o texto do balão) e reportar etapas com progresso.mjs.
Ver [[Barra de progresso circular nos agentes]].

## Entregue (13/11/2026)
- 18 nomes em escritorio/nomes-agentes.json (Rogério gerente-geral, Fernando editor-viral-podcast, Davi desenvolvedor, Lívia web-designer, Helena copywriter, Noa especialista-instagram, Marina social-media, Thiago ganchos, Armando editor-de-palestras, Nunu editor-de-video, Gustavo frases, Aurélio oráculo, Otávio dev-seguranca, Camila tráfego, Rafael vendedor, Neide atendente, Hélio contador, Renata analista). Editar e recarregar.
- Balão 'tarefa · etapa' ao lado do anel (≤50 caracteres, 2 linhas), 'concluído' ~4 s; tarefa vem do description da delegação via hook (desc em eventos.jsonl) e etapa do progresso.mjs; regra no gerente-geral.md: delegar com description curto.
- Limites: balões se sobrepõem na vista aérea quando muitos agentes na mesma sala; ganchos só valem em sessões abertas depois da configuração.
