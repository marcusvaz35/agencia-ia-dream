---
tipo: stack
projetos: [Agencia IA Dream]
tags: [stack, 3d, threejs]
criado: 2026-11-11
atualizado: 2026-11-11
resumo: Escritório 3D dos agentes com Three.js 0.160, personagens Quaternius CC0 e status ao vivo por ganchos
---
# Escritorio 3D com Three.js

- `node escritorio/servidor.mjs` → http://localhost:5173; lê `.claude/agents/`.
- Status ao vivo: ganchos do Claude Code gravam `escritorio/eventos.jsonl`.

## Redesenho de 11/11/2026 (pedido do CEO)
- Prédio compacto high-tech: sala de vidro por agente (14 salas em 2 fileiras) + sala do gerente com a TV de 100" do cérebro + central com mesa holográfica, sofás e café. Código: `escritorio/mundo.js` (versão antiga em `escritorio/antigo/`).
- Agentes não-trabalhando levantam e passeiam (central, sofás, visita à porta de colegas) e voltam à mesa quando recebem trabalho — poses `em_pe`/`andando` em `personagem.js`, rotas por portas em `escritorio.js`.
- Botão **🎮 Assumir o Gerente**: 3ª pessoa, W A S D, Shift corre, arrastar gira, roda aproxima, Esc sai (o gerente volta sozinho à mesa).
- Câmera da visão geral acompanha o agente selecionado quando ele passeia.

Projetos: [[Agencia IA Dream]]

## Prédio de andares — TESTADO E DESCARTADO (11/11/2026)
- O CEO viu o escritório como prédio de 16 andares com escada e cobertura do gerente e **não gostou**: voltou para o modelo de **salas lado a lado** (uma sala de vidro por agente + central + sala do gerente com a TV de 100").
- Código do prédio guardado em `escritorio/antigo/mundo-v3-predio.js` e `escritorio-v3-predio.js` (escada em U, colisores por nível). Não refazer sem pedido do CEO.
- Mantido do que foi pedido: agente trabalhando senta e só levanta depois de muito tempo parado (`?rapido` acelera os testes), gerente controlável em 3ª pessoa, visual dos personagens em streetwear com roupa de verdade (referências em `escritorio/referencias-personagens/`).

## Visual dos personagens (CEO, 11/11/2026)
- **Gerente-geral = imagem 1**: casaca/sobrecasaca longa preta-grafite com aba e fenda atrás, cinto vinho nas costas, colete abotoado, camisa branca com laço escuro, calça marrom-chocolate, sapato social preto, cabelo castanho curto, sem barba.
- Demais agentes: roupa casual moderna estilizada (moletom/jaqueta com capuz, jeans, legging, short + meia, blazer + vestido, tênis, boné, óculos, fone), cada um com cores diferentes. Referências numeradas em `escritorio/referencias-personagens/img1..img5` e 3 avifs.
- Roupa de verdade = cascas de malha skinned por região do corpo (não pintura no shader); andar mais humano (balanço de quadril, braços opostos às pernas, respiração, troca de apoio).

## Personagens em estilo cartoon 3D (CEO, 11/11/2026 — noite)
- O CEO rejeitou o corpo realista Quaternius com roupas por cima e pediu **personagens cartoon/Pixar** como a imagem de referência: cabeça grande, olhos grandes com esclera e brilho, sobrancelhas grossas, mãos de "luva" (punho arredondado), moletom macio com capuz e cordões, legging com listras laterais, tênis com sola grossa; versão feminina; **todos com a mesma estrutura, variando roupa, cabelo e acessórios**.
- Implementação: rig procedural por articulações em `escritorio/personagem.js` (sem modelos Quaternius); versão com cascas sobre Quaternius guardada em `escritorio/antigo/personagem-quaternius-roupas.js`. Gerente = casaca de img1 no mesmo estilo.
- Página de teste: `escritorio/teste-personagens.html` (parâmetros `?foco=slug&alvo=rosto|peito|pernas|corpo`, `?pose=`, `?congelar=1`).

- 12/11/2026: personagens podem ser GLB do TRELLIS com esqueleto por código (`escritorio/boneco-trellis.js`, `MODELOS_TRELLIS` em `personagem.js`); o resto segue procedural. Sentado: quadril a 0,60 m, coxa 1,0 rad, canela vertical.

- Monitores por agente (12/11): Chrome invisível `"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --user-data-dir=~/.maquina-4h/chrome-agentes` com cópia do perfil Default (cookies etc.) abre o Instagram logado. Próximo: capturar frames, servir em `servidor.mjs` e usar como textura do monitor (`telaMonitor` em `mundo.js`). Ver [[Monitores por agente no escritorio 3D]].

- 12/11 noite: o escritório foi reconstruído como UM andar (Fase 1 do plano "igual ao Agent Office"): ver [[Escritorio 3D igual ao Agent Office (referencia do CEO)]] e `escritorio/LEIA-ME-FASE1.md`. Backups do formato antigo (salas por agente) em `escritorio/antigo/*-v4-antes-agent-office.js`. Atenção ao editar: `sed -i` no macOS exige `''`.
