# Fluxo passo a passo

1. **Roteiro** — escolha tema → paleta (`paleta-por-tema.md`); escreva pelo `roteiro-padrao.md`; liste as palavras-chave (1 por frase).
2. **Áudio** — voz do cliente (preferida) ou placeholder: `say -v Luciana -r 175 -o s1.aiff "frase"` (uma frase por arquivo), junte com `ffmpeg adelay` deixando 0,3–0,5 s entre frases; salve `voz.wav` (mono 44,1 kHz).
3. **Transcrição com tempo por palavra** — voz real: `npx hyperframes@0.9.46 transcribe voz.wav --language pt --json` (confira palavras erradas; o texto vale o ROTEIRO, não a transcrição). Voz sintética: `silencedetect` por frase + `MA.tempo` (distribui por letras dentro de cada trecho entre pausas). Whisper em voz sintética erra palavras e tempos.
4. **Storyboard** — tabela: cena · tempo · fala · metáfora · palavra-chave · transição · som. Mostre ao CEO se pedir; senão siga.
5. **Projeto** — `npx hyperframes@0.9.46 init <nome> --non-interactive --resolution portrait --skip-transcribe --skip-skills`; copie `kit/tokens.css`, `kit/motion-agencia.js`, `kit/fonts/*` para `assets/`; no `index.html`: GSAP (CDN), `<link tokens.css>`, `@font-face` das duas fontes, `data-tema`, cenas `.clip` e `<audio id=...>`.
6. **Código** — por cena, chamadas `MA.*` com tempos absolutos (veja `motion-teste/index.html`). Procure bloco no `hyperframes-registry` antes de inventar.
7. **Check** — `npx hyperframes@0.9.46 check --json`. `content_overlap` de `<i>`/`<b>` das palavras-chave é intencional; `outside_safe_zone` compara com margens do TikTok (aviso). Erros reais: corrigir.
8. **Olhar quadros** — `npx hyperframes@0.9.46 snapshot --at t1,t2,...` (início, meio e fim de cada cena) e LER as imagens. Ajuste tamanho/posição.
9. **Render** — `npx hyperframes@0.9.46 render --quality high --fps 30 --output renders/x.mp4`. Depois: quadros do arquivo (ffmpeg `select`/`tile`), `ffprobe`, `ebur128`.
10. **Mixar áudio** — efeitos CC0 por `npx hyperframes@0.9.46 media-use resolve --type sfx --intent "..." --project .` (confira `license` na resposta: `cc0` livre; `by` exige crédito — evite); thump/drone por `ffmpeg aevalsrc`. Voz = volume 1, sons 0,3–0,55, drone ≤ 0,16. Alvo −14 LUFS: `ffmpeg -i in.mp4 -c:v copy -af loudnorm=I=-14:TP=-1.5 -c:a aac out.mp4`.
11. **Entrega** — nome claro, versão < 9,5 MB, `node ferramentas/video-pronto.mjs ...`, registro em `entregas/video/`. Nunca publicar.
Armadilhas vistas: fonte não declarada vira sans fina no render; fundo exFAT cria arquivos `._*` (rode `dot_clean`); `scale` relativo em dois tweens do mesmo elemento brigam (use `cam` + `kick`).
