# Biblioteca de cenas (`MA.*` em `kit/motion-agencia.js`)

Todas recebem a timeline raiz `tl`, o contêiner da cena e tempos ABSOLUTOS. Status: TESTADA = usada no vídeo de teste e conferida em quadros; ESCRITA = implementada, ainda não renderizada (conferir com `check` + `snapshot` na primeira vez; ajuste posição/tamanho).

| Cena | Chamada | Use para | Status |
|---|---|---|---|
| Abertura com flare | `MA.flare(root,tl,0,960,1)` | primeiros 0,5 s; linha de luz abrindo | TESTADA |
| Palavras na voz | `MA.palavras(tl,cena,[[{w,t,key,cls}]],{top,size,saida})` | toda frase falada | TESTADA |
| Palavra com bloom | `MA.bloom(tl,cena,"ALICERCE",t,{top,size,saida})` | a palavra que o vídeo inteiro defende | TESTADA |
| Riscar "não é X" | `MA.riscar(tl,linhaDeX,t)` | "não é X, é Y" | TESTADA |
| Alvo / mira | `MA.alvo(tl,cena,{t,x,y,flecha})` | "acertar", foco, direção | TESTADA (sem flecha) |
| Blocos que se empilham | `MA.blocos(tl,cena,{tBase,tTopo,base,topo})` | ordem, fundamento→crescimento, etapas | TESTADA |
| CTA caixa de comentário | `MA.cta(tl,cena,{t,top,texto})` | "comenta PALAVRA" + raios | TESTADA |
| Fechamento em loop | `MA.flare` no fim + overlay `var(--bg0)` fade | último quadro = começo | TESTADA |
| Prompt digitando | `MA.prompt(tl,cena,{top,texto,t,dur,rotulo})` | "é só descrever", pedido, busca | TESTADA em galeria (renderiza; só ajustar posição) |
| Tira de filme | `MA.filme(tl,cena,{t,top,dur})` | "quadro a quadro", processo | TESTADA em galeria (renderiza; só ajustar posição) |
| Chuva de losangos | `MA.chuva(tl,cena,{t,dur,n})` | muitos pequenos passos/keyframes/orações | TESTADA em galeria (renderiza; só ajustar posição) |
| Cartões enchendo | `MA.cartoes(tl,cena,{t,top,itens,passo})` | lista de 3–5 critérios/referências | TESTADA em galeria (renderiza; só ajustar posição) |
| Antes × depois cortado | `MA.antesDepois(tl,cena,{t,top,antes,depois})` | transformação (linha varre e revela) | TESTADA em galeria (renderiza; só ajustar posição) |
| Logo com chips orbitando | `MA.logoChips(tl,cena,{t,logo,chips})` | marca/cliente + o que ela reúne (logo SEMPRE do cliente) | TESTADA em galeria (renderiza; só ajustar posição) |
| Arco gigante com pergunta | `MA.arco(tl,cena,{t,top,texto})` | pergunta final / "substitui?" | TESTADA em galeria (renderiza; só ajustar posição) |

Cenas que a referência tem e ainda NÃO viraram função: fio 3D de arame (use bloco 3D do registry/Three.js), cubo com curva de easing + painel de código, radar com varredura. Antes de codar, `npx hyperframes@0.9.46 catalog --query "<efeito em inglês>"` (ex.: `before-after-wipe`, `grain-overlay`, `camera-shake`, `code-diff`).
Cada cena = 1 ideia + 1 metáfora. Receita de metáforas: acertar=alvo · passos=blocos · processo=tira de filme · volume de pequenas coisas=chuva · critérios=cartões · transformação=antes×depois · "o que é meu"=logo+chips · pergunta=arco · ação=CTA.
