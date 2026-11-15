---
tipo: sistema
resumo: Como o Segundo Cérebro funciona e como ele se alimenta sozinho
---
# Como o Segundo Cérebro funciona

Tudo é **automático** — em qualquer projeto, no **Claude Code** e no **Codex**:

1. **Ao abrir uma sessão** → o assistente recebe suas preferências globais e a lista de projetos daqui.
2. **A cada pedido** → o pedido é comparado com todas as notas deste cofre; as relacionadas (de qualquer projeto) entram no contexto, e o assistente lê as úteis antes de agir.
3. **Ao fim de cada execução entregue** (quando houve trabalho de verdade: arquivos, comandos, agentes) → a própria sessão registra aqui o que foi aprendido (sessão do dia, projeto, padrões, decisões, preferências, stack, aprendizados) e refaz os índices. Modo alternativo (`"modo": "fundo"` no config): um curador separado (Codex ou Claude do terminal) registra em segundo plano.

## Pastas e cores
| Pasta | Cor | Para quê |
|---|---|---|
| 01-Projetos | 🔵 azul | uma nota por projeto, com histórico |
| 02-Padroes | 🟢 verde | jeitos de fazer que deram certo |
| 03-Decisoes | 🟠 laranja | escolhas e o porquê |
| 04-Preferencias | 🩷 rosa | como você gosta das coisas (vale em tudo) |
| 05-Stack | 🟣 roxo | ferramentas, comandos, truques e limites |
| 06-Aprendizados | 🟡 amarelo | erros, causas e correções |
| 07-Sessoes | ⚪ cinza | diário do que foi feito |
| 99-Sistema | ⚫ | como funciona e modelos |

Comece pelo [[00-INDICE]].

## Regras do registro (seguidas por quem registra)
1. **Sempre**: entrada em `07-Sessoes/AAAA-MM-DD.md` → `## HH:MM · [[Projeto]] · Claude Code|Codex` + 1 linha do pedido + 2–4 tópicos do que foi feito/decidido + links para as notas criadas/atualizadas.
2. **Sempre**: nota `01-Projetos/<Projeto>.md` (modelo `99-Sistema/Modelos/Projeto.md`) com 1 linha datada em `## Histórico`; atualizar Pasta/Stack se aparecerem.
3. **Só conhecimento durável** — criar OU atualizar (procurar antes, preferir atualizar):
   - `02-Padroes` jeitos de fazer que deram certo · `03-Decisoes` escolhas e o porquê (com data) · `04-Preferencias` como o usuário quer as coisas, em qualquer projeto · `05-Stack` ferramentas, comandos, truques e limites · `06-Aprendizados` erros, causas e correções.
   - Frontmatter: `tipo`, `projetos: [..]`, `tags: [..]`, `criado`, `atualizado`, `resumo` (1 linha). Título = nome do arquivo, claro e pesquisável. Corpo curto com link `[[Projeto]]`.
4. Correções e pedidos explícitos do usuário ("não faça X", "sempre Y") são o mais valioso → Preferência ou Aprendizado.
5. Nada inventado; nada de senhas, tokens, chaves, e-mails, telefones ou dados pessoais; nada de conversa trivial.
6. Não mexer em `.obsidian/`, `99-Sistema/` nem `_indice*.md`; não apagar notas. No fim: `python3 ~/.segundo-cerebro/cerebro.py indices`.

## Bastidores
- Motor: `~/.segundo-cerebro/cerebro.py` (config em `config.json`, log em `registro.log`).
- Ganchos: `~/.claude/settings.json` (Claude Code, todos os projetos) e `~/.codex/hooks.json` (Codex).
- Desligar por um momento: `export SEGUNDO_CEREBRO_OFF=1`.
- Pode editar qualquer nota à mão: o curador atualiza em cima do que estiver aqui.
