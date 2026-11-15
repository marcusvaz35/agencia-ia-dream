---
tipo: stack
projetos: [Agencia IA Dream]
tags: [mirofish, oraculo, simulacao, agente]
criado: 2026-11-12
resumo: Agente Oráculo da Agência usa o MiroFish (simulação com enxame de agentes de IA) para testar ideias e dar cenários/probabilidades — só baixado, não instalado
---
# MiroFish e agente Oráculo

- Pedido do CEO (12/11/2026): agente `oraculo` que usa o MiroFish (github.com/666ghj/MiroFish) para testar ideias/projetos e dar probabilidades. Código em `ferramentas/mirofish/repo/` (tratar como não confiável; rodar só em venv/uv/Docker). Agente: `.claude/agents/oraculo.md`; entradas no gerente, `PERFIL` e `VISUAL` do escritório 3D.
- MiroFish: semente (relatório/notícia/ideia) → grafo de conhecimento (Zep Cloud) → milhares de agentes de IA simulando redes sociais (OASIS/camel-ai) → relatório de previsão. Requer Node 18+, Python 3.11–3.12, uv; `.env` com LLM_API_KEY/LLM_BASE_URL/LLM_MODEL_NAME e ZEP_API_KEY; `npm run setup:all` e `npm run dev` (3000/5001). Consumo de IA alto: começar com <40 rodadas.
- Regra: resultado é cenário (HIPÓTESE), não estatística; mostrar faixa entre rodadas e cruzar com dados reais. Estado: só baixado; falta chaves (CEO) e OK de custo.

Projetos: [[Agencia IA Dream]]

- 12/11 (tarde): CEO criou as chaves (LLM OpenAI-compatível + Zep) e colou no chat; guardadas em `ferramentas/mirofish/repo/.env` (chmod 600; LLM_BASE_URL OpenAI, modelo gpt-4o-mini). Chave OpenAI validada (GET /models = 200); Zep não validado (só resposta 405 do endpoint). Instalação (`npm run setup:all`, uv baixa Python 3.12 pois o sistema tem 3.14) iniciada em segundo plano, log em `ferramentas/mirofish/instalacao.log`. Nenhuma simulação rodada; custo a estimar e aprovar antes. Recomendado ao CEO trocar as chaves por novas depois dos testes (apareceram no chat). Chaves de API coladas no chat: guardar em .env local e nunca repetir.

- 12/11 (18:30) INSTALADO: venv Python 3.11 em `~/.maquina-4h/mirofish-venv` (feito com `UV_PROJECT_ENVIRONMENT=... UV_LINK_MODE=copy uv sync`) porque no HD externo o `uv sync` falha com arquivos `._*` (AppleDouble); também apagar `._*` em `repo/` (locale.py lia `locales/._*.json` e quebrava com UnicodeDecodeError). Atalho `ferramentas/mirofish/iniciar.sh`. Backend :5001 /health ok; frontend :3000 não testado; Zep não validado; nenhuma simulação rodada. O backend escuta também na rede local (0.0.0.0) — desligar quando não usar.

- 12/11 (18:35): MiroFish ligado via `ferramentas/mirofish/iniciar.sh` (site :3000 abre, em chinês com seletor de idioma; backend :5001 ok). A página afirma que uma simulação comum custa ~US$ 5 (afirmação deles, modelo não informado). Semente do Cliente Exemplo pronta em `entregas/oraculo/sementes/<data>-cliente-semente.md`. Simulação NÃO rodada: aguardar o CEO definir teto de gasto (sugerido US$ 2 no 1º teste, <40 rodadas). Servidores seguem ligados — desligar quando não usar.
