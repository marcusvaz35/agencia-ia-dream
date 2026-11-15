# Biblioteca de ganchos virais (dono: `especialista-ganchos`)

Criada em 13/11/2026 a pedido do CEO. Critério de "gancho validado": vídeo com **≥ 1.000.000 de views, ≥ 40.000 curtidas e ≥ 20.000 compartilhamentos**, conferido na tela (com data). Gancho = o que prende nos primeiros segundos: falado, escrito (texto na tela), visual ou misto.

Arquivos:
- `banco-de-ganchos.csv` — um gancho por linha (link, métricas reais, texto, fórmula, por que prende, como foi editado).
- `taxonomia.md` — os tipos de gancho e quando usar.
- `playbook-editores.md` — como todo editor constrói um gancho em qualquer vídeo.
- `frames/` — quadro inicial de cada gancho (uso interno de análise).

Como usar: editor → peça um gancho ao `especialista-ganchos` com a transcrição/roteiro; CEO → diga o tema/nicho do vídeo que vai gravar e receba uma lista.
## Estado do banco (1ª rodada, 13/11/2026)
- **42 ganchos validados** (≥ 1 mi views, ≥ 40 mil curtidas, ≥ 20 mil envios, conferidos na tela) + 5 `nao_validado` (ids N001–N005: 1 com métricas escondidas, 1 sem views conferidas, 3 reprovados por métrica). Total 47 linhas.
- Por formato (campo `tipo`): falado 15 · misto 10 · visual 9 · escrito 8. Atenção: só 18 dos 42 tiveram o 1º quadro visto de fato; nos demais o texto vem da legenda do post e o tipo é provisório.
- Por nicho: motivação 9 · finanças 7 · relacionamentos 4 · saúde/fitness/neurociência 7 · notícias 2 · humor 3 · fé/valores 3 · negócios/liderança 3 · curiosidades 1 · culinária 1 · tecnologia/IA 1 · esportes 1. **Educação e estilo de vida: nenhum validado ainda.**
- Meta do agente: 100 validados em ≥ 12 nichos. Faltam 58.
- Limitações: amostra de perfis já enormes (maioria em inglês, vários políticos: marcados, só como padrão); a fala dos primeiros 3 s não foi ouvida (sem áudio); views vêm do rótulo da grade de Reels do perfil (ex. "4,6 mi").
- Arquivos novos: `taxonomia.md`, `playbook-editores.md`, lista de teste em `entregas/ganchos/2026-11-13-lista-teste-cliente.md`.
Nada neste diretório é postado.
- **Rotina diária:** gancho e tema do vídeo falado do cliente ([horário do vídeo falado]), entregue na VÉSPERA (pacote de amanhã, enviado ao celular), por rodízio de pilares + RADAR de assuntos em alta (opção B; `entregas/clientes/<cliente>/radar/`) — `.claude/commands/gancho-do-dia.md`, lote em `entregas/clientes/<cliente>/video-falado/ganchos-e-temas.md`, histórico em `.../video-falado/historico-temas.csv`.


Ver também: `modelos-de-gancho-falado.md` (8 moldes de gancho falado do CEO) e `../metodo-cinco-tres.md`.
