---
tipo: aprendizado
projetos: [Agencia IA Dream]
tags: [instagram, qualidade, video, upload]
criado: 2026-11-13
atualizado: 2026-11-13
resumo: O CEO reclamou de Reel sem qualidade: nunca publicar a versão leve (<9,5 MB); subir o arquivo original via servidor local com CORS + fetch/DataTransfer
---
# Não subir a versão leve no Instagram

- 13/11/2026: o 1º Reel do postar rápido foi publicado com a versão leve (5 MB, feita só para caber no limite de ~10 MB do file_upload) e o CEO disse que "ficou sem qualidade nenhuma, preserve a qualidade".
- Regra: a versão leve serve só para mandar ao celular/prévia. Para publicar, usar o arquivo cheio (1080x1920, ~12 Mbps).
- Como contornar o limite: servidor local com CORS (porta 8799) servindo o arquivo; na página do Instagram, fetch → Blob → File → DataTransfer no input de arquivo + evento change. Se falhar, parar e avisar; nunca cair na versão leve.
- Trocar um post já publicado exige apagar e republicar: pedir OK do CEO antes de apagar.

Ver [[Agendar posts no Instagram web]], [[Fluxo postar rapido]].

- 14/11/2026: o Instagram passou a bloquear `fetch` direto para o servidor local (127.0.0.1:8799), mesmo com CORS. Funcionou: uma janelinha "ponte" aberta por clique na página, que lê o arquivo do servidor local e passa ao Instagram por postMessage → DataTransfer no input de arquivo. Desligar o servidor e apagar a ponte ao terminar.
