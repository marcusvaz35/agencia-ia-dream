---
name: motion-agencia
description: Skill de Motion da Agência — faz vídeos curtos verticais (Reels) em que as ideias viram motion graphics em código (HyperFrames + GSAP), com moldura HUD, acabamento de cinema, texto sincronizado com a voz e PALETA DEFINIDA PELO TEMA do vídeo (fé, negócios, tecnologia, família, vendas, saúde, educação). Use quando o CEO pedir "motion", "vídeo com gráficos animados", "estilo HUD", "igual ao vídeo do Claude/After Effects em código" ou um vídeo explicativo/de ideia (não de pessoa falando).
---

# Motion da Agência

Base: análise da referência do CEO em `conhecimento/motion-em-codigo-estilo-hud-verde.md`. Motor: skill `hyperframes` (HTML renderizado quadro a quadro). Blocos prontos: `hyperframes-registry` (procure ANTES de escrever efeito novo). Áudio/efeitos: `media-use`.
Não copie marca, nome "MOTION", logo "M" nem textos do criador da referência: o rótulo da moldura usa a marca do cliente/da Agência (ex.: `DREAM / 001`).

## O que a skill entrega
- `kit/tokens.css` — paletas por tema (variáveis `var(--acc)` etc.), moldura HUD, chão em grade, grão, vinheta, tipografia.
- `kit/motion-agencia.js` — biblioteca `MA.*`: HUD, acabamento, câmera, transições e cenas (ver `references/cenas.md`).
- `kit/fonts/` — Archivo Black (títulos) e JetBrains Mono (rótulos), com `@font-face` obrigatório no `index.html` (sem isso o render cai numa fonte fina; aconteceu no teste).
- `references/` — `paleta-por-tema.md`, `tokens.md`, `cenas.md`, `transicoes.md`, `roteiro-padrao.md`, `fluxo.md`.
- Exemplo funcionando: `__PASTA_AGENCIA__/entregas/clientes/cliente-exemplo/videos/2026-11-14/motion-teste/index.html`.

## Regras que não quebram
1. Uma ideia por cena, uma metáfora por ideia. Cena nova a cada 3–5 s, sempre no respiro/ênfase da fala; a cada 15–20 s um quebra-padrão.
2. Tudo entra NA palavra (tempo da voz, até 0,06 s antes). Palavra-chave acende em `--acc` no instante em que é dita.
3. UMA cor de destaque por vídeo (+ fundo + texto). Vermelho só para "errado/cortado". Nada de cor fora do tema.
4. Nada linear: entrada com desaceleração forte (`expo.out`), saída rápida, stagger 60–120 ms, overshoot leve.
5. Moldura HUD em toda cena, dentro da zona segura do Reels (x 140–940, y 230–1530). Texto de conteúdo entre y 330 e 1450.
6. Sem número, resultado, prova ou depoimento que não esteja no material do cliente. Motion ilustra ideia, não inventa dado.
7. Voz sintética só como PLACEHOLDER (avisar no nome do arquivo e na entrega). Trilha/efeitos só com licença livre (CC0 ou com crédito); sem CC BY sem registrar crédito. Sons graves/drone podem ser sintetizados por ffmpeg (sem licença).
8. Contrato HyperFrames: tempo determinístico, sem `Math.random` (use `MA.rand`), sem `repeat:-1`, `fromTo` em vez de `from`, sem CSS transform em elemento que o GSAP anima (use dois elementos aninhados).
9. Conferir sempre: `npx hyperframes@0.9.46 check`, `snapshot --at ...`, render, depois quadros do ARQUIVO exportado e `ebur128` (alvo −14 LUFS; se vier alto, normalize só o áudio com `loudnorm` e copie o vídeo).
10. Nada vai ao ar sem OK do CEO.

Fluxo passo a passo: `references/fluxo.md`.
