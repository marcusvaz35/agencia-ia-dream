# Tokens (fonte: referência HUD verde, adaptada)

**Moldura HUD (toda cena):** canto sup. esq. `MARCA / 0NN` (número da cena sobe no corte), sup. dir. `● REC 00:MM:SS` (relógio correndo), cruzes `+` nos 4 cantos da zona segura, rodapé com micro-rótulo da cena (`PERGUNTA · DIREÇÃO`), chão em grade com perspectiva rolando. → `MA.hud`, `MA.chao`.
**Acabamento:** grão de filme (ruído animado em passos), vinheta, bloom (texto duplicado borrado atrás), flare de lente (linha de luz que abre), câmera em micro-movimento (push-in lento 1,00→1,06 + "chute" de 3,5 % nos cortes). → `MA.acabamento`, `MA.bloom`, `MA.flare`, `MA.camera`.
**Tipografia:** títulos em grotesca pesada apertada (Archivo Black, tracking −0,035em, entrelinha 1,02), 1 palavra-chave por frase em `--acc` com brilho; rótulos em mono pequena caixa-alta com espaçamento largo (JetBrains Mono 22–26 px). Tamanhos 1080×1920: frase 84–120 px, palavra-chave 1,35× (`ma-big`) ou 2,3× (`ma-huge`), nunca abaixo de 28 px.
**Easings:** entrada `expo.out`/`power3.out` (0,3–0,5 s), saída `power2.in` (0,2 s), destaque `back.out(1.7)`, mudança de estado `power2.inOut`, relógio/rolagem `none`. Nunca `linear` em entrada.
**Stagger:** 60–120 ms entre itens; cartões 0,5 s; chuva de partículas espalhada em 70 % da janela.
**Sincronia texto × voz:** palavra entra 0,06 s antes do início da fala (blur 16→0, y 40→0); chave acende no início; bloco some 0,2 s antes da frase seguinte. Tempo vem da transcrição (ver `fluxo.md`); sem tempo medido, distribua por letras com `MA.tempo` e avise.
**Zona segura:** x 140–940, y 230–1530 (HUD) e y 330–1450 (conteúdo). A CLI avisa `outside_safe_zone` com margens mais duras (TikTok); a regra da casa é a do Reels.
