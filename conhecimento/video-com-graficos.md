# Vídeos com gráficos explicativos (tarefa nova do editor-de-video, 12/11/2026)

Referência do CEO: `conhecimento/referencias-video/exemplo-graficos-explicativos.mp4` (30 s, 1080x1920, 30 fps, com áudio de narração).

## O que o exemplo faz (lido nos quadros — FATO)
- **Fundo** off-white com grade bem sutil. Paleta mínima: preto + UM azul de destaque (#2f5fd0 aprox.).
- **Cada ideia = uma "cena"** que muda a cada frase/poucas palavras:
  - **Etiqueta** pequena no topo com quadradinho preto (ex.: "COMO FUNCIONA", "ONDE", "COMO VOCÊ GANHA", "O QUE É NOSSO").
  - **Título grande** em sans bold, com a 2ª linha em **serifa itálica azul** para destacar (ex.: "Comissão / todos os meses.", "É tudo / nosso.").
  - **Ilustração/diagrama simples em traço preto + azul** que DESENHA o que a pessoa diz: máquina de café + xícara; pílulas empilhadas (Clínicas, Academias, Concessionárias, "e muito mais" em azul); fluxo "Empresa → paga o café → Você" (o "Você" acende em azul); linhas de bolinhas que vão sendo marcadas (comissão recorrente todo mês); lista com checks azuis (A máquina, O produto, A manutenção); porta azul abrindo.
  - **Rodapé:** rosto do narrador em desenho de traço pequeno, centralizado, com a boca mexendo, + **legenda em poucas palavras** com a palavra-chave em azul e sublinhada.
- Elementos entram em sincronia com a palavra falada (o gráfico aparece quando a palavra é dita), com animações suaves (fade/slide curtos).

## Fluxo que o CEO definiu
1. **Texto → vídeo:** o CEO manda só o texto. O editor transforma em roteiro de cenas (uma ideia por cena), cria a narração (voz clonada do Cliente Exemplo só com OK de custo; antes, voz provisória ou o CEO grava) e monta os gráficos.
2. **Áudio gravado → vídeo:** o CEO manda o áudio. O editor transcreve com tempo por palavra, divide em cenas, sincroniza gráficos e legenda.
3. **Vídeo gravado → mescla:** o CEO manda o vídeo falado. O editor mantém a pessoa (no lugar do desenho do rosto: recorte/círculo/faixa embaixo ou ao lado) e coloca os gráficos explicando por cima/em volta, com os cortes de pausa/muleta do padrão da Agência.

## Como o editor executa (passos)
1. Receber a entrada e ler `PROJETO.md`/ficha do cliente. Se faltar o essencial (cliente, tema, tom), perguntar.
2. Transcrever (texto exato ou áudio com tempo por palavra). Não mudar o que o CEO escreveu sem avisar.
3. **Plano de cenas** em tabela: nº · trecho falado · etiqueta · título (linha azul itálica?) · gráfico (qual metáfora visual) · quando entra (palavra) · duração. Mostrar ao CEO só na 1ª vez de cada estilo.
4. Montar no HyperFrames (skill `hyperframes`/`editor-video`) em HTML → vídeo 1080x1920, 30 fps; biblioteca de componentes reutilizáveis: etiqueta, título com destaque, pílulas, fluxo com setas, lista com check, contador/barras, bolinhas de recorrência, ícones em traço. Sem imagens de banco protegidas por direito autoral; ícones desenhados em SVG próprio.
5. Sempre: legenda palavra por palavra com a palavra-chave em destaque; efeitos sonoros leves; música baixa; volume ~ -14 LUFS; conferir ao menos 10 quadros (incluindo meio e fim), texto inteiro, acentos, nada cortado, nada fora da zona segura; brilho/contraste legível.
6. Entregar com `node ferramentas/video-pronto.mjs "<vídeo>" "<cliente>" "<tipo>" "<tema>"`. Nada vai ao ar sem OK do CEO.

## Regras
Não inventar números nos gráficos (só os que o CEO escreveu ou com fonte). Cada gráfico tem de provar a frase, não enfeitar. Um destaque azul por cena. Texto grande e curto. Primeiro vídeo: aguardar o texto do CEO.


## Rosto falando (aprendido em 13/11/2026, vídeo marca-do-cliente)
- O rosto do exemplo é VÍDEO (cabeça girando em 3D, mandíbula, barba, sobrancelhas, linhas finas), não sprites. Bocas coladas (6–9 sprites) parecem "estranhas" (troca seca, sem mandíbula, cabeça rígida, piscar em contorno, limiar binário).
- Receita gratuita que funcionou melhor: reusar os quadros reais do rosto do exemplo e escolher a sequência por Viterbi (boca = visemas das letras do alinhamento ElevenLabs; continuidade de pose); render em tons de cinza, sem limiar. Scripts: `entregas/clientes/cliente-exemplo/videos/2026-11-13/_fonte/rosto_v5/`.
- Caminho pago/ideal: ElevenLabs Image & Video (`POST /v1/flows/video`, `creatify-aurora`, 1 imagem + 1 áudio, 480p/720p; Pro+; cerca de US$ 0,07–0,14 por segundo na tabela Enterprise). Só com OK do CEO; testar 6 s antes.
