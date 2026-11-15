# Manual da Agência IA Dream (passo a passo, para quem não é técnico)

Este manual ensina a instalar e usar a Agência no seu Mac.

> **Segurança, leia antes:** leia o kit (pelo menos `instalar.sh` e `CLAUDE.md`) antes de rodar o instalador. As notas do cérebro entram no contexto da IA a cada pedido: só instale kits de quem você confia e revise as notas que o cérebro grava. Se algo parecer difícil, peça ao próprio Claude: "me ajude com o passo X do MANUAL.md".

---

> **Atenção:** depois de instalar, esta pasta tem o SEU caminho nos textos. Não faça commit dela; se quiser guardar alterações suas, use uma cópia.

> O repositório pessoal do dono não deve ser compartilhado com ninguém.

## Como ler este manual

| Você é… | Leia |
|---|---|
| **Uma pessoa que recebeu este kit de outra pessoa** | **Parte A** (seções 1 a 10) e depois "Começar um trabalho novo" |
| **O dono (quem montou a Agência) e vai usar em outro computador** | **Parte B** e depois "Começar um trabalho novo" |

Regra de ouro do kit: **nenhum dado de cliente vem no kit.** Cada pessoa cadastra os SEUS clientes, na SUA máquina, e eles nunca sobem para o GitHub.

---

# PARTE A — Se você recebeu este kit de outra pessoa

## 1. O que você recebeu

| Parte | O que é | Onde está |
|---|---|---|
| **18 agentes** | Cada um é um "funcionário" de IA com função própria: gerente-geral, especialista-instagram, social-media, editor-de-video, editor-viral-podcast, editor-de-palestras, especialista-frases, especialista-ganchos, copywriter, web-designer, desenvolvedor, dev-seguranca, gestor-de-trafego, vendedor, atendente, analista, contador, oraculo | `.claude/agents/` |
| **Comandos prontos** | Atalhos: `/gancho-do-dia`, `/postar-rapido`, `/maquina-4h` | `.claude/commands/` |
| **Conhecimento** | Os métodos da empresa: Método 5-3, grade de conteúdo, os 3 tipos de conteúdo, vendas, tráfego, edição de vídeo, motion, artes de evento e telão | `conhecimento/` |
| **Ferramentas** | Scripts para gerar cartões de frase, tela dividida, vídeo falado, cortes de palestra, voz (ElevenLabs), WhatsApp, caixinha de pergunta do Instagram | `ferramentas/` |
| **Escritório 3D** | Uma página no navegador onde você vê os agentes trabalhando, faz pedidos e acompanha as entregas | `escritorio/` |
| **Segundo cérebro** | Um cofre de notas (Obsidian) com padrões, decisões, ferramentas e aprendizados. O Claude lê as notas certas a cada pedido e registra o que aprende | `cerebro/` |
| **Cliente-modelo** | Fichas em branco para você cadastrar o seu cliente | `clientes/_modelo/` |

A regra de ouro da empresa (está no `CLAUDE.md`): **não inventar números, perguntar quando faltar informação e nada vai ao ar sem o seu OK.**

---

## 2. O que você precisa ter

- Um **Mac** (macOS). Windows e Linux não são o alvo deste kit.
- Uma **assinatura do Claude** com acesso ao Claude Code. Preços e planos: consulte o site oficial da Anthropic (os valores mudam).
- **Contas próprias**, conforme o que for usar. Nenhuma conta, chave ou senha vem no pacote:

| Item | Obrigatório? | Pago? |
|---|---|---|
| Claude Code (assinatura) | Sim | Pago; consulte o site |
| Google Chrome + extensão "Claude in Chrome" | Para Instagram | Extensão: consulte a loja do Chrome |
| Conta do Instagram do seu cliente | Para Instagram | Grátis |
| App Edits (cortes de podcast) | Opcional | Consulte o site do app |
| ElevenLabs (voz) | Opcional | Tem plano grátis e pagos; consulte o site |
| WhatsApp do Mac | Opcional | Grátis |
| Photoshop | Opcional (artes de evento e telão) | Pago; consulte o site da Adobe |
| Obsidian | Opcional | Consulte o site |
| Skills de terceiros (EDIT IA PRO etc.) | Opcional, mas melhora muito os vídeos | Consulte a fonte de cada uma |

Programas gratuitos que o instalador confere: Homebrew, ffmpeg, yt-dlp, Node.js, uv, whisper-cpp, GitHub CLI e Python 3.

---

## 3. Instalação em 5 passos

1. **Baixar o repositório.** No GitHub, botão verde "Code" > "Download ZIP" (descompacte) ou, se souber, `git clone`. Como o repositório é privado, você precisa ter sido convidado e estar logado no GitHub. Guarde a pasta num lugar fixo (ex.: `Documentos`). Se mudar de lugar depois, rode o instalador de novo.
2. **Abrir no Claude Code.** Abra o aplicativo Terminal, digite `cd ` (com um espaço), arraste a pasta da Agência para a janela do Terminal, aperte Enter e digite `claude`. Se for a primeira vez, faça login: `claude auth login`.
3. **Colar o texto do COMECE-AQUI.** Cole no Claude:

   > Leia o arquivo INSTALAR.md desta pasta e instale tudo para mim, passo a passo. Pergunte antes de instalar qualquer programa ou mexer em configurações. No final, me diga em português simples o que ficou pronto e o que ainda preciso fazer à mão.

4. **Responder às perguntas.** O Claude vai rodar o `instalar.sh`, que: confere os programas (e oferece instalar os que faltam), ajusta os caminhos para a sua pasta, cria o cofre do segundo cérebro em `~/Documents/Dream` (se você já tiver uma pasta com esse nome, ele NÃO sobrescreve: cria `~/Documents/Dream-kit-novo`), instala o motor do cérebro, junta os ganchos às suas configurações do Claude (com backup datado) e cria um arquivo de chaves vazio.
5. **Conferir.** Peça: "abra o escritório 3D". O Claude roda `node escritorio/servidor.mjs`; abra `http://localhost:5173` no navegador. Você deve ver o escritório com os agentes. Para fechar, `Ctrl+C` no Terminal. O escritório só aceita acessos de `localhost`/`127.0.0.1`; o acesso por Tailscale vem desligado (para ligar por sua conta e risco: `ESCRITORIO_TAILSCALE=1 node escritorio/servidor.mjs`). Importante: **abra uma sessão NOVA do Claude Code depois da instalação** (os ganchos só valem em sessões novas).

O instalador também tem uma etapa final chamada "camada do dono". Se você NÃO é o dono da Agência, ela é pulada sozinha (ou use `--sem-dono`) e você só vê um aviso sobre o EDIT IA PRO. Sem o Claude, dá para rodar sozinho no Terminal: `bash instalar.sh` (pergunta antes de instalar) ou `bash instalar.sh --sim` (responde "sim" ao que é seguro; NÃO baixa o modelo de voz) ou `bash instalar.sh --sem-brew` (só confere). O modelo de voz do whisper (~470 MB) é um passo à parte: `bash instalar.sh --com-whisper` baixa e confere o SHA-256 (versão fixada do repositório oficial whisper.cpp no Hugging Face).

---

## 4. Conectar cada coisa

Cada conexão tem 3 partes: para que serve, como conectar, como saber se funcionou. **Tudo aqui é com a SUA conta.**

### 4.1 Claude (obrigatório)
- **Serve para:** tudo.
- **Conectar:** no Terminal, `claude auth login` e siga a página que abre.
- **Funcionou?** `claude` abre e responde. Dentro dele, digite `/status`.
- **Atenção:** se você usa o Claude por aplicativo e por Terminal, o Terminal precisa ter o próprio login (o pedido feito pela página do escritório usa o login do Terminal).

### 4.2 Chrome + Instagram
- **Serve para:** minerar posts virais (ler curtidas, comentários), conferir o perfil, agendar e publicar posts (com o seu OK) e responder comentários (rascunho para você aprovar).
- **Conectar:** (1) instale o Google Chrome; (2) instale a extensão **Claude in Chrome** pela loja do Chrome e entre com a sua conta Claude; (3) no mesmo Chrome, entre no Instagram do **seu cliente** (você digita a senha; o Claude nunca pede).
- **Funcionou?** Peça: "abra o Instagram do meu cliente no Chrome e me diga o nome do perfil que aparece". Se aparecer o nome certo, está ok.
- **Cuidado:** se você tiver mais de um computador ou o Chrome do Windows conectado, o Claude pode usar o Chrome errado. A regra da casa é usar **somente o Chrome do Mac**. Sem o Chrome logado, o Instagram não mostra métricas e a mineração não pode ser conferida (o agente deve avisar, não inventar).

### 4.3 Edits e o MCP `metapilot-native` (cortes de podcast)
- **Serve para:** editar e exportar cortes de podcast/entrevista no app Edits, controlado pelo editor-viral-podcast.
- **Conectar:** (1) instale o app Edits e abra-o; (2) nas configurações do app, ache o endereço do servidor MCP e a chave de acesso (cada pessoa tem a sua); (3) no Terminal rode (troque pelos seus dados):

  ```
  claude mcp add --transport http metapilot-native <URL_DO_SEU_EDITS> --header "Authorization: Bearer <SUA_CHAVE>"
  ```
  A URL costuma ser um endereço local, como `http://127.0.0.1:19501/mcp` (confira no app). **Nunca cole a sua chave em arquivo do projeto nem no GitHub.**
- **Funcionou?** Abra uma sessão nova do Claude e digite `/mcp`: `metapilot-native` deve aparecer conectado. Se der "connection refused", o app Edits está fechado.
- Se o Edits não responder, o editor para e avisa (não improvisa sem o seu OK).

### 4.4 ElevenLabs (voz) — opcional
- **Serve para:** gerar a voz do roteiro aprovado (`ferramentas/voz-elevenlabs.mjs`). Use só a **sua** voz ou uma voz com autorização.
- **Conectar:** crie conta em elevenlabs.io; em *Developers > API Keys* crie uma chave restrita (Text to Speech e Voices Read); copie o *Voice ID* da sua voz. Abra `~/.maquina-4h/segredos.env` (aperte Cmd+Shift+G no Finder e cole o caminho; ou peça ao Claude para abrir no editor) e preencha `ELEVENLABS_API_KEY=` e `ELEVENLABS_VOICE_ID=` (sem aspas, sem espaço).
- **Funcionou?** Peça ao Claude: "confira se as chaves do ElevenLabs estão preenchidas, sem me mostrar os valores".

### 4.5 WhatsApp do Mac — opcional
- **Serve para:** o Mac mandar sozinho o pacote do dia (gancho e texto) para o **seu próprio** chat.
- **Conectar:** instale e entre no app WhatsApp do Mac; preencha `WHATSAPP_PARA=` no `segredos.env` com o seu número (só dígitos: 55 + DDD + número). Libere **Acessibilidade**: Ajustes do Sistema > Privacidade e Segurança > Acessibilidade > ative o app que roda o Claude (Terminal ou o app do Claude).
- **Funcionou?** `ferramentas/whatsapp-enviar-auto.sh arquivo.txt` abre o seu chat e envia. Precisa do Mac **ligado e desbloqueado**. Erro "não tem permissão para acionar teclas" = falta Acessibilidade.
- O envio pela API oficial da Meta (`whatsapp-enviar.mjs`) é avançado e exige conta de desenvolvedor da Meta; pule se não souber.

### 4.6 Photoshop — opcional
- **Serve para:** o web-designer criar as artes de evento (`conhecimento/artes-evento-igreja.md`) e de telão (`conhecimento/artes-telao-igreja.md`) em PSD + PNG.
- **Conectar:** tenha o Photoshop instalado e licenciado por você. Os agentes o usam pelo Mac.
- **Funcionou?** Peça: "crie uma arte de teste de 1080x1350 com a palavra TESTE e salve em entregas/design".
- **Sobre as referências:** as imagens em `conhecimento/referencias-artes-evento/` e `referencias-telao/` são de terceiros, só para **estudo interno**. Não republique.

### 4.7 Obsidian — opcional
- **Serve para:** você ler e editar o segundo cérebro com boa aparência (a IA funciona sem ele).
- **Conectar:** instale o Obsidian > "Abrir pasta como cofre" > escolha `~/Documents/Dream`.
- **Funcionou?** Você vê as pastas 02-Padroes, 03-Decisoes, 05-Stack, 06-Aprendizados e o `00-INDICE`.

---

## 5. Primeiro uso

1. **Preencha o `PROJETO.md`.** Peça: "me entreviste, uma pergunta por vez, para preencher o PROJETO.md". Enquanto houver `[A PREENCHER]`, os agentes perguntam em vez de inventar.
2. **Crie a ficha do cliente.** `cp -R clientes/_modelo clientes/<nome-do-cliente>` (ou peça ao Claude) e peça: "me entreviste para preencher a FICHA.md e a GRADE-DIARIA.md do cliente <nome>". Vídeos brutos do cliente vão em `clientes/<nome>/videos-brutos/` (fica só no seu Mac; o `.gitignore` não deixa subir para o GitHub).
3. **Faça o primeiro pedido ao gerente-geral.** Ele divide o trabalho e chama os agentes certos.

Pedidos de exemplo (cole no Claude):

| Agente | Pedido de exemplo |
|---|---|
| gerente-geral | "Monte o plano da semana para o cliente `<nome>` e me diga o que precisa da minha decisão." |
| especialista-instagram | "Crie a grade de conteúdo da semana em escada para o cliente, seguindo grade-de-conteudo.md." |
| social-media | "Audite o perfil do cliente com perfil-que-converte.md e me entregue um relatório." |
| especialista-ganchos | "Minere 10 ganchos virais para o tema X e explique por que prendem." |
| especialista-frases | "Mine 5 frases virais do tipo que já funciona no perfil do cliente e gere os cartões." |
| editor-de-video | "Edite este vídeo bruto no padrão do cliente: corte respiros, legenda de uma palavra, gancho forte." |
| editor-viral-podcast | "Escolha os 5 melhores trechos deste podcast e monte o plano de edição." |
| editor-de-palestras | "Transforme esta palestra em um corte de impacto de 45 segundos." |
| web-designer | "Crie a arte de convite para o evento X no estilo das referências." |
| copywriter | "Escreva 3 roteiros de 30 segundos com gancho, virada e chamada para ação." |
| gestor-de-trafego | "Planeje uma campanha local de reconhecimento para o bairro (só o plano, sem ativar nada)." |
| vendedor | "Escreva a resposta para a objeção 'está caro' usando vendas-objecao-preco.md." |
| atendente | "Monte um FAQ com as 10 dúvidas mais comuns dos clientes." |
| analista | "Quais métricas devo acompanhar e como diagnosticar uma queda de alcance?" |
| contador | "Calcule o preço mínimo e o ponto de equilíbrio deste serviço (mostre as contas)." |
| oraculo | "Teste a ideia X antes de eu investir (precisa do MiroFish, veja a seção 9)." |
| desenvolvedor / dev-seguranca | "Crie uma página simples de captura de contatos" / "Revise a segurança antes de publicar." |

Você também pode fazer pedidos pela página do escritório 3D (card "Nova tarefa para a equipe"). Isso exige o Claude Code logado no Terminal.

---

## 6. Como a empresa trabalha (e as regras)

1. Você (CEO) pede. 2. O gerente-geral entende, divide e chama os agentes. 3. Cada agente entrega no formato padrão (o que foi feito, o que falta, o que precisa de decisão). 4. O gerente confere. 5. **Você aprova** e só então algo é publicado, enviado ou gasto.

Regras de todos os agentes:
- **Não inventar números nem resultados.** O que for estimativa vem marcado "ESTIMATIVA" com a conta; dado de pesquisa vem com fonte.
- **Perguntar quando faltar informação.**
- **Nada vai ao ar sem o seu OK**: publicar, postar, mandar mensagem a cliente, subir anúncio, gastar dinheiro, fazer deploy.
- Entregas ficam em `entregas/<área>/` e vídeos prontos em `VIDEOS-PRONTOS/AAAA-MM-DD/` (com a lista `PARA-APROVAR.md` do dia).
- **Progresso:** o escritório 3D mostra um anel sobre a cabeça do agente que está trabalhando.

---

## 7. Tarefas automáticas

O kit traz o modelo da tarefa "Gancho do dia" em `global/tarefas-agendadas/gancho-do-dia.md`. Ela prepara, todo dia, no horário que você escolher (ex.: 17:30), o gancho e o tema do vídeo do dia seguinte.

Para recriar:
1. Abra a sessão do Claude Code na pasta da Agência.
2. Peça: "Crie uma tarefa agendada todo dia no horário que você escolher (ex.: 17:30) com o texto do arquivo global/tarefas-agendadas/gancho-do-dia.md, trocando `<cliente>` por `<nome-da-pasta-do-cliente>`." (O Claude Code tem a função de tarefas agendadas.)
3. Para ver ou desligar: peça "liste minhas tarefas agendadas".
4. O Mac precisa estar **ligado** na hora. O envio no WhatsApp (opcional) exige Mac desbloqueado.

As tarefas dependem da sua agenda e do seu cliente; por isso o kit traz só o modelo, não as tarefas prontas.

---

## 8. Problemas comuns

| Problema | Causa | O que fazer |
|---|---|---|
| "Não foi possível programar o post" ao agendar o 46º | O Instagram só aceita **45 posts programados** ao mesmo tempo por conta | Programe até 45 e o resto quando liberar vaga. Com 3 a 4 posts por dia, 45 vagas cobrem uns 12 a 15 dias. Nunca apague um post programado só para abrir vaga sem a sua autorização. Confira sempre em instagram.com/scheduled_content antes |
| Reel publicado com qualidade ruim | Subiram a **versão leve** (feita só para prévia no celular) | Publique sempre o arquivo original (1080x1920). A versão leve é só para mandar ao celular. Trocar um post já publicado exige apagar e republicar: peça OK antes |
| Erro **429** na mineração do Instagram | Muitos pedidos seguidos | Pare, espere, leia as métricas direto na tela do Reel e use o yt-dlp só para triagem. Não tente contornar o limite do Instagram |
| Vídeo do iPhone fica estourado/lavado | Gravação em **HDR** | Converta para SDR antes de editar (o editor faz com `avconvert`). Os originais não são alterados |
| Vídeo do iPhone sai deitado/cortado | Rotação gravada só no arquivo | O editor confere a rotação real com `ffprobe` antes |
| O Claude usou o Chrome errado / não acha o Instagram | Outro Chrome conectado (ex.: de Windows) ou extensão sem login | Use só o Chrome do Mac, com a extensão logada e o Instagram aberto. Se não estiver conectado, o agente deve parar e avisar |
| `/mcp` mostra `metapilot-native` desconectado (ECONNREFUSED) | App **Edits fechado** | Abra o app Edits e abra uma sessão nova do Claude |
| Corte de podcast com fala cortada na metade | Tempos de palavras da transcrição adiantados até 0,3 s | Medir cada emenda pela onda do áudio, não só pelo texto |
| Pedido pela página do escritório não anda | Claude Code do Terminal sem login (ou sem crédito) | `claude auth login` no Terminal e tente de novo |
| Erros estranhos de instalação em HD externo (`._arquivo`) | O macOS cria arquivos `._` em discos externos | Guarde a Agência no disco interno, ou apague os `._*` |
| O cérebro não registra nada | Ganchos só valem em sessões novas | Feche e abra uma sessão nova do Claude Code. Teste: `python3 ~/.segundo-cerebro/cerebro.py indices` |
| Quer desligar o cérebro um instante | — | `export SEGUNDO_CEREBRO_OFF=1` antes de abrir o `claude` |
| Edição lenta demais | Renderizar em resolução maior que a necessária | Peça o modo rápido do editor e transcreva uma vez só |
| Mensagem "Credit balance is too low" em tarefa em segundo plano | O ambiente do app trouxe uma chave de API sem crédito | Faça login com `claude auth login` e use a assinatura, sem chave de API no ambiente |

---

## 9. O que NÃO vem no pacote (e por quê)

| Não vem | Por quê | O que deixa de funcionar sem isso / o que fazer |
|---|---|---|
| **Chaves, senhas, tokens** (ElevenLabs, WhatsApp, Edits, MiroFish/Zep, etc.) | Segurança. Cada pessoa usa as próprias | Crie as suas e coloque em `~/.maquina-4h/segredos.env` (modelo: `segredos.env.exemplo`). Sem elas: sem voz clonada, sem envio no WhatsApp, sem Edits |
| **Dados de clientes** (ficha, calendário, legendas, métricas, prints, vídeos) | Privacidade e direitos | Use `clientes/_modelo/` para cadastrar os seus |
| **Vídeos** (brutos, prontos, minerados) | Peso e direitos de terceiros | Cada pessoa grava/baixa os seus em `clientes/<nome>/videos-brutos/` |
| **Vídeo base e áudio base das frases** (`ferramentas/frase-0600/`) | Música com direitos autorais | Coloque o seu `video-base.mp4` e `audio-base.m4a` (música que você pode usar). Sem eles o gerador de frases não tem o áudio padrão |
| **Sons de efeito** da palestra (`ferramentas/palestra/sons/`) | Arquivo grande | Gere com `uv run --with numpy --with scipy python ferramentas/palestra/gerar_sons.py` |
| **MiroFish** (simulador do agente `oraculo`) | 1,4 GB e é projeto de terceiros | `cd ferramentas/mirofish && git clone https://github.com/666ghj/MiroFish.git repo && git -C repo checkout 7657031ac01184afe2cb220f5ee3545573b5e843` (commit testado, de 02/10/2026; não atualize sem revisar); crie o arquivo `repo/.env` a partir de `repo/.env.example` com as SUAS chaves (modelo de linguagem e Zep Cloud); leia o README do projeto; trate o código como não confiável (rode isolado). Sem ele, o `oraculo` faz só análise sem simulação |
| **Skill `editor-video` (EDIT IA PRO)** | Produto à parte: cada pessoa compra o seu | Sem ela, os editores de vídeo ficam sem o **portão de qualidade** e sem o ambiente `uv` pronto com Pillow. Alternativa: `uv` + `pip install pillow numpy` (ex.: `uv run --with pillow --with numpy python ferramentas/frase-0600/gerar.py ...`). Vários scripts chamam `uv run --directory ~/.claude/skills/editor-video`; sem a skill, rode-os com `--with` como no exemplo |
| **Skills `hyperframes`, `hyperframes-cli`, `hyperframes-registry`, `media-use`** | Terceiros | Sem elas não há vídeo por código (motion), legendas animadas por código nem biblioteca de blocos. A skill `motion-agencia` (nossa, já incluída) depende delas. Os comandos do kit usam `npx hyperframes@0.9.46` (versão testada, fixada de propósito; para trocar, teste antes) |
| **Skills `replica-*`, `reverse-any-video`, `style-sampling`, `synced`** | Terceiros/pacote comprado | Não são necessárias para a Agência; só se você as quiser |
| **Modelos 3D gerados de fotos** (TRELLIS) | Vêm de imagens pessoais | O escritório usa o boneco padrão por código. Só entram modelos CC0 (Kenney e Quaternius, licenças incluídas) |
| **Diário e preferências pessoais do cofre**, outros projetos | Privacidade | O cofre do kit traz só o conhecimento. O seu cérebro começa a registrar o seu próprio diário e as suas preferências |
| **Fontes pagas ou "trial"** | Direitos | Só vêm as Roboto (Apache 2.0). Para as artes use fontes de licença aberta (ex.: Google Fonts) |
| **Tarefas agendadas** | Dependem da sua conta e agenda | Recrie com a seção 7 |

---

## 10. Atualizar e desinstalar

- **Atualizar o kit:** baixe a versão nova e rode `bash instalar.sh` de novo (é repetível; não sobrescreve o seu cofre nem as suas chaves).
- **Desinstalar o cérebro:** apague `~/.segundo-cerebro`, remova as 3 linhas de `cerebro.py` em `~/.claude/settings.json` (há backups datados `settings.json.bak-*`) e o trecho "Segundo Cérebro" de `~/.claude/CLAUDE.md`. O cofre `~/Documents/Dream` é seu: guarde ou apague como quiser.

---

# PARTE B — Se você é o dono e vai usar em outro computador

Aqui está o passo a passo do **computador novo**. A parte pessoal (EDIT IA PRO e as suas preferências do cérebro) vem de um repositório **privado** da sua conta no GitHub; ninguém mais consegue baixar. O mesmo `instalar.sh` serve para os dois casos: ele reconhece sozinho que você é o dono.

1. **Instale o Claude Code e entre na MESMA conta.** Rode `claude auth login` com a mesma conta de sempre. Os conectores do claude.ai (Gmail, Drive, Calendário e outros) voltam sozinhos, sem configurar de novo.
2. **Entre no GitHub:** `gh auth login` (instale antes com `brew install gh`, se faltar). Siga as perguntas; escolha entrar pelo navegador.
3. **Baixe o kit e cole o texto do COMECE-AQUI.** `gh repo clone <seu-usuario>/<repositório-do-kit>`, abra a pasta no Claude Code (`cd` até ela e digite `claude`) e cole o texto do `COMECE-AQUI.md`.
4. **Responda "sim" à camada pessoal.** No fim do instalador aparece: "Instalar a sua camada pessoal (EDIT IA PRO e suas preferências)?". Com "sim", ele baixa a camada privada em `~/.agencia-dono`, copia as suas preferências para o cérebro (sem apagar nada que já exista) e pergunta antes de instalar o EDIT IA PRO, que leva de 15 a 25 minutos. Para instalar o EDIT IA PRO depois: `bash ~/.agencia-dono/instalar-dono.sh --com-editpro`. A licença do EDIT IA PRO vale só para os seus computadores: não repasse.
5. **Recoloque as chaves, que NÃO vão pelo GitHub.** Leve o arquivo `~/.maquina-4h/segredos.env` do computador antigo por **AirDrop** ou pelo **gerenciador de senhas** e coloque em `~/.maquina-4h/segredos.env` no novo (permissão 600: `chmod 600 ~/.maquina-4h/segredos.env`). Não mande por e-mail nem por chat.
6. **Recrie o MCP do Edits** (se usa o app Edits): instale e abra o app e rode `claude mcp add --transport http metapilot-native <URL_DO_SEU_EDITS> --header "Authorization: Bearer <SUA_CHAVE>"`, com a SUA chave. Confira com `/mcp` numa sessão nova.
7. **Reinstale a extensão Claude in Chrome** e entre no Instagram do cliente (você digita a senha; o Claude nunca pede).
8. **Dê as permissões do Mac** se for usar o WhatsApp e o Photoshop: Ajustes do Sistema > Privacidade e Segurança > **Acessibilidade** (para apertar Enter no WhatsApp) e **Automação** (para controlar o WhatsApp e o Photoshop), ligando o app que roda o Claude (Terminal ou o app do Claude).
9. **Abra o Obsidian** e escolha "Abrir pasta como cofre" em `~/Documents/Dream`. O cofre do computador novo começa só com o conhecimento do kit e as suas preferências: o diário e os registros de clientes ficam no computador antigo (se quiser levá-los, copie a pasta `~/Documents/Dream` por AirDrop ou disco externo).

**Conferir:** abra uma sessão nova do Claude Code e peça "liste os agentes da Agência" e "abra o escritório 3D" (`node escritorio/servidor.mjs`, depois `http://localhost:5173`). Se o cérebro estiver ativo, notas com 🧠 aparecem no começo da conversa.

**Atualizar depois:** rode `bash instalar.sh` de novo (ele atualiza a camada pessoal com `git pull` e não sobrescreve nada seu).

---

# COMEÇAR UM TRABALHO NOVO (vale para as duas partes)

1. **Crie a pasta do cliente:** `cp -R clientes/_modelo clientes/<nome-do-cliente>` (ou peça: "crie o cliente <nome> a partir do modelo"). Essa pasta fica só no seu computador e o `.gitignore` não deixa subir para o GitHub.
2. **Preencha o `PROJETO.md`** (a ficha do trabalho: o que é, para quem, objetivo, números reais). Peça: "me entreviste, uma pergunta por vez, para preencher o PROJETO.md".
3. **Preencha a ficha do cliente:** `clientes/<nome>/FICHA.md` e `GRADE-DIARIA.md`. Peça: "me entreviste para preencher a ficha e a grade do cliente <nome>".
4. **Primeiro pedido para cada agente** (cole no Claude, trocando `<nome>`):

| Agente | Primeiro pedido |
|---|---|
| gerente-geral | "Leia a ficha do cliente <nome> e monte o plano da primeira semana. Diga o que precisa da minha decisão." |
| especialista-instagram | "Crie a grade de conteúdo da semana em escada para <nome>, seguindo grade-de-conteudo.md." |
| social-media | "Audite o perfil de <nome> com perfil-que-converte.md e entregue um relatório." |
| especialista-ganchos | "Minere 10 ganchos virais para o tema do cliente <nome> e explique por que prendem." |
| especialista-frases | "Mine 5 frases virais do tipo que funciona no perfil de <nome> e gere os cartões." |
| editor-de-video | "Edite este vídeo bruto de <nome> no padrão da casa (gancho, headline, legenda de uma palavra, sem respiros)." |
| editor-viral-podcast / editor-de-palestras | "Escolha os melhores trechos deste podcast/palestra e monte o plano de edição." |
| web-designer | "Crie a arte de convite para o evento X no estilo das referências." |
| copywriter / vendedor | "Escreva 3 roteiros de 30 s com gancho e chamada para ação" / "Escreva a resposta para a objeção de preço." |
| gestor-de-trafego / analista / contador | "Planeje uma campanha local (só o plano)" / "Quais métricas acompanhar?" / "Calcule o preço mínimo e o ponto de equilíbrio." |
| oraculo / desenvolvedor / dev-seguranca / atendente | Veja a tabela da seção 5. |

5. **Lembre-se das regras:** nada vai ao ar sem o seu OK; não inventar números; perguntar quando faltar informação; **nada de cliente no kit** (dados de cliente ficam em `clientes/<nome>/` e `entregas/`, que não sobem ao GitHub).
