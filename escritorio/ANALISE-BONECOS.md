# Análise dos bonecos do vídeo de referência (13/11/2026)

Arquivo: `conhecimento/referencias-video/bonecos-agent-office-referencia.mov` (62 s, 720x456, 30 fps). É byte a byte IGUAL ao `escritorio-agent-office-referencia.mov` já analisado. Revisão: 248 quadros (4 por segundo), folhas de 16 quadros e ampliações 3x de Max (desenvolvedor), Olivia (gerente), senhor da cozinha, homem de barba ruiva, moça da sinuca, mulher de óculos. FATO = visto no vídeo; INFERÊNCIA = deduzido (a resolução é baixa).

## 1. Estilo (FATO)
- Low-poly FACETADO: cada boneco tem poucas centenas de polígonos, planos visíveis na cabeça, mãos, roupa e cabelo (sombreamento "flat", cada face com um tom).
- Proporção quase realista, ~7 a 7,5 cabeças de altura (NÃO é cabeça grande de desenho animado). Cabeça um pouco angular, queixo marcado, pescoço visível.
- Cores quase chapadas, terrosas e dessaturadas (marrom, vinho, bege, cinza-azulado, preto); sem contorno desenhado; sombra suave no chão; brilho baixo (material fosco).
- Rosto: muito simples. Olhos são fendas/retângulos escuros pequenos (sem esclera nem íris visíveis), sobrancelha em bloco, nariz em cunha, boca quase neutra (às vezes um retângulo mais escuro). Óculos são molduras pretas retangulares.
- Cabelo: blocos facetados colados na cabeça (loiro em camadas na gerente; calvo com laterais brancas no senhor; ruivo com barba cheia no homem do colete; coque escuro na mulher de óculos).
- Mãos: "luva" em cunha/mitene (sem dedos separados). Pés: sapato escuro simples.
- Roupa de ESCRITÓRIO, em peças separadas: camiseta com estampa "</>" + camisa xadrez/laranja-ferrugem aberta (desenvolvedor), colete vinho + camisa azul-acinzentada + gravata (homem de barba), terno preto + camisa branca (senhor), colete escuro + camisa clara (gerente), cardigã vermelho (mulher de óculos), camiseta mostarda (moça da sinuca), uniforme cinza-azulado com "SEC" e boné (segurança).
- Acessórios vistos: crachá no peito (cordão + cartão com faixa vermelha), fone de ouvido pendurado no pescoço (Max), óculos, gorro/boné, choker/colar.
- Medidas relativas (INFERÊNCIA, ±20%): altura total 1,70–1,80 m; cabeça ≈ 1/7 da altura; ombros ≈ 2 larguras de cabeça; pernas ≈ 47% da altura; a pessoa sentada fica com o tampo da mesa na altura da barriga; mesa ≈ 0,74 m.
- Paleta aproximada (hex): pele #e8b890 / #d9a98a / #a8714a / #6a4026; cabelo #d9c08a (loiro) #a8431c (ruivo) #e4e4e2 (branco) #2a1c14 (escuro); camisa xadrez #9a4a25; camiseta bege #d8c9a8; camisa azul-acinzentada #9fb3c8; colete vinho #4a1a22; terno #1b1b1f; uniforme #aab4c2; mostarda #d9a02a; cardigã #b02a2a.

## 2. Animação (FATO)
- Parado em pé: balanço leve de peso, braços soltos, cabeça olha ao redor.
- Andando: ciclo natural de passos com braços balançando em oposição, tronco quase reto (sem ginga de desenho).
- Sentado: pessoas sentadas nas baias digitando, de frente para o monitor; quem está no sofá fica relaxado.
- Acena para o jogador quando ele chega perto (braço levantado, mão aberta); gesticula conversando; joga sinuca/pebolim; pega café na cozinha.
- Etiqueta sobre a cabeça: pílula escura com bolinha de status + "Nome · Idle"; balão branco de atividade ("Grabbing a coffee.").
- NÃO visto no vídeo (não inventar): levantar/sentar em detalhe (cortes rápidos), expressões de rosto animadas.

## 3. Variações vistas no vídeo (FATO)
Homem jovem de óculos e gorro (Max), homem adulto de barba ruiva e colete, homem mais velho calvo de terno, segurança de uniforme com boné, mulher loira de colete (Olivia, gerente), mulher de óculos e cardigã vermelho, moça de camiseta mostarda, ruiva de colete, faxineira. Ou seja: ambos os sexos, jovem/adulto/mais velho, com ou sem barba, óculos, boné.

## 4. Como recriamos (nosso, do zero, sem usar arquivos do vídeo)
`escritorio/bonecos.js`: geometria própria em Three.js, mesma estrutura de articulações do personagem anterior (as animações andar/sentar/digitar/acenar continuam), porém:
- peças com POUCOS lados + `flatShading` => visual facetado; faceta plana na frente do tronco;
- escala ~1,13 (homem) / 1,07 (mulher) e cabeça a 66–72% => ~7 cabeças; jovem mais baixo e cabeça maior, mais velho com ombros curvados e rugas;
- olhos de fenda escura, sobrancelhas em bloco, boca quase neutra, sem cílios;
- parâmetros: sexo (`corpo`), idade (`idade`), pele, cabelo (+ `calvo`, `curto_grisalho`), barba, óculos, gorro/boné, camisa, colete, gravata, cardigã/blazer, estampa de texto, emblema ("SEC"), crachá (faixa na cor do agente), fone no pescoço.
- 6 arquétipos: `arq-homem-jovem`, `arq-homem-adulto`, `arq-homem-velho`, `arq-mulher-jovem`, `arq-mulher-adulta`, `arq-mulher-velha`. Os 18 agentes são variações deles (tabela `VISUAL` em `bonecos.js`).

## 5. Diferenças que ficaram (honestas)
- O vídeo tem rosto mais "achatado/blocado" e mais detalhe de textura; o nosso é um pouco mais suave (cabeça de elipsoide facetado).
- Xadrez da camisa não foi reproduzido (cor lisa). Dedos: só luva (igual ao vídeo, porém menos angular).
- Cabelo ruivo/loiro com menos camadas que o vídeo. Segurança: sem texto "SEC" legível em ângulos distantes.
- Não replicamos a faxineira nem o recepcionista (não há agentes para eles).
