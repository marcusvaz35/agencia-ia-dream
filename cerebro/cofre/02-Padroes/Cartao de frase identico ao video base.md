---
tipo: padrao
projetos: [Agencia IA Dream]
tags: [padrao, frases, cliente, instagram, video]
criado: 2026-11-15
atualizado: 2026-11-15
resumo: Cartão de frase = cópia exata do vídeo base do cliente (Hoefler Text 68 px, aspas amarelas Impact fixas, @ cinza, 6,2 s, mesmo áudio); minerar só o tipo das frases campeãs do perfil
---
# Cartão de frase idêntico ao vídeo base

- Regra: não mudar o layout — mesma fonte, mesmo posicionamento, mesmas aspas, @ do cliente do jeito que está — e guardar o vídeo base para sempre usar o mesmo áudio (cada pessoa usa o SEU vídeo base).
- Medido no vídeo base (720x1280, x1,5): Hoefler Text Regular 68 px, passo 73, centralizado; aspas #FFD71D (glifo Impact) 68x62 em posições FIXAS (abertura x=218, fechamento termina em x=872); @ cinza (70,70,70) ~23 px centralizado na altura da aspa de fechamento; bloco centrado a 0,468 H; 6,2 s com o áudio do base.
- Gerador: `ferramentas/frase-0600/gerar.py` (quebras de linha vêm do texto; letra só diminui se a linha passar de 860 px). Padrão completo e referências com métricas: `conhecimento/frases-0600-padrao-exato.md`.
- Como identificar a fonte de um cartão: renderizar a mesma linha em fontes candidatas com a mesma largura e comparar; depois sobrepor (canal vermelho = ref, verde = nosso) e medir bbox.

Projetos: [[Agencia IA Dream]]
