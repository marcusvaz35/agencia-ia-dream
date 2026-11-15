---
tipo: padrao
projetos: [Agencia IA Dream]
tags: [padrao, video, instagram, cliente, caixinha]
criado: 2026-11-15
atualizado: 2026-11-15
resumo: Vídeo de resposta com a caixinha de pergunta do Instagram por cima — sem cortar respiros, fonte Roboto, pergunta humanizada (vc, q, pq, qnd), qualidade original mantida
---
# Caixinha de pergunta do Instagram no vídeo

- Pedido do CEO (15/11/2026): vídeos do Cliente Exemplo respondendo perguntas "como se fosse resposta de Instagram". NÃO editar respiros: só colocar a caixinha igual à do Instagram (modelo: print dele), fonte **Roboto**, e manter a qualidade do vídeo.
- Pergunta **humanizada**, como seguidor escreve: você→vc, vocês→vcs, que→q, porque→pq, quando→qnd, está→tá, Estados Unidos→EUA. A pergunta é a que o Cliente Exemplo lê no começo do vídeo (transcrever com whisper-cli).
- Título da faixa escura: "Faça uma pergunta" (escolha do CEO; o print dizia "Pergunta pro casal").
- Ferramenta: `ferramentas/caixinha-instagram/caixinha.py` (Agência) — caixa 840 px de largura, faixa #262A31, corpo branco, cantos 30, Roboto Medium (fontes na pasta `fontes/`, baixadas do repositório oficial do Google com OK do CEO); fica do início ao fim, no peito (centro y≈1400–1480), sem cobrir o rosto.
- CORREÇÃO DO CEO (15/11/2026): "as caixinhas ficaram falsas, o branco tá cinza". Causa: caixa sobre vídeo HDR (HLG) com branco reduzido. Certo: converter o vídeo do iPhone para SDR antes (`avconvert -p Preset1920x1080`, mantém 1080x1920/60 fps ~16 Mbps) e pôr a caixa em BRANCO PURO (255); exportar HEVC ~22 Mbps, áudio copiado. Nunca deixar gráfico branco sobre vídeo HDR.
- Arquivos ficam com ~90–120 MB: não chegam ao celular pelo app (limite 30 MiB) — abrir a pasta para AirDrop.

Projetos: [[Agencia IA Dream]]
