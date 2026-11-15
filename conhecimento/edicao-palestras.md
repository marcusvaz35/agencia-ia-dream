# Edição de cortes de palestra — como as 2 referências do CEO foram feitas

**Feito em 12/11/2026 pelo editor-de-video.** Base: `referencias-video/palestras/ref-palestra-1.mp4` (66 s) e `ref-palestra-2.mp4` (26,4 s), 720x1280, 30 fps, H.264, áudio AAC estéreo 44,1 kHz.
Método: quadros a cada 0,5 s (folhas), detecção de corte (`scene`), curva de brilho quadro a quadro, medidas de áudio (ebur128, volumetria por banda, espectrograma) e leitura dos quadros um a um.
Regra de honestidade: **FATO** = visto ou medido por mim. **INFERÊNCIA** = dedução minha. Eu **não ouvi** o áudio como uma pessoa: o som foi lido por medição e espectrograma. Onde o som importa, está marcado.

Provas (quadros e folhas): pasta `referencias-video/palestras/analise/` (lista no fim).

---

## 0. Resumo em 8 linhas
1. É um estilo **limpo e quente, com peso**: vídeo base de câmera real, **sem emoji, sem efeito cômico, sem stickers coloridos**.
2. O vídeo abre **já na frase mais forte** (a frase de impacto é puxada para o começo) e a mesma frase volta no lugar natural dela.
3. **Nenhuma pausa**: ≥ 0,12 s de silêncio não existe (medido). Fala seca, ritmo contínuo.
4. Corte duro com **clarão (flash) quente de 3 quadros** na emenda, em mudança de ideia.
5. **Inserções**: cartão creme com lettering de caneta/pincel, B-roll de mãos orando, miniatura redonda do palestrante. Entram na hora da palavra e duram 1,5 a 3,7 s.
6. **Legenda de frases curtas que vão crescendo** (2 a 4 palavras), centralizada, sem caixa, com destaque editorial no vídeo 2.
7. **Áudio = só voz** (-14,2 / -14,1 LUFS, muito comprimida) mais **um único evento de som projetado**, no vídeo 1: varredura subindo (1,0 a 2,7 s) e batida grave (2,75 a 3,4 s) no primeiro clarão. **Não há trilha musical medível nas duas.**
8. O vídeo 2 termina **em clarão, na frase de impacto**, o que faz o loop voltar ao gancho.

---

## 1. Os dois vídeos em uma tabela

| | Vídeo 1 | Vídeo 2 |
|---|---|---|
| Tipo de fonte | conversa/entrevista em cafeteria, 2 pessoas e 3 ângulos | palestra ao vivo em sala, câmera em movimento (cinematográfica) |
| Duração | 66,03 s; imagem útil até 63,33 s, depois **preto 2,67 s** com cauda de áudio (FATO) | 26,40 s; termina no pico do clarão |
| Planos (cortes duros) | 19 planos em 63,3 s → média **3,3 s** (de 0,9 a 8,7 s) | 5 planos em 26,4 s → média **5,3 s** (o plano de 3,7 a 14,0 s é uma câmera contínua em movimento) |
| Clarões | 2,73 · 15,50 · 18,30 · 26,73 · 34,03 · 61,07 s (6) | 3,73 · 14,03 · 19,40 · 26,37 s (4) |
| Headline | sim, 0 a 2,77 s | **não tem** |
| Legenda | frases crescentes, 2 fontes (manuscrita e geométrica) | frases crescentes, serifada + geométrica, tamanhos misturados |
| Cor | natural/quente, saturado (sat. média 0,52), sem vinheta forte | **teal e laranja** escuro (luma média 42 a 65 de 255), pretos presos, brilhos sem estourar (p99 ≈ 177–201) |
| Volume | -14,2 LUFS, LRA 2,2, pico -0,3 dBFS | -14,1 LUFS, LRA 2,0, pico -0,9 dBFS |
| Pausas ≥ 0,12 s abaixo de -38 dB | 1 (a cauda final) | **0** |

---

## 2. Vídeo 1 — linha do tempo (s)

| # | Tempo | Plano | O que aparece | Fala / legenda (resumo) |
|---|---|---|---|---|
| 1 | 0,00–2,77 | Sofá, plano aberto, 1 pessoa | **Headline** fixa + lettering **PALAVRA-CHAVE** com elipse desenhada | "[fala da referência omitida]" |
| flash | 2,67–2,73 | | clarão amarelo-laranja, corte no pico | |
| 2 | 2,77–3,93 | **Tela dividida** (convidado em cima, entrevistador embaixo) | legenda no encontro das duas imagens | "[fala da referência omitida]" |
| 3 | 3,93–5,10 | Close do palestrante (zoom) | legenda manuscrita | "[fala da referência omitida]" |
| 4 | 5,10–8,07 | Dividida | legenda geométrica no encontro | "[fala da referência omitida]" |
| 5 | 8,07–9,03 | Close | | "[fala da referência omitida]" |
| 6 | 9,03–15,43 | Dividida (6,4 s) | | "[fala da referência omitida]" |
| flash | 15,43–15,50 | | | |
| 7 | 15,50–18,30 | Sofá aberto | legenda manuscrita | "[fala da referência omitida]" |
| flash | 18,23–18,30 | | | |
| 8 | 18,30–26,73 | Dividida (8,4 s) | | "[fala da referência omitida]" |
| flash | 26,67–26,73 | | | |
| 9 | 26,73–27,63 | Sofá, close | legenda manuscrita | "[fala da referência omitida]" |
| 10 | 27,63–29,17 | **Cartão creme** (inserção 1,5 s) | "[fala da referência omitida]" | |
| 11 | 29,20–31,20 | Close, luz quente de janela | legenda manuscrita | "[fala da referência omitida]" |
| 12 | 31,20–33,40 | **B-roll: mãos em oração**, luz dourada (2,2 s) | legenda manuscrita; **miniatura redonda** do palestrante canto superior direito (~32,0–33,4 s) | "[fala da referência omitida]" |
| 13 | 33,40–34,03 | Sofá, palestrante coçando a cabeça | legenda manuscrita | "[fala da referência omitida]" |
| flash | 33,97–34,03 | | | |
| 14 | 34,07–42,80 | Dividida (8,7 s) | | "[fala da referência omitida]" |
| 15 | 42,80–46,47 | **Cartão creme com pincel** (3,7 s) | faixas pretas de pincel; textos de 1 a 3 palavras trocando; última palavra **"parte."** sobre faixa com **gradiente de pôr do sol** | "[fala da referência omitida]" |
| flash | 46,47–46,60 | | clarão **branco** (YAVG 231–233) | |
| 16 | 46,60–54,20 | Sofá aberto (7,6 s) | legenda geométrica sobre o corpo | "[fala da referência omitida]" |
| 17 | 54,20–55,20 | Close | | "[fala da referência omitida]" |
| 18 | 55,20–60,93 | Dividida | | "[fala da referência omitida]" |
| flash | 61,00–61,07 | | | |
| 19 | 61,10–63,33 | Close | | "[fala da referência omitida]" |
| — | 63,33–66,00 | **Preto** | cauda de áudio sumindo (-30 → -60 dB) | |

Observações de estrutura (FATO + INFERÊNCIA):
- **Narrativa:** gancho (a frase final de impacto, 2,8 s) → contexto da cadeira (2,8–15,4) → a frase do gancho de novo (15,5–18,3, a **virada**) → regra/explicação com cartão de inserção → B-roll → cartão de síntese → prova com números → fecho com a promessa cortada. INFERÊNCIA: o corte final no meio da frase é gancho de "quero mais" para o comentário/segundo vídeo, não erro de edição. O preto de 2,7 s no fim é provavelmente sobra de exportação (a ser decidido pelo CEO: não copiar o preto).
- **Planos alternam sempre:** sofá aberto ou dividida (assunto) → close (ênfase) → inserção. Nunca dois planos iguais seguidos.

---

## 3. Vídeo 2 — linha do tempo (s)

| # | Tempo | Plano | O que aparece | Fala / legenda |
|---|---|---|---|---|
| 1 | 0,00–3,73 | Sala, palestrante em pé, plano aberto, câmera deslizando | legenda no meio do corpo | "[fala da referência omitida]" |
| flash | 3,67–3,73 | | | |
| 2 | 3,73–8,2 | Câmera contínua, slide gigante ao fundo | | "[fala da referência omitida]" |
| 2b | 8,2–9,7 | **Câmera se move/gira** (a máquina acompanha ele andando; muitos "cortes" de detecção são o movimento) | | "investimentos. Você tem leads de" |
| 2c | 9,7–14,03 | Palestrante escreve no quadro | **legenda troca de fonte** para "[valor em destaque]" (letra fina, uma palavra por vez, tamanho maior) | "[fala omitida]ão. Então, quem que concorre aqui?" |
| flash | 14,03 | clarão curto (1 quadro, YAVG 188) | | |
| 3 | 14,07–19,33 | Close lateral no quadro (5,3 s) | | "[fala da referência omitida]" |
| flash | 19,33–19,40 | | | |
| 4 | 19,40–22,67 | Sala, plano aberto | | "[fala da referência omitida]" |
| 5 | 22,67–26,30 | **Repetição do gancho** (mesma fala/postura do plano 1, enquadramento um pouco mais aberto) | legenda serifada em destaque | "[fala da referência omitida]" |
| flash | 26,33–26,40 | **o vídeo acaba no clarão** | | |

Observações (FATO + INFERÊNCIA):
- **Gancho = a conclusão.** A frase de impacto vem para os 3,7 s iniciais **e** reaparece no final (plano 5). INFERÊNCIA: é a mesma tomada reutilizada (postura e texto idênticos); só o enquadramento muda. O vídeo termina no clarão e o loop volta ao gancho sem emenda visível.
- **Não tem headline.** A legenda tipográfica cumpre o papel de gancho.
- **Nenhum plano de apoio** (sem cartão, sem B-roll): é um corte "documental" de palestra, com a câmera fazendo o movimento.

---

## 4. Headline (só no vídeo 1)

| Item | Medido | Em 1080x1920 (×1,5) |
|---|---|---|
| Texto | "[headline da referência]" (3 linhas, 14 palavras) | |
| Caixa | **branca**, cantos arredondados, sem sombra visível, x 32→688 (≈ 91% da largura), y 113→383 | x 48→1032, y 170→575 |
| Posição | **topo**, 9% a 30% da altura | **começa acima da zona segura (y 230)**: ver nota abaixo |
| Texto | **preto, negrito**, sem serifa, centralizado, 3 linhas | corpo ≈ 69 px, linha ≈ 84 px (INFERÊNCIA a partir de 46/56 px em 720) |
| Raio do canto | ≈ 20 px (INFERÊNCIA a olho) | ≈ 30 px |
| Entrada | **nenhuma animação**: presente no quadro 0 | |
| Saída | some no primeiro corte (2,77 s) | |
| Duração | **2,77 s** (≈ 83 quadros), o tempo do plano do gancho | |

Nota (decisão do CEO): o padrão do [horário do vídeo falado] da Agência manda a headline **centralizada na altura do peito**. Aqui ela está no **topo**. Para o corte de palestra, recomendo o topo da referência **descendo para y ≥ 230** em 1080x1920. Aguardando OK.

### Lettering "PALAVRA-CHAVE" (palavra-chave sobre a imagem)
- Palavra branca, negrito grosso, ≈ 1/3 da largura, na altura do peito (y ≈ 43–50%), com **elipse de caneta cinza clara desenhada em volta** (a elipse "desenha" em ~0,4 s e treme levemente).
- Entra em **0,17–0,5 s**: revela letra a letra da direita para a esquerda/aparece e **o braço do palestrante passa na frente** (letras ficam atrás do braço: **composição 2,5D com recorte da pessoa**). Fica até 2,77 s.
- É a palavra da headline repetida em grande: reforço do gancho.

---

## 5. Inserções

| Tipo | Onde | Duração | Como entra/sai | Estilo |
|---|---|---|---|---|
| **Clarão (flash)** | 6 no vídeo 1, 4 no vídeo 2 | ≈ 0,1 s (3 quadros) | **sobe de brilho até um pico amarelo-laranja ou branco e corta no pico**; o plano seguinte entra limpo | FATO: YAVG sobe 176→200→218 em 3 quadros, depois volta ao normal. INFERÊNCIA: é um "light leak"/mistura de tela quente |
| **Cartão creme com lettering de caneta** ("devolve") | V1 27,63–29,17 | 1,5 s | corte seco (entra e sai por cima do plano) | fundo creme (≈ #F8F4E8), círculo de caneta preta desenhado, 1 palavra grande fina + 2 linhas em negrito |
| **Cartão creme com pincel** | V1 42,80–46,47 | 3,7 s | corte seco; **sai com clarão branco** | faixa de pincel preta (2 faixas), 1 a 3 palavras por vez em branco negrito, **a última palavra recebe gradiente de pôr do sol** |
| **B-roll de mãos em oração** | V1 31,20–33,40 | 2,2 s | corte seco; **miniatura redonda do palestrante** (≈ 35% da largura, canto superior direito) entra por cima aos ~32,0 s | dourado quente, fundo escuro, câmera lenta (**provavelmente IA ou banco**: INFERÊNCIA; origem desconhecida) |
| **Tela dividida** | V1 plano 2,4,6,8,14,18 (≈ 60% do tempo) | 3 a 8,7 s | corte | entrevistador embaixo, convidado em cima; **encontro das duas imagens com gradiente borrado** onde a legenda senta |
| **Close (zoom de reenquadramento)** | V1 3,93 · 8,07 · 26,73 · 29,2 · 54,2 · 61,1 | 0,9 a 2,2 s | corte seco, sem animação de zoom | corte para outro ângulo/zoom. FATO: não vi "push-in" animado |
| **Número/preço** | V2 12 s "[valor em destaque]" | ~1,4 s | só vira texto da legenda, em corpo maior | |

Não aparece em nenhum dos dois: ícones, emojis, gráficos de barras, notícias, logo, selo, @, barras de rolagem.

**Tratamento do vídeo base**
- V1: cor natural quente; luz de cafeteria; cantos um pouco mais escuros na tela dividida (84 vs 117 no centro, INFERÊNCIA: gradiente, não vinheta de marca); sem grão visível, sem letterbox, sem desfoque.
- V2: **teal e laranja** (sombras azul-esverdeadas, luz de teto laranja), pretos presos mas não esmagados, claros não estourados, vinheta leve (cantos mais claros no plano com luz de teto, centro mais escuro: **INFERÊNCIA, sem certeza sobre vinheta**). Tem pegada "cinematográfica" de câmera de cinema.
- Nenhum letterbox. Nenhuma tarja de nome. Sem logo.

---

## 6. Legenda

| Item | Vídeo 1 | Vídeo 2 |
|---|---|---|
| Formato | **frase que cresce**: "aquelas" → "aquelas duas menimas" → "aquelas duas menimas não sabem,". Máx. **2 linhas**, 1 a 5 palavras por tela. Troca a cada ≈ 0,35–0,8 s | idêntico (cresce), mas pode **quebrar para baixo** ("Não é **na** / sorte") |
| Fonte | **dois estilos conforme o plano**: (a) **manuscrita**, minúscula, fina, branca, nos planos de 1 pessoa (≈ 38 px em 720, INFERÊNCIA); (b) **sans geométrica semibold** (tipo Poppins), pequena, nos planos divididos e no sofá aberto (≈ 28–30 px em 720) | **mistura**: sans geométrica leve + **serifada de alto contraste em negrito** (tipo Playfair Display) para frase-chave |
| Cor | branca, **sem contorno e sem caixa**, sombra suave | branca, sem caixa |
| Posição | manuscrita: y ≈ 67% (≈ 850–890 de 1280). Dividida: **no encontro das imagens** (y ≈ 46%) | **centro do corpo, y ≈ 49–52%** (620–670 de 1280) |
| Destaque | nenhum no V1 | "o segredo da venda" e "Não é na sorte" em **serifada negrito**; "tá no **antes**", "o" e "segredo" com **tamanhos e linhas de base diferentes** (editorial) |
| Animação | **entra palavra por palavra no tempo da fala**, sem animação visível (corte) | idem |
| Pontuação | mantém vírgulas e ponto; minúscula depois de pausa, maiúscula no início da frase | |
| Regra de ouro | **nenhuma palavra dita some**; legenda e fala sincronizadas na palavra | |

Divergência com o padrão da Agência: o padrão do [horário do vídeo falado] usa **uma palavra por vez** branca com sombra, centralizada acima da headline. Nas referências a legenda é "frase crescente". Os dois conviveriam: sugiro **frase crescente de 2–4 palavras** para palestra.

---

## 7. Áudio

### Medidas (FATO)
| | V1 | V2 |
|---|---|---|
| Loudness integrado | **-14,2 LUFS** | **-14,1 LUFS** |
| LRA | 2,2 LU | 2,0 LU |
| Pico | -0,3 dBFS | -0,9 dBFS |
| Volume médio | -16,6 dB | -16,4 dB |
| Faixa de voz (RMS por 0,25 s) | -12 a -22 dBFS, mergulhos a -30/-35 só em respiros ≤ 0,25 s | idem |
| Silêncio ≥ 0,12 s | só no fim (cauda) | nenhum |

### Camadas (INFERÊNCIA a partir de espectrograma e bandas; eu não ouvi)
1. **Voz do palestrante**, muito comprimida (LRA ≈ 2), alvo -14 LUFS, em primeiro plano o tempo todo.
2. **Ambiente da sala** (ar-condicionado grave no V2: banda 20–100 Hz estável em -33 dB nos planos da sala; some nos planos do quadro; **volta no plano repetido do final**). Isso prova que **é som do plano**, não trilha.
3. **Um evento de som projetado, só no V1:**
   - **Varredura/"swish" subindo** de ≈ 3 kHz a 9 kHz em **1,0 a 2,7 s** (duas ou três linhas diagonais no espectrograma). INFERÊNCIA: whoosh de entrada do lettering PALAVRA-CHAVE e/ou da elipse.
   - **Batida grave** (sub-drop/impact): **20–100 Hz sobe de -50 para -19 dB em 2,75–3,4 s**, ~0,7 s de duração, **logo após o primeiro clarão** (2,73 s). RMS total chega a -9 dBFS, **≈ 5 a 7 dB acima da voz média**. INFERÊNCIA: "impact" do corte do gancho para a conversa.
4. **Os outros 9 clarões não têm som medível** acima da voz (graves e agudos iguais ao fundo). Ou seja, **o clarão é visual; o som projetado só marca o 1º**. (INFERÊNCIA: o autor pode ter usado sons muito baixos que a minha medida não separa.)
5. **Trilha musical: não detectei.** Sem linhas tonais contínuas nem leito harmônico no espectrograma, e o chão entre palavras é ruído ambiente. **Ressalva:** uma trilha muito baixa e escura pode ser mascarada pela voz; não dá para provar a ausência, só dizer que **não aparece**.

### O que o CEO quer (impacto, nada cômico/feliz) × o que as referências têm
- As referências **não** mostram trilha dramática. O "peso" vem da **voz comprimida + a batida grave do gancho + silêncio total de pausas**.
- Portanto a trilha abaixo é **decisão de projeto, não cópia**: é o que o CEO pediu (peso/emoção/tensão). Marcada como "a combinar".

### Receita de áudio proposta (não é observada nas referências)
| Camada | Parâmetro |
|---|---|
| Voz | limitada, **-14 LUFS**, pico ≤ -1 dBFS, sem pausas ≥ 0,12 s |
| Trilha (opcional, a aprovar) | **clima de peso**: pads graves, cordas sustentadas ou piano grave solo, tempo lento; **nada de batida alegre, ukulele, palma, "corporate"**. **22–24 dB abaixo da voz** (regra EDIT IA PRO), entra no plano 2 (depois do gancho), com **duck de 3 dB** sob a voz; sai 1 s antes do fim ou no clarão final |
| Batida grave (hit) | no 1º corte do gancho, **+3 dB sobre a voz**, 0,6–0,7 s, 40–80 Hz, cauda curta; **pico no quadro do corte** |
| Whoosh/swish | só quando uma peça entra (lettering, cartão); curto (≈ 0,4 s), seco, grave-médio, **sem brilho de "magia"**, -10 dB abaixo da voz |
| Clarão entre planos | **silencioso** (como nas referências) ou um "tick" quase inaudível; sem risers longos |
| Silêncio dramático | **0,4–0,8 s sem voz e sem trilha** antes da frase de impacto (só se a fala gravada tiver essa pausa: **não crie pausa que não existe**) |
| Proibido | risada, "pop", "ding", "sparkle", bateria cômica, "record scratch", voz de locutor |

---

## 8. Enquadramento e formato

- **9:16**, 720x1280 (nos nossos vídeos: 1080x1920).
- **V1:** palestrante nos planos de 1 pessoa ocupa **~55–70% da altura**, cabeça nos 15–35% de cima (abaixo da headline). Em tela dividida **cada pessoa ocupa metade (≈ 50/50)**, ambas com a cabeça no terço superior do próprio quadro; o "encontro" tem transição borrada de ~120 px (≈ 9% da altura).
- **V2:** palestrante inteiro, **câmera na altura do peito/do ombro, movimento vivo**, cabeça no terço superior ou no centro-esquerda; **sem tarja, sem nome, sem logo, sem @, sem CTA**.
- **Zona segura:** a legenda está sempre entre y 46% e 67%, dentro de 140–940 (em 1080). A headline do V1 ultrapassa o topo (y 170 em 1080): **sair do padrão** só se o CEO aprovar.
- Nenhum CTA final, nenhum logo, nenhum rodapé. O fim é um clarão (V2) ou o preto (V1).

---

## 9. Ritmo (números)

| Métrica | V1 | V2 |
|---|---|---|
| Planos | 19 | 5 (mais câmera em movimento) |
| Duração média do plano | 3,3 s | 5,3 s |
| Maior / menor | 8,7 s / 0,9 s | 5,3 s / 3,3 s |
| Algo muda na tela a cada | ≤ 3 s (corte, inserção, legenda) | ≤ 2 s (câmera + legenda) |
| Inserções (cartão, B-roll) | 3 em 63 s (1 a cada ~21 s, somando 7,4 s) | 0 |
| Clarões | 6 em 63 s (1 a cada ~10 s) | 4 em 26 s |
| Zoom / push-in animado | **não vi**; "zoom" = corte para outro enquadramento | não aplicável (câmera real em movimento) |
| Jump cuts na fala | **sim**: pausas e muletas removidas (nenhuma ≥ 0,12 s) | **sim** |

---

## 10. Regras de ouro (o que sempre se repete)

1. **Frase de maior impacto nos primeiros 2,5–3,5 s** (do final do discurso), com legenda, e **ela volta** mais à frente.
2. **Headline de 3 linhas, caixa branca, texto preto negrito**, só enquanto o plano do gancho durar (≈ 2,8 s), **sem animação**, no quadro 0.
3. **Zero pausa**: nada ≥ 0,12 s de silêncio; muletas e começos falsos fora.
4. **Voz a -14 LUFS**, limitada, sempre em primeiro plano; o ambiente do plano fica.
5. **Plano muda ≤ a cada 3–5 s** e **a ideia muda → clarão curto de 3 quadros (0,1 s)** na emenda.
6. **Inserção só quando a fala dá o objeto**: a palavra-chave dita (ex.: um verbo, um objeto, uma ação). Sempre **a palavra visual é a palavra dita**.
7. **Lettering de caneta/pincel em cartão creme** para as **frases-regra** (1 a 3 palavras por vez); **gradiente de pôr do sol** na palavra final.
8. **Legenda sem caixa**, branca, **frase que cresce** no tempo da fala; destaque editorial por **serifa negrito** (V2).
9. **Nunca** emoji colorido, sticker, seta, círculo vermelho, zoom tremido, transição de "slide/giro", fonte comic, logo, CTA falado.
10. **Fecho com sensação de continuidade**: loop pelo clarão (V2) ou corte no meio da frase promissora (V1).

**O que nunca aparece** (nas duas): efeito cômico, emoji, sticker, texto colorido, barra de progresso, contagem, ícones de rede social, selo, tarja de nome, B-roll de banco "feliz", música alegre medível, transição de página, glitch, "zoom punch" tremido.

---

## 11. RECEITA PASSO A PASSO (reprodutível)

> Ferramentas: **ffmpeg local** (não tem `drawtext`/`libass`, então todo texto vai como **PNG** feito com **Pillow**), **EDIT IA PRO** (corte pela onda, transcrição, `palavras_na_onda.py`, `portao.py`) e **HyperFrames** (peças animadas: lettering, cartão, flash, composição 2,5D). Siga `conhecimento/edicao-video.md` e a skill `editor-video`.

### Passo 0 — Briefing (1 pergunta)
Para que é (Reels orgânico)? Palestrante? Qual é a **frase de impacto**? Se faltar, o editor escolhe a frase mais forte do trecho **fiel ao que foi dito**.

### Passo 1 — Preparar a fonte
1. `ffprobe` (HDR? se `arib-std-b67`/`smpte2084`, converter com `avconvert … Preset1920x1080`).
2. Se vier em 16:9: reenquadrar para **9:16** com rosto no terço superior; se a câmera cobre 2 pessoas, usar **tela dividida 50/50** (convidado em cima, entrevistador embaixo) com **transição borrada de 120 px**.
3. Escrever tudo em `~/Movies/agencia-palestras/<corte>/` (disco interno) e **nunca mexer no original**.

### Passo 2 — Corte pela onda
1. Transcrever; escolher **um trecho com promessa única** (30–70 s; referências: 26 e 66 s).
2. Cortar **pausas ≥ 0,12 s** e muletas ("é", "então", "né"); emenda com ≈ 0,12 s (regra EDIT IA PRO); **nunca comer o fim da palavra**.
3. Identificar a **frase de impacto** (a última do trecho). Duplicar essa frase: **uma cópia no começo** (2,5–3,7 s) e **a original no lugar natural**.

### Passo 3 — Plano em blocos
Tabela **bloco · fala · plano · inserção** (modelo: seção 2). Regras:
- Alternar **aberto → close → dividida** (V1). Plano máximo **8,7 s**; ideal 3–5 s.
- **Uma inserção a cada ~20 s**, 1,5–3,7 s, nunca cobrindo rosto.

### Passo 4 — Gancho (0 a ≈ 2,8 s)
- Headline PNG no **quadro 0**, **sem animação**, sai **no primeiro corte**.
  - Caixa branca `#FFFFFF`, **largura = 91% (983 px em 1080)**, raio **30 px**, padding **≈ 28 px**.
  - Texto **preto `#000`, negrito (Inter/Poppins Bold), corpo 69 px, linha 84 px**, centralizado, **3 linhas**, **≤ 14 palavras**.
  - Posição: topo **y = 230** (zona segura) **em vez de 170**.
- **Lettering da palavra-chave** (ex.: PALAVRA-CHAVE): branco, **negrito extra**, corpo ≈ 1/3 da largura, y ≈ 43–50%, **elipse de caneta cinza clara** que "desenha" em 0,4 s. Entra aos **0,17–0,3 s**.
  - Para o efeito "atrás do braço": **recorte da pessoa (matte) e texto atrás** (composição 2,5D; leva ~2–3 min de render).
- Legenda do gancho (frase crescente, manuscrita) em y ≈ 67%.
- **Clarão de saída (2,64–2,77 s):** 3 quadros de mistura de tela `#FFB347`→`#FFF1C8`, brilho +40 a +60 (YAVG ≈ 176→218), **corte no pico**.
- **Som:** whoosh no lettering (0,2 s) + **hit grave no 1º quadro depois do clarão** (40–80 Hz, 0,6–0,7 s, **+3 dB acima da voz**).

### Passo 5 — Corpo
- **Legenda de frase crescente** (seção 6), **2 linhas, máx. 5 palavras**, centralizada, **y = 46–52%** (dividida: no encontro das imagens), **sem caixa**, branca, sombra suave (blur 6 px, opacidade 45%).
  - Manuscrita ≈ **57 px (1080)**; geométrica semibold ≈ **45 px (1080)**; serifada de destaque **negrito ≈ 55 px (1080)**.
  - **Cada palavra entra no tempo medido na onda** (`palavras_na_onda.py`), **nunca antes de 0,15 s**.
  - Corrigir nomes próprios e acentos (a transcrição erra: "meninas", "Espírito Santo").
- **Cartão creme** (fundo `#F8F4E8`) para **frases-regra**: 1,5–3,7 s; texto trocando a cada 0,35–0,6 s; **última palavra com gradiente** (laranja `#F7A84A` → vermelho-escuro `#8B2A12`).
- **B-roll de apoio** (mãos orando): **só com licença livre**; 2,2 s; **miniatura redonda do palestrante** (≈ 35% da largura, canto superior direito, entra aos ~0,8 s do plano). **IA generativa paga só com OK do CEO.**
- **Clarão entre planos:** quando muda de ideia (≈ a cada 10 s), **3 quadros**, pico no quadro do corte.

### Passo 6 — Fecho
- **Fim com frase de impacto** (a original) + **clarão de 3 quadros no último quadro** → loop. **Não** terminar em preto (os 2,67 s pretos do V1 foram evitados: parece sobra de exportação).
- **Sem CTA, sem logo, sem @.** (Só inclua CTA se o CEO pedir.)

### Passo 7 — Cor
Ordem do padrão da empresa: **corrigir → pele → grading**.
- **Palestra em sala (V2):** look **teal/laranja** escuro: sombras empurradas para azul-esverdeado, brilhos quentes, **pretos em torno de 9–12/255**, **claro máximo ≈ 180–200/255**, saturação ≈ 0,55. LUT `.cube` e guia do Lumetri para o Premiere.
- **Conversa em ambiente quente (V1):** quase natural, **saturação 0,5**, sem teal. **Igualar** a cor entre ângulos.
- **Conferir pele no vectorscópio** e no celular.

### Passo 8 — Áudio
1. Voz: normalizar para **-14 LUFS**, limitar (**LRA ≈ 2**), pico ≤ -1 dBFS.
2. Camadas (seção 7): hit grave, whoosh, **trilha opcional de peso a 22–24 dB abaixo da voz com duck de 3 dB**. Se o CEO não aprovou a trilha, **entregar sem** e dizer que pode pôr.
3. Conferir `ebur128`: **-14 ± 1,5 LUFS**.

### Passo 9 — Amostra, render e portão
1. **Amostra de 8–15 s** (o gancho + 1 inserção), conferir sem som: o gancho funciona só pela imagem e pelo texto?
2. `build.py completo` → `hf lint` → `hf check` → render → `portao.py` **PASSOU**.
3. Folha de quadros a cada 5 s; rosto centralizado; nada fora da zona segura.
4. `video-pronto.mjs` só depois do portão.

---

## 12. CHECKLIST DE QUALIDADE (corte de palestra)

**Gancho**
- [ ] A frase mais forte aparece em **≤ 3,5 s** e funciona **sem som** (headline + legenda)?
- [ ] A headline está no quadro 0, sem animação, **≤ 14 palavras**, **3 linhas**, caixa branca + texto preto negrito, **sai no 1º corte**?
- [ ] O lettering da palavra-chave entra em ≤ 0,5 s?
- [ ] A frase do gancho **volta no lugar natural** (ou o vídeo termina nela)?

**Corte**
- [ ] **Nenhum silêncio ≥ 0,12 s** (comando: `ffmpeg -af silencedetect=n=-38dB:d=0.12`)?
- [ ] Nenhuma muleta, começo falso ou fim de palavra comido?
- [ ] Plano ≤ 8,7 s; algo muda ≤ a cada 3–5 s?
- [ ] Planos alternam (aberto → close → dividida), nunca dois iguais seguidos?

**Inserções e clarão**
- [ ] Cada inserção entra **na palavra** que a chama e dura 1,5–3,7 s?
- [ ] Clarão = **3 quadros, corte no pico**, só em mudança de ideia (≈ a cada 10 s)?
- [ ] Nada em cima de olhos/boca; miniatura redonda fora do rosto?
- [ ] **Zero** emoji, sticker, seta, ícone colorido, transição "de PowerPoint"?

**Legenda**
- [ ] Frase crescente de 2–5 palavras, nenhuma palavra dita some?
- [ ] Dentro de x 140–940 e y 230–1530 (1080x1920)?
- [ ] Legível no celular (≥ 45 px em 1080)?

**Cor**
- [ ] Pele natural, **mesma cor entre ângulos**, brilhos sem estourar, pretos sem esmagar?

**Áudio**
- [ ] -14 ± 1,5 LUFS, pico ≤ -1 dBFS?
- [ ] Hit grave no 1º corte **e** nenhum som cômico/alegre?
- [ ] Trilha (se houver) **22–24 dB abaixo da voz**, ducking 3 dB, clima de peso?
- [ ] Sem silêncio fabricado; o silêncio dramático só existe se foi dito?

**Formato**
- [ ] 9:16, 1080x1920, 30 fps, H.264; **versão leve < 9,5 MB** também?
- [ ] Final **sem preto de sobra**; termina em frase de impacto ou clarão?

**Entrega**
- [ ] Nomes, números e datas iguais ao que foi dito?
- [ ] Música, imagens e fontes com **direito de uso**?
- [ ] Portão de qualidade **PASSOU** e `video-pronto.mjs` rodado **depois**?

---

## 13. Fluxo RÁPIDO (meta: gravado → pronto o mais perto de tempo real)

**Princípios:** (1) tudo que repete vira script; (2) o editor **só decide** o corte, o gancho e as 2–3 inserções; (3) render uma vez; (4) disco interno.

| # | Etapa | Tempo-alvo | Automatizar com |
|---|---|---|---|
| 1 | "[fala da referência omitida]" | 1–2 min | `ingestao-palestra.sh` (ffprobe, avconvert, `crop` por rosto, dividida 50/50) |
| 2 | Transcrição + palavras na onda | 2–4 min (Whisper local) | skill `editor-video` (`transcribe`, `palavras_na_onda.py`) |
| 3 | **Escolha do trecho e da frase de impacto** | 2–5 min | agente: sugere 3 trechos por promessa; **humano confirma** |
| 4 | Corte pela onda (pausas ≥ 0,12 s, muletas) | 1 min | `edl.json` automático (EDIT IA PRO `corte`) |
| 5 | Gancho: duplicar a frase de impacto + **headline PNG** + lettering da palavra-chave | 1 min | `gerar-headline.py` (Pillow: texto → PNG 91% de largura, raio 30, 3 linhas) |
| 6 | Legenda de frase crescente | 1 min | `gerar-legenda.py` (lê `palavras_na_onda.json`, 2 estilos) |
| 7 | **Flash de 3 quadros** e entrada de cartão | 0 min (pronto) | `flash.py` (preset: 3 quadros, `#FFB347`→`#FFF1C8`) + modelo de cartão creme (HyperFrames) |
| 8 | Áudio: loudnorm, hit grave, whoosh, trilha opcional | 1 min | `audio-palestra.sh` (loudnorm -14, `sidechaincompress` de 3 dB, biblioteca de hits/whoosh sem direitos autorais) |
| 9 | Amostra de 10 s + conferência sem som | 1–2 min | `build.py amostra 0 12` |
| 10 | Render + portão + folha de quadros | 2–3 min | `build.py hf render` → `portao.py` |
| 11 | Entrega + `video-pronto.mjs` + versão leve | 30 s | script de entrega |

**Meta honesta:** **≈ 10–20 min** de relógio para 30–60 s de vídeo **quando já existirem os 6 scripts e o banco de sons**; **tempo real puro não é viável** porque a escolha da frase de impacto e a conferência do portão pedem uma pessoa.
**Para chegar perto de tempo real:** transcrever **enquanto grava** (ou logo após), pré-gerar **banco de cortes** por palestra (várias frases de impacto candidatas), e **templates fixos** (headline, legenda, cartão, flash) para não montar nada do zero.

---

## 14. Incertezas (o que não dá para afirmar)

- **Som:** eu medi, não ouvi. A existência de uma **trilha baixa** não pode ser descartada; o que aparece é só voz, ambiente e um único hit projetado (V1, 2,75–3,4 s).
- **Fontes:** nomes (Poppins, Playfair, manuscrita) são **aproximações visuais**; as medidas de corpo vêm da largura do texto.
- **Origem do B-roll** de mãos (IA, banco ou gravação) e o **efeito de clarão** (light leak do banco ou criado no programa).
- **Se o gancho do V2 repete a mesma tomada** (muito provável) ou é outra tomada quase igual.
- **Cauda preta do V1** (2,67 s) parece sobra de exportação, mas pode ser intencional.
- **Headline:** referência está acima da zona segura de Reels (y 170 em 1080). O padrão da empresa mandava peito. **Decisão do CEO.**
- No V1, headline (topo) e legenda (abaixo) nunca se sobrepõem.

---

## 15. Provas (pasta `referencias-video/palestras/analise/`)

| Arquivo | O que prova |
|---|---|
| `p1-folha-01…09-tNNNs.jpg` | folhas de 0,5 em 0,5 s do vídeo 1 (8 colunas × 2 linhas = 8 s por folha) |
| `p2-folha-01…04-tNNNs.jpg` | idem, vídeo 2 |
| `p1-chave-A` e `G`, `H` | headline no quadro 0, lettering PALAVRA-CHAVE entrando (0–1,6 s), recorte 15 fps |
| `p1-chave-B` | clarão e 1º plano dividido (2,6 a 3,2 s) |
| `p1-chave-D` | cartão de pincel (44,5–47,5 s), gradiente de pôr do sol |
| `p1-chave-E` e `F` | cartão "devolve", close, B-roll de mãos e miniatura redonda |
| `p1-chave-C` | fim: close, corte no meio da frase e preto |
| `p2-chave-A` e `B` | gancho (0–3,5 s) e repetição/clarão final (22,8–26,3 s) |
| `p2-chave-C` e `D` | miolo: slide, caminhada, quadro, grade teal/laranja |
| `p1-espectrograma.png`, `p2-espectrograma.png` | varredura e batida grave em 1–3,4 s (V1); ambiente grave estável nos planos da sala (V2) |

(Nota: `p1-folha-09-t064s.jpg` é preto de propósito — é a cauda do vídeo 1.)

## Regra do CEO (12/11/2026): todo corte tem GANCHO → CONTEXTO → IMPACTO e é feito para viralizar
Ver a seção "ESTRUTURA OBRIGATÓRIA" em `.claude/agents/editor-de-palestras.md`. Antes de renderizar, escreva no plano: (1) gancho (0–3 s), (2) contexto (~3–20 s, só o essencial), (3) impacto (frase final/virada) + o motivo de compartilhar/comentar. Sem os três, ajuste o corte ou avise o CEO. Não prometer viralização.

## Decisão do CEO (12/11/2026): headline na parte de BAIXO, em caixa branca
Caixa branca arredondada, texto preto negrito centralizado, até 3 linhas, na parte de baixo (borda inferior acima de ~y 1540 em 1080×1920, dentro da zona segura), centralizada, desde o quadro 0 até o 1º corte (~3 s). Isso substitui a posição da referência (topo, y 170). Legenda sem colidir com a headline.

---

# ATUALIZAÇÃO 12/11/2026 (feedback do CEO: "ficou amador") — substitui a legenda "frase que cresce" e os cartões creme

Medido em `ref-3-legenda-e-destaques.mp4` (720x1280, 30 fps, 83 s) e `exemplo-graficos-explicativos.mp4` (1080x1920). Valores em 1080x1920 (×1,5 do 720). Aproximações visuais marcadas ~.

## LEGENDA — padrão profissional (ref-3)
| Item | Valor |
|---|---|
| Família / peso | sans geométrica tipo Poppins SemiBold (uso Montserrat 600 como substituta) |
| Tamanho | ~44–46 px (largura de "E para passar" ≈ 340 px). PEQUENA: o destaque é que chama atenção |
| Cor / efeito | branca; sombra suave quase invisível (uso blur 3,5 px, alfa 170). Sem caixa, sem contorno |
| Caixa | como a fala (maiúscula só no início de frase), pontuação mantida |
| Posição | centralizada, linha única, y ≈ 1005 (67% da altura) |
| Palavras por vez | 2 a 5 (uso até 4), quebra em pontuação |
| Entrada/saída | **troca seca de bloco inteiro**, sem fade/pop/slide; bloco aparece no início da 1ª palavra (≈ −30 ms) e fica até o próximo bloco; NÃO cresce palavra por palavra |
| Quando a palavra-chave vira destaque | o bloco pequeno continua (ex.: um bloco pequeno continua enquanto a palavra-chave aparece grande); se o destaque ocupa a faixa da legenda (ex.: "[palavra 1] / [palavra-chave] / naquele evento") a legenda some |

## DESTAQUE DE PALAVRA-CHAVE (ref-3) — o que faz o vídeo parecer profissional
- Palavra enorme (até ~75–85% da largura: palavra curta ≈ 800 px, corpo ≈ 260 px; palavra longa ≈ 950 px), **itálico extra-bold/black**, espaçamento entre letras apertado (≈ −4,5% do corpo), em y ≈ 49–62% da altura (sobre o peito/boca).
- Cores: **branco** para palavra de apoio ("[palavra de apoio]"), **gradiente ciano→azul** com brilho (glow) para a palavra principal ("[palavra principal]"), **gradiente laranja→vermelho** com glow para tema de fogo/perigo ("carne"). Linha de apoio pequena em itálico branco abaixo ("naquele evento", ≈ 100 px).
- Entrada: **blur → nítido** (raio ~14 px para 0 em ~0,3 s = 9 quadros) + **revelação da esquerda p/ direita** com borda suave; linhas empilhadas entram uma a uma, cada uma na sua palavra falada (adianta ≈ 0–50 ms). Saída: corte seco. Permanência 1,2 a 1,6 s.
- Frequência: 2 destaques em 83 s. Regra: no máximo 1 destaque a cada ~10 s; só a palavra que carrega a ideia.
- Implementação: `gfx2.hl_block` / `hl_apply` (cores `WHITE`, `CYAN`, `RED`).

## INSERÇÕES — padrão profissional (exemplo-graficos)
- **Fundo** #F3F3EF com grade fraca a cada 72 px (linhas ~10 níveis mais escuras, esmaecendo para as bordas, vinheta radial).
- **Etiqueta**: quadradinho preto 22 px (canto 4) em x 150, y 252; texto Montserrat 600 ~26 px, caixa alta, espaçamento ~3 px, cinza #58584F.
- **Título**: linha 1 Montserrat 700 ~100 px preto #141414 centralizada (baseline y 470); linha 2 **Playfair Display itálico** ~72–78 px azul #2F5FD0 (baseline y 570).
- **Diagramas em traço**: pílulas com contorno 3 px e canto total (largura variável, texto Montserrat 600 30 px), bolinhas r=17 (círculo com contorno / azul preenchido com miolo branco), setas, checks. UM azul de destaque por cena.
- **Animação**: tudo com easing: entrada = fade + subida de 14–30 px, easeOutCubic 0,3–0,4 s; bolinhas com leve "pop" (back-out); transformações (barras que igualam) easeInOut 0,75 s; escalonamento 45–140 ms entre itens; cada elemento entra na palavra que o chama.
- **Legenda dentro da inserção**: escura, ~42 px, y ≈ 1470, a palavra falada sublinhada em azul (3 px).
- **Regra**: o gráfico PROVA a frase (3% = 3 de 100 bolinhas; riquezas redivididas = barras que igualam). Nada de cartão parado.
- Implementação: `gfx2.card_dots` e `gfx2.card_bars`.

## Ferramenta (um comando)
`ferramentas/palestra/` (copiada de ~/Movies/agencia-palestras/p1/work): `render2.py` (vídeo), `audio.py` (voz −14 LUFS + trilha + hits), `gfx2.py`. Passos: transcrever → escolher palavras (índices) → `render2.py` → `audio.py` → mux. ATENÇÃO: ler a rotação do arquivo (o bruto do CEO é vertical com flag de rotação; proxy deve respeitar).

---

# FLUXO RÁPIDO — ferramenta (12/11/2026)
Para eventos ao vivo (editar e postar na hora). Um comando:

`ferramentas/palestra/editar-palestra.sh <bruto> [--modo rapido|completo] [--cliente cliente-exemplo] [--plano plano.json] [--nome X] [--so-transcrever]`

- **O que faz sozinho:** lê rotação/dimensões com ffprobe (o bruto do CEO é vertical com flag de rotação; sem proxy esticado); transcreve + decodifica o áudio + rastreia o rosto (3 fps, só no que o hardware decodifica, em paralelo); escolhe o trecho sozinho (janela de 35–55 s com mais perguntas/números/palavras fortes; gancho = melhor frase dos primeiros 1/3, reordenada p/ o início; imprime AVISO se o material não sustenta); monta enquadramentos com push-in e clarões; headline em caixa branca embaixo; legenda ref-3; destaques; sons do banco `ferramentas/palestra/sons/` (drone, hits, whoosh, riser, sub-drop, sintetizados UMA vez); render em VÁRIOS PROCESSOS com decodificação e codificação por hardware (VideoToolbox); mux + versão leve numa passada; copia para `iCloud/Agência/Prontos` SE a pasta existir; roda `video-pronto.mjs`; imprime o tempo por etapa.
- **Modo RÁPIDO:** gancho + headline + legenda + push-ins + sons + até 2 destaques. **Modo COMPLETO:** o mesmo + inserções (cartões `dots` e `bars`) descritas no plano.
- **Regra do agente (1 passo, sem rodadas):** rodar `--so-transcrever`, ler `transcricao.txt` (frases numeradas com tempo), escrever o `plano.json` (modelo: `ferramentas/palestra/plano-palestra-1.json`; tempos em segundos do bruto: `segmentos`, `planos` (zoom, flash, som), `destaques`, `cards`) e rodar uma vez. Em evento ao vivo, usar `--modo rapido` e NÃO refazer; se não há gancho/impacto, dizer em 1 linha e entregar o melhor possível.
- Se não houver plano, o próprio comando usa `plano_auto` (salvo em `~/Movies/agencia-palestras/<bruto>/plano-auto.json` para ajustar).
- Cache: transcrição e rosto ficam em `~/Movies/agencia-palestras/<bruto>/` (reprocessar o mesmo bruto pula essas etapas).


## ESTILO "SÓ LEGENDA" (CEO, 13/11/2026) — modelo: `referencias-video/palestras/ref-4-so-legenda-uma-palavra.mp4`
- SÓ voz limpa (−14 LUFS): SEM trilha, SEM efeitos sonoros, SEM destaques de palavra, SEM inserções gráficas, SEM clarões, SEM grade de cor/vinheta, câmera fixa.
- Legenda: UMA palavra por vez (palavras de ≤2 letras juntam com a próxima), Helvetica Bold branca ~96 px, sombra suave, centralizada em y≈1230; headline em caixa branca (texto preto bold, ≤3 linhas) logo abaixo (y≈1280–1540), visível nos primeiros 8 s (na ref some em ~3 s; CEO aceita ≥8 s).
- CONTEXTO: cortes de 75–120 s contando o argumento completo (tese → história → conclusão), sem picotar; o CEO achou os curtos "muito curtos".
- Comando: `ferramentas/palestra/editar-palestra.sh <bruto> --estilo so-legenda --plano <plano.json>` (backup do script antigo em `ferramentas/palestra/legado/editar_palestra-antes-so-legenda.py`; modo padrão intacto). Plano-modelo: `ferramentas/palestra/plano-so-legenda-palestra-2b.json`.
- Falas com número/acusação a marcas: evitar no corte; se ficarem, avisar e o social-media não repete na legenda.


## MONTAGEM NARRATIVA — fora de ordem permitida (CEO, 13/11/2026)
Palavras do CEO: avaliar o contexto; pegar parte do final e encaixar no meio, parte do início e pôr no fim; montar para o contexto ficar PODEROSO; o objetivo não é só cortar respiração, é montar conteúdo que impacta. O editor é DIRETOR DE NARRATIVA. Processo: (a) ler a transcrição inteira; (b) listar ideias fortes e frases-âncora; (c) escolher o arco gancho → tensão/problema → virada → prova/exemplo → conclusão/chamada e ordenar os trechos para o arco funcionar, mesmo fora da ordem gravada; (d) emendas naturais: início/fim de frase, sem cortar palavra, sem mudar sentido, sem inventar nem criar afirmação nova ao juntar; (e) `segmentos` em `plano.json` entram na ordem escrita (confirmado: `montar()` em `editar_palestra.py` itera na ordem da lista, sem reordenar); (f) relatório com a ordem e o motivo. Vale para todos os cortes, inclusive só-legenda.

## DIAGNÓSTICO ANTES DE MONTAR (13/11/2026)
Sempre ler `conhecimento/edicao-narrativa-e-persuasao.md` e aplicar o PROCESSO DE DECISÃO + CHECKLIST antes de montar. Escreva o diagnóstico (ideia única, frase-âncora, arco em ordem?, decisão e motivo). Padrão que funcionou (palestra-3e): história boa em ordem + cold open da frase-âncora (repetida com contexto no corpo) + cortes de respiro/hesitação; nome de pessoa privada cortado nas emendas; segmentos do plano.json valem por palavras (janela t0-0,08..t1+0,08) e `--plano` exige caminho ABSOLUTO.
