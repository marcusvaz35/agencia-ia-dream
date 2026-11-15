# Frases das [horário das frases 1] — PADRÃO EXATO (método do CEO, 15/11/2026)

Regras do CEO para o cartão de frase: "minere sempre esses tipos de frases que já deram muito bom", "preste atenção no tamanho do texto pra ficar ajustado no reels", "não mude o layout: mesma fonte, mesmo posicionamento, mesmas aspas, incluindo sempre o @cliente do jeito que está" e "guarde o vídeo base pra sempre usar o mesmo áudio".

## Vídeo base (NÃO trocar)
- `ferramentas/frase-0600/video-base.mp4` (NÃO vem no pacote: música com direitos autorais; cada pessoa coloca o próprio vídeo base, 720x1280, ~6 s, com a música que tem direito de usar; veja `ferramentas/frase-0600/LEIA-ME.md`).
- Todo cartão novo usa o ÁUDIO deste vídeo, do começo, e dura 6,2 s. No Instagram não se escolhe outra música.

## Gerador (único jeito de fazer o cartão)
```
uv run --directory ~/.claude/skills/editor-video python "__PASTA_AGENCIA__/ferramentas/frase-0600/gerar.py" --arquivo texto.txt --saida 06h-AAAA-MM-DD-tema.mp4 --png previa.png
```
- O texto vai num .txt com **as quebras de linha que você quer ver na tela** (uma linha do arquivo = uma linha do cartão; linha em branco = espaço entre parágrafos). O gerador não quebra sozinho.
- Medidas (conferidas sobrepondo ao vídeo base, diferença ≤ 4 px): fundo preto; **Hoefler Text Regular** branca, 68 px a 1080, centralizada, passo 73 px; aspas amarelas #FFD71D (glifo Impact) 68x62 — abertura fixa à esquerda (x=218) acima do texto, fechamento fixo à direita (borda em x=872) abaixo; `@cliente` cinza (70,70,70) pequeno e centralizado, na altura da aspa de fechamento; bloco centrado a 0,468 da altura.
- **Tamanho do texto:** fica 68 px. Se a linha mais larga passar de 860 px, a letra diminui só o necessário (como nos posts originais longos, ex.: Colossenses).
- Linhas curtas, uma ideia por linha, como nas referências ("Acredite, mas se mova. / Ore, mas tome posição.").

## O que minerar
Minere só o TIPO de frase que já provou força no perfil do cliente (métricas lidas na tela, com data, no `clientes/<nome>/`). Critério mínimo em `conhecimento/mineracao-viral.md`. Tipos que costumam funcionar em perfis de fé: (1) "Assim diz o Senhor:" + promessa + referência bíblica; (2) fé com atitude em paralelismo ("X, mas Y"); (3) gratidão; (4) "Bom dia!" + versículo; (5) virada/curiosidade. Prints de referência do cliente ficam em `conhecimento/referencias-frases-0600/` (pasta que NÃO vai para o GitHub).
