# Motor do Segundo Cérebro

- `cerebro.py` — o motor (só biblioteca padrão do Python 3). O instalador copia para `~/.segundo-cerebro/cerebro.py`.
- `config.exemplo.json` — o instalador cria `~/.segundo-cerebro/config.json` a partir dele, trocando `__COFRE__` (a pasta do cofre, por padrão `~/Documents/Dream`) e `__CLAUDE__` (o caminho do comando `claude` no seu Mac).
- Ganchos: ver `global/hooks-cerebro.json` (o instalador mescla em `~/.claude/settings.json` sem apagar os seus).
- Como funciona e regras do registro: `cerebro/cofre/99-Sistema/Como-funciona.md`.
- Desligar por um momento: `export SEGUNDO_CEREBRO_OFF=1`.
- Testar: `python3 ~/.segundo-cerebro/cerebro.py indices` (refaz os índices do cofre).
