---
tipo: decisao
projetos: [Agencia IA Dream]
tags: [agente, ganchos, mineracao, editores, instagram]
criado: 2026-11-13
resumo: Novo agente especialista-ganchos — minera ganchos de vídeos com ≥1 mi views, ≥40 mil curtidas, ≥20 mil compartilhamentos; mantém biblioteca para os editores; cria gancho de qualquer vídeo; entrega listas por nicho ao CEO
---
# Especialista em ganchos virais

- Pedido do CEO (13/11/2026): agente que minera ganchos que deram muito bom (vídeos acima de 1 milhão de views, 40 mil curtidas e 20 mil compartilhamentos), leva aos editores para subir o nível da edição, constrói o gancho de qualquer vídeo que for editado (falado ou escrito) e, quando o CEO for gravar, entrega uma lista de ganchos para o tipo de vídeo — qualquer tema/nicho, pesquisando na internet e no Instagram.
- Criado: `.claude/agents/especialista-ganchos.md`; biblioteca `conhecimento/ganchos/` (README, `banco-de-ganchos.csv`, `frames/`, e `taxonomia.md` + `playbook-editores.md` a criar na 1ª rodada); registrado no gerente-geral e no escritório 3D (`PERFIL` 🪝 cor #f59e0b, `VISUAL`). Seção "Ganchos" adicionada em editor-de-video, editor-de-palestras, editor-viral-podcast, especialista-instagram, copywriter, social-media e especialista-frases: consultar playbook/banco e pedir o gancho ao especialista.
- Regras: as TRÊS métricas conferidas NA TELA com data, senão `nao_validado`; Instagram só leitura; não inventar número; separar FATO × INFERÊNCIA; gancho tem de ser cumprido pelo vídeo; banco guarda padrões, não copia roteiros de terceiros.
- Observação: agente criado no meio da sessão NÃO é chamável por nome (a lista de tipos só atualiza em sessão nova — o oraculo e o editor-de-palestras foram exceção); usei `especialista-instagram` seguindo o arquivo do agente. 1ª rodada (meta ≥30 validados em ≥8 nichos + taxonomia + playbook + lista-teste do Cliente Exemplo em `entregas/ganchos/2026-11-13-lista-teste-cliente.md`) em andamento.
- Relacionado: [[Fluxo minerador editor CEO]], [[Editor de palestras - cortes de impacto]].

Projetos: [[Agencia IA Dream]]

## Rodada 1 concluída (13/11/2026, ~23 min de agente; via especialista-instagram seguindo o arquivo; o `especialista-ganchos` ficou chamável por nome minutos depois)
- Banco: 47 linhas — **42 validados** (≥1 mi views, ≥40 mil curtidas, ≥20 mil envios, conferidos na tela em 13/11/2026; eu confirmei no CSV) e 5 `nao_validado` (N001–N005: 1 métricas escondidas, 1 sem views conferidas — Talitha, 152 mil envios —, 3 reprovados por pouco: 795 mil views, 12,8 mil e 18,6 mil envios). 12 nichos validados: motivação 9, finanças 7, saúde/fitness/neurociência 7, relacionamentos 4, humor 3, fé/valores 3, negócios/liderança 3, notícias 2, curiosidades/culinária/tecnologia-IA/esportes 1 cada; educação não validou; estilo de vida sem exemplo. Formatos: falado 15, misto 10, visual 9, escrito 8 (tipo provisório em 24 casos sem 1º quadro visto).
- Como mediu: views = rótulo da grade de Reels do perfil (a página do Reel não mostra views); curtidas pela legenda og conferidas na tela; envios = ícone do avião. Sem 429. Só vi o 1º quadro de 18/42 (`frames/`); nos outros 24 o "texto do gancho" vem da legenda do post ("não conferido"); áudio não ouvido ⇒ fala dos 3 primeiros segundos não transcrita.
- Padrões (FATO nos 42; causa = INFERÊNCIA): texto na tela no 1º quadro (14 de 18 vistos; caixa de alto contraste, palavra-chave vermelho/amarelo); estatística chocante p/ público específico (G032 28,9 mi/908 mil/141 mil); pergunta de dor + contraste (G001) e lacuna de reação de terceiro (G002); pergunta com prova visual em escala (G038); notícia com impacto no bolso/trabalho (G014: 317 mil envios); frase curta de contradição (G036, G040, G041); CTA "comente a palavra" em 4/42 (CTA ≠ gancho). Nenhum exemplo validado de franquia/negócio pequeno ou dívida.
- Limites: amostra enviesada (contas gigantes, maioria inglês); vários políticos (G007, G009, G010, G013, G029, G031, G042 — "só padrão, não tema"); não achou grande perfil cristão de pregação BR com reels ≥1 mi além de Talitha Pereira; números de retenção de blogs (40%, 60%) NÃO usados (sem fonte primária).
- Arquivos: `conhecimento/ganchos/{banco-de-ganchos.csv,taxonomia.md (14 tipos),playbook-editores.md,README.md,frames/}`; teste `entregas/ganchos/2026-11-13-lista-teste-cliente.md` (12 ganchos "por que o franqueado desiste no 1º ano"; recomenda testar #1, #2, #4; #3 "+2 mil franquias" e #9 "dívida de R$ 10 mi" dependem de o Cliente Exemplo confirmar; não achou número validado p/ a premissa).
- Falta: 58 validados p/ 100; mais perfis BR de fé e negócios; transcrição real dos 3 primeiros segundos (editor transcreve/áudio); conferir views de N002. Pendências do CEO: política só como padrão ou excluir; confirmar dados do #3/#9; autorizar 2ª rodada.
