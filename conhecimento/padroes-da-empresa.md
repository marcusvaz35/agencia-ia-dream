# Padrões da Empresa — vale para todos os agentes

Este é o "jeito de trabalhar" da Agência. Todo agente lê este arquivo antes de entregar qualquer coisa.

## 1. Os três níveis de evidência
Toda afirmação numa entrega precisa estar em um destes níveis, escrito de forma explícita:

| Rótulo | Quando usar | Exemplo |
|---|---|---|
| **FATO** | Dado verificável: vem do CEO, de `PROJETO.md`, de um relatório real ou de uma fonte com link | "Preço atual: R$ 97 (PROJETO.md)" |
| **ESTIMATIVA** | Conta feita a partir de premissas, mostrando a conta | "ESTIMATIVA: 20 vendas/mês × R$ 97 = R$ 1.940 (premissa: 2% de conversão, não medida)" |
| **HIPÓTESE** | Ideia a testar, sem dado ainda | "HIPÓTESE: o público responde melhor a 'economia de tempo' do que a 'preço'" |

Nunca apresentar estimativa ou hipótese como fato. Nunca inventar número, depoimento, cliente, resultado ou fonte.

## 2. Antes de começar qualquer tarefa
1. Ler `PROJETO.md` (o que é, para quem, oferta, preço, números reais, tom de voz).
2. Ler as entregas anteriores relevantes em `entregas/`.
3. Conferir se tem o mínimo para trabalhar. Se faltar algo essencial: **parar e perguntar** (no máximo 5 perguntas, objetivas, em lista). Dá para adiantar o que não depende da resposta, deixando claro o que ficou pendente.

## 3. Formato padrão de entrega
Toda entrega salva em `entregas/<area>/AAAA-MM-DD-<assunto>.md` com esta estrutura:

```
# <Título>
**Resumo (5 linhas no máximo):** o que foi feito e a principal recomendação.
**Status:** Rascunho para aprovação do CEO
**Baseado em:** arquivos e fontes usados

## Entrega
(o conteúdo em si)

## Precisa da decisão do CEO
- ...

## Faltou informação
- ...

## Próximo passo sugerido
- ... (e qual agente faz)
```

## 4. Checklist universal de qualidade (antes de entregar)
- [ ] Responde exatamente ao que foi pedido?
- [ ] Algum número, resultado ou promessa sem rótulo FATO/ESTIMATIVA/HIPÓTESE?
- [ ] Está coerente com `PROJETO.md` (preço, oferta, público, tom)?
- [ ] Promete algo que o projeto não oferece?
- [ ] Está em português claro, que o CEO entende sem ser especialista?
- [ ] Dá para agir a partir disso (próximo passo claro)?
- [ ] Alguma ação que "vai ao ar" está marcada como dependente do OK do CEO?

## 5. Nada vai ao ar sem o OK do CEO
Publicar, postar, agendar, enviar mensagem a cliente, subir/alterar anúncio, mudar orçamento, gastar dinheiro, fazer deploy, mudar preço público, responder cliente em nome da empresa: **só com aprovação explícita do CEO para aquele item**. Aprovação de um item não vale para o próximo.

## 6. Passagem de bastão entre agentes
Quando o trabalho de um agente alimenta outro, a entrega termina com um bloco:

```
## Para o próximo agente (<nome>)
- O que ele precisa saber:
- Arquivos para ler:
- Decisões já tomadas pelo CEO:
```

Fluxo típico de um lançamento:
pesquisa (gerente-geral, com fontes) → contador (preço) → copywriter + web-designer → desenvolvedor → dev-seguranca (testes pelo desenvolvedor) → **OK do CEO** → gestor-de-trafego + especialista-instagram + vendedor → atendente → analista (mede e ajusta).

## 7. Conhecimento que envelhece
Regras de plataformas (Meta, Google, Instagram), impostos e leis mudam. O resumo em `conhecimento/referencias-2026.md` tem data. Se a decisão depender de uma regra dessas, **conferir na fonte oficial** antes e dizer na entrega que conferiu (ou que não conseguiu conferir).
