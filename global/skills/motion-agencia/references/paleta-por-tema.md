# Paleta definida pelo TEMA do vídeo (decisão do CEO, 14/11/2026)

Regra: escolha o tema → aplique `data-tema="<id>"` no `#root`. Cada paleta = 1 cor de destaque + fundo + texto (+ `--warn` só para "errado"). As cenas só usam `var(--...)`, então trocar de tema NÃO exige mexer nas cenas.

| Tema | id | Destaque `--acc` | Fundo `--bg0 → --bg1` | Texto `--txt` | Sensação |
|---|---|---|---|---|---|
| Fé / Deus / propósito / gratidão | `fe` | ouro quente #F2B84B | preto azul-noite #050817 → #12204A | creme #F6EEDC | sagrado, sólido, esperança |
| Negócios / franquia / liderança | `negocios` | azul-royal #4C9BFF | grafite-marinho #06090F → #12203A | #EEF3FA | confiança, sobriedade |
| Tecnologia / IA / método | `tech` | verde HUD #3DFF6E | verde-quase-preto #040B07 → #0E2A18 | #EAF3E4 | futuro, precisão (referência original) |
| Família / lar / acolhimento | `familia` | âmbar-coral #FF9A62 | chocolate #140B08 → #3A2018 | #FFF1E6 | calor, proximidade |
| Vendas / oferta / urgência | `vendas` | vermelho-vivo #FF3B30 | preto #080808 → #2A0C0C | branco | ação, urgência (usar com parcimônia) |
| Saúde / bem-estar / calma | `saude` | turquesa #2EE6D6 | azul-petróleo #041015 → #0B3340 | #E8FBF9 | cuidado, limpeza |
| Educação / método / clareza (FUNDO CLARO) | `educacao` | laranja-tijolo #E4572E | creme #EFEAE0 → #FBF8F2 | quase-preto #14161B | didático, leve |

Como escolher: leia o roteiro e ache o sentimento dominante (não o assunto técnico). Tema misto (fé + negócios)? Escolha o do SENTIMENTO que fecha o vídeo e use o outro só no texto; nunca duas cores de destaque.
Tema novo: copie um bloco em `kit/tokens.css`, troque as 4 cores principais, confira contraste do texto sobre o fundo (≥ 7:1) e do destaque sobre o fundo (≥ 4,5:1). Marca do cliente com cor própria: ela vira `--acc`.
Para fundo claro, `--bg0/--bg1` são claros e o grão/vinheta ficam mais fracos (reduza `.ma-vig` e `.ma-grain` opacity).
