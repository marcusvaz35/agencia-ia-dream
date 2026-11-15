---
tipo: aprendizado
projetos: [Agencia IA Dream]
tags: [aprendizado, instagram]
criado: 2026-11-11
atualizado: 2026-11-11
resumo: Muitas leituras seguidas no Instagram dão erro 429; minerar em lotes pequenos com pausa
---
# Mineracao no Instagram com limite 429

Ler métricas pelo og:description e pela grade /reels/ do perfil, sem login extra e sem interagir.

Projetos: [[Agencia IA Dream]]

- Limite de métricas (12/11/2026): na tela do Reel só aparecem curtidas, comentários e reposts; views e compartilhamentos vêm dos dados internos da página, e o acesso pode ser negado a subagentes — nesse caso a validação completa depende de o CEO liberar a leitura ou aprovar frases autorais sem métrica.

- Leitura de métricas (12/11/2026, CEO liberou): navegar até `/reels/<código>/` e ler `comment_count`, `like_count`, `reshare_count` no HTML da página — o 1º valor encontrado pode ser de outro objeto; validar contra a contagem na tela. `fetch()` do HTML não traz esses dados. Busca de frase longa dá "Nenhum resultado"; usar termos curtos.
