# Diagnóstico de tráfego pago: da métrica ruim à causa provável

Origem: lista colada pelo CEO em 14/11/2026 (peça publicitária de uma agência de tráfego; aproveitamos só o conteúdo técnico, não a propaganda). Responsável: `gestor-de-trafego` (com o `analista`). Evidência: prática de mercado, SEM faixas numéricas: o texto não dá valores de referência, então **não inventamos "bom/ruim" em números** — comparar com o histórico do próprio cliente e da conta, e com o benchmark que a Meta/Google mostrarem na tela (citando a fonte). Cada causa abaixo é HIPÓTESE a testar, não diagnóstico garantido.

## Tabela: sintoma → causas prováveis → o que testar
| Sintoma (métrica) | Causas prováveis | O que fazer/testar |
|---|---|---|
| **CPC alto** (custo por clique) | público errado/estreito; criativo fraco (CTR baixo); concorrência alta no leilão; relevância baixa | testar novo público e novo criativo; melhorar gancho; separar conjuntos; revisar posicionamentos |
| **CTR baixo** (taxa de cliques) | criativo ruim, gancho fraco, promessa pouco clara, público errado, oferta fraca | novo gancho nos 3 primeiros segundos, novo texto/headline, outra oferta; testar 3+ criativos |
| **Thumb stop rate baixo** (quem para o dedo no vídeo) | gancho do vídeo ruim, abertura lenta, visual sem contraste | refazer os 3 primeiros segundos (moldes em `ganchos/modelos-de-gancho-falado.md`), texto na tela, cena de impacto |
| **CPM alto** (custo por mil impressões) | público pequeno, concorrência alta (datas fortes, nicho disputado), frequência alta, baixa qualidade do anúncio | ampliar público, evitar sobreposição entre conjuntos, mudar período/posicionamento, melhorar criativo |
| **Público pequeno ou concorrência alta** | segmentação estreita demais, leilão disputado | alargar interesses/lookalike, testar Advantage, ajustar geografia/horário (ver `trafego-publicos-e-segmentacoes.md`) |
| **Frequência alta / fadiga de público** | o mesmo público viu o mesmo anúncio vezes demais; criativo desgastado | renovar criativos, ampliar público, limitar frequência, pausar anúncios cansados (exceção: campanha de reconhecimento local, onde frequência 1→3 é intencional; ver `trafego-local-reconhecimento.md`) |
| **Connect rate baixo** (cliques que viram visita real à página) | **site/página lento**, link quebrado, página pesada no celular, pixel mal instalado, clique acidental | testar velocidade no celular, simplificar página, conferir link e pixel, usar WhatsApp/formulário rápido |
| **Site lento** | imagens/scripts pesados, hospedagem fraca | otimizar imagens, reduzir scripts, medir (PageSpeed) e corrigir antes de gastar mais verba |
| **Público errado** | segmentação desalinhada com o cliente ideal, oferta para quem não compra | refazer o cliente ideal (ficha do cliente), testar públicos separados com mesmo criativo/orçamento |
| **Criativo ruim** | sem gancho, sem prova, sem CTA, qualidade visual baixa | seguir método 5-3 (referências validadas), moldes de gancho, prova real autorizada, CTA claro |
| **ROI baixo/negativo ("no talo" = no limite/ruim)** | consequência dos itens acima: custo alto por resultado, taxa de conversão baixa, margem apertada, oferta ou preço | achar o primeiro ponto do funil que quebra e corrigir NESSA ordem (abaixo); conferir margem com o `contador` |

## Ordem de diagnóstico (funil, de cima para baixo)
1. **Alcance/leilão:** CPM, frequência, tamanho do público → problema aqui = público/concorrência/fadiga.
2. **Atenção:** thumb stop rate e CTR → problema aqui = gancho e criativo.
3. **Clique que chega:** CPC e connect rate → problema aqui = relevância e página (velocidade/link/pixel).
4. **Conversão:** taxa de conversão na página/WhatsApp → problema aqui = oferta, prova, atendimento (`vendedor`/`atendente`).
5. **Retorno:** ROI/ROAS e custo por aquisição versus margem → decidir escalar, ajustar ou pausar.
Corrigir UM ponto por vez e comparar o antes/depois; não mexer em tudo junto (não dá para saber o que funcionou).

## Como o gestor-de-trafego aplica
- Para cada campanha, montar o painel mínimo (CPM, frequência, thumb stop rate, CTR, CPC, connect rate, conversão, custo por resultado, ROI) com **números lidos no Gerenciador**; sem dado = HIPÓTESE + teste proposto.
- Apontar o primeiro degrau do funil que está quebrado, listar as 1–3 hipóteses mais prováveis e o teste de cada uma (custo e duração estimados com a conta, ESTIMATIVA).
- Relatório ao CEO: o que mostram os dados, o que é hipótese, a decisão pedida. Qualquer mudança de campanha, verba ou ativação só com OK do CEO.
