# INSTALAR.md — instruções para o Claude executar a instalação

Você (Claude) está ajudando uma pessoa NÃO técnica a instalar a Agência IA Dream. Fale em português simples, um passo por vez. Nunca peça nem imprima chaves, senhas ou tokens: quem preenche é a pessoa, no arquivo, e você só confere se o campo está preenchido (sem mostrar o valor).

## Regras
- Pergunte antes de instalar programas (brew), baixar arquivos grandes (o modelo de voz de ~470 MB só com `--com-whisper` ou com o OK da pessoa) ou alterar `~/.claude`.
- Nunca faça push, publique, poste, envie mensagem ou gaste dinheiro. Nada vai ao ar sem OK da pessoa.
- Não apague nada do que a pessoa já tem. O instalador faz backup datado antes de mesclar configurações.

## Passos
1. Confirme que está na pasta do kit (existe `instalar.sh`, `MANUAL.md`, `.claude/agents/`). Rode `pwd`.
2. Explique em 2 linhas o que será feito e pergunte: "Posso rodar o instalador? Ele confere programas, ajusta caminhos, cria o cofre do segundo cérebro em `~/Documents/Dream` (só se não existir) e cria um arquivo de chaves vazio."
3. Rode `bash instalar.sh` (sem `--sim` se a pessoa quiser decidir cada programa; com `--sim` se ela disser "pode instalar tudo"). Use `--sem-brew` se ela não quiser instalar programas agora.
4. Leia a saída. Para cada linha `[!]` ou item em "Pendências", explique o que é e ofereça resolver (ex.: `brew install ffmpeg`).
5. Pergunte, uma de cada vez, e ajude apenas no que a pessoa quiser usar (tudo é opcional, menos o Claude):
   - Instagram: o cliente dela tem Instagram? Ajude a instalar a extensão Claude in Chrome e a entrar no Instagram (ela digita a senha, você não).
   - Cortes de podcast: usa o app Edits? Mostre o comando `claude mcp add` com `<SUA_CHAVE>` (veja `MANUAL.md`, seção 4.3).
   - Voz (ElevenLabs): quer? Ensine onde achar a chave e o Voice ID; ela edita `~/.maquina-4h/segredos.env` (permissão 600). Você só confere com `grep -c '^ELEVENLABS_API_KEY=.' ~/.maquina-4h/segredos.env` (conta 1 = preenchido), sem mostrar.
   - WhatsApp, Photoshop, Obsidian: só se quiser.
6. Faça uma entrevista curta (uma pergunta por vez) para preencher `PROJETO.md` (perguntas no fim do arquivo) e, se houver cliente, crie `clientes/<nome>` a partir de `clientes/_modelo` e preencha a `FICHA.md`.
7. Teste: `node escritorio/servidor.mjs` (suba em segundo plano), confira `http://localhost:5173` e depois pare o servidor. Rode `python3 ~/.segundo-cerebro/cerebro.py indices`.
8. Etapa final do instalador, "camada do dono": se a pessoa for a dona da Agência (logada no GitHub com acesso ao repositório privado dela), o instalador pergunta se quer instalar a camada pessoal (EDIT IA PRO e preferências); passe a pergunta adiante e respeite a resposta. Se não for a dona, a etapa é pulada sozinha: não procure nem cite repositório nenhum. `--sem-dono` pula a etapa.
9. Termine com o checklist: o que ficou pronto, o que a pessoa ainda precisa fazer à mão, e a frase "para trabalhar, peça algo ao gerente-geral, por exemplo: faça o planejamento de conteúdo da semana do meu cliente".

## Dependências de terceiros (a pessoa instala/compra na fonte original; não estão neste pacote)
Skills `editor-video` (EDIT IA PRO), `hyperframes`, `hyperframes-cli`, `hyperframes-registry`, `media-use`, `replica-*`, `reverse-any-video`, `style-sampling`. Veja `MANUAL.md` seção 9 para o que deixa de funcionar sem cada uma. Não tente baixar de fontes não oficiais.

## Se algo falhar
Veja `MANUAL.md` seção 8 (problemas comuns). Reporte o erro exato à pessoa em linguagem simples e não improvise instalações.
