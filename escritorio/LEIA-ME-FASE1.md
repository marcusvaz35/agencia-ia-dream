# Escritório 3D — Fase 1 (refeita em 13/11/2026 após a reprovação do CEO)

Passo 1: `escritorio/INVENTARIO-REFERENCIA.md` (inventário cômodo por cômodo, feito com quadros a cada 0,5 s e ampliações do vídeo).
Comparações lado a lado (referência à esquerda, nosso à direita): `escritorio/comparacao/*.png`.
Backup da versão reprovada: `escritorio/antigo/*-fase1-reprovada.*`.

## Como ver
`node escritorio/servidor.mjs` → http://localhost:5173. `?parado` desliga o giro; `?rapido` faz os agentes levantarem e passearem logo. Botões/teclas 1–7: Visão Geral, Gerência, Salão, Lounge, Cozinha, Recepção, Reunião. ⟳ liga/desliga o giro; ☀️/🌙 dia/noite. "Assumir o Gerente" (3ª pessoa) abre as portas também.

## Planta (36 x 22 m; x → leste, z → sul)
```
 fundo : Reunião | Gerência | Arquivo/descanso            (cada ≈ 7 x 6 m)
 ------- corredor de vidro com persiana e tapete vermelho (2 m) -------
 meio  : Sala de apoio | Lounge (2 sinucas, pebolim, nicho de sofá)  | Salão aberto
 frente: Cozinha | Banheiros/Depósito | Recepção (placa de ripas)    | (3 bancadas, telão)
```
Cômodos fechados por paredes de gesso bege/vinho ou vidro com persiana, com rodapé e tampa. Salão = metade direita do prédio.

## Portas que abrem ao passar (feito)
17 portas, 2 tipos como no vídeo: **vidro duplo de correr** com moldura escura (corredor, lounge, cozinha, salão, entrada) e **porta de madeira de 1 folha** com visor e maçaneta (reunião, arquivo, apoio, banheiros, depósito) que gira 90°. Abrem com ease quando qualquer personagem (agente ou o gerente controlado) chega a ~1,35 m e fecham suavemente depois (testado: abriu 100% ao chegar e voltou a 0 depois). O vão nunca tem colisão: o personagem sempre passa. A rota dos agentes é uma rede de pontos que passa pelas portas (verificado por script: 170 rotas, nenhuma atravessa parede).

## Móveis
- Geometria própria: paredes, portas, pisos (espinha, tábuas, carpete com manchas, ladrilho), baias (tampo bege, gaveteiro, divisórias verde-azuladas com moldura bege, monitores com ícone de cada agente, caneca, papéis, luminária), sinucas, pebolim, balcão, ilha da cozinha com itens, geladeira vermelha, máquina de lanches, bebedouros, copiadoras, estantes de cubos, flip-chart, globo, troféu, putting green com bandeira, saco de pancada, poltronas, luminárias cônicas, cortiças, pôsteres, relógios, extintor, placa de piso molhado, ícones de banheiro/acessibilidade, carrinho de limpeza etc.
- Kenney Furniture Kit 2.0 (CC0): sofás, estantes, plantas, cozinha, vaso sanitário, pia, caixas, tapetes etc. (só os .glb, em `escritorio/modelos/pacotes/kenney-furniture-kit/`; origem e licença em `escritorio/modelos/pacotes/LICENCAS.md`).
- Peças fixas com o mesmo material são fundidas (poucas chamadas de desenho).

## Medidas (painel do navegador 1400x860, este Mac)
≈ 46 quadros/s (~1.700 chamadas de desenho, ~630 mil triângulos, a maior parte dos 17 personagens). Console sem erros.

## Franco: o que ficou igual e o que ainda difere
Igual: planta (cômodos pequenos e fechados, corredor de vidro, lounge no centro, cozinha/recepção na frente, salão grande à direita com 3 bancadas e telão), pisos, paredes bege/vinho, portas dos dois tipos animadas, persianas, luz noturna quente, muitos props por cômodo.
Ainda difere:
- Não há TETO: a referência tem teto escuro de placas com ventiladores (só aparece na 1ª pessoa); aqui o prédio é aberto por cima (teto + modo 1ª pessoa ficam para a Fase 3).
- Os móveis do Kenney são mais "limpos/claros" que os da referência (que são low-poly facetados mais escuros); o gerente e agentes ainda são os personagens antigos (Fase 2).
- Faltam detalhes finos vistos no vídeo: dezenas de objetos pequenos por mesa (fones, post-its legíveis, pilhas de papel), pessoas jogando sinuca/pebolim em grupo, faxineira, segurança, bicicletas e bancos externos em volta, ar-condicionado externo maior, banheiros por dentro bem detalhados, carpete com o padrão exato. Temos versões simplificadas.
- Proporção do prédio e posição de alguns cômodos (arquivo, apoio) são aproximadas (vídeo 720x456, ESTIMATIVA ±20%).
- O telão mostra barras abstratas (sem números inventados).
- No celular em pé o prédio de 36 m não cabe inteiro: use os botões de zona.
## Fases 2 e 3
Fase 2: personagens low-poly + etiqueta "nome · estado" + balões. Fase 3: teto, modo Walk In (1ª pessoa), painéis de atividade/chat.
