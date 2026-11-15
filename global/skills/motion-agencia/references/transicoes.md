# Transições (nunca "slide" padrão)

| Transição | Chamada | Quando |
|---|---|---|
| Varredura de luz | `MA.varredura(root,tl,t,0.6)` | troca suave entre ideias; começa ~0,1 s antes do corte (TESTADA) |
| Flash de cor | `MA.flash(root,tl,t,0.5,0.3)` | virada forte, "não é X, é Y", CTA (TESTADA) |
| Corte seco no pico da palavra | scene `data-start` = início da palavra + `MA.camera` "chute" | padrão; o mais limpo |
| Mergulho em túnel de grade | `MA.tunel(root,tl,t,0.7)` | entrar numa explicação/demonstração (TESTADA em galeria; anel quadrado ainda simples) |
| Flare + escurecer | `MA.flare` + overlay | fechamento em loop (TESTADA) |
Regras: 1 transição por corte, no máximo 3 estilos por vídeo; som de whoosh começa ~0,08 s antes do corte; flash nunca em dois cortes seguidos.
