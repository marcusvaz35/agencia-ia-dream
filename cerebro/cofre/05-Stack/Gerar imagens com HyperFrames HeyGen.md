---
tipo: stack
projeto: Agencia IA Dream
data: 2026-11-14
---
# Gerar imagens com HyperFrames (HeyGen)
- `npx -y hyperframes media-use generate --type=image --out=<arq> --prompt=... [--reference=img1,img2] --aspect=9:16 --model=nano-banana-2.1`; `--plan` mostra o preço sem gastar.
- Preço medido em 14/11/2026: ~US$0,07 por imagem (nano-banana-2.1), cobrado nos créditos da conta → é gasto: pedir OK do CEO antes.
- Rodar dentro de uma pasta de projeto HyperFrames. Sem mflux local (FLUX grátis) instalado.

## Alternativas grátis (14/11/2026)
- HeyGen exige login no Mac (sem login: erro "no HeyGen sign-in", nada cobrado).
- FLUX.1-schnell no Hugging Face via `uv run --with gradio_client` (`Client("black-forest-labs/FLUX.1-schnell").predict(..., api_name="/infer")`): qualidade boa, mas a cota ZeroGPU anônima acaba em ~1–2 imagens (mesma cota do TRELLIS, por IP). Token grátis do HF aumenta a cota.
- Pollinations (image.pollinations.ai, sem chave): 1 imagem a cada 45 s por IP e qualidade fraca/estilo não seguido — evitar para peças de aprovação.
