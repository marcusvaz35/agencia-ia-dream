# MiroFish (simulador do agente `oraculo`) — não incluído

O código (1,4 GB, projeto aberto de terceiros) não vem no kit. Para usar:
1. `cd ferramentas/mirofish && git clone https://github.com/666ghj/MiroFish.git repo && git -C repo checkout 7657031ac01184afe2cb220f5ee3545573b5e843` (commit testado, de 02/10/2026; só mude depois de revisar o código novo)
2. Crie `repo/.env` a partir de `repo/.env.example` com as SUAS chaves (nomes: LLM_API_KEY, LLM_BASE_URL, LLM_MODEL_NAME, ZEP_API_KEY). Nunca suba esse arquivo ao GitHub.
3. Crie o ambiente Python fora do disco externo: leia o README do projeto e use `~/.maquina-4h/mirofish-venv` (é o caminho que o `iniciar.sh` espera).
4. `ferramentas/mirofish/iniciar.sh` liga o backend (:5001) e o site (:3000).
Trate o código como NÃO confiável: rode isolado e leia o que cada script faz. Cada simulação gasta IA paga: estime o custo e peça OK antes.
