# Manual de mineração de conteúdo viral

Usado pelo `especialista-instagram` (o minerador). Os critérios mínimos podem mudar por cliente — **a grade do cliente manda** (ex.: `clientes/cliente-exemplo/GRADE-DIARIA.md`).

## 1. O que é "viral validado" (padrão definido pelo CEO)
Um post só entra no banco se tiver, **ao mesmo tempo**:

| Métrica | Mínimo |
|---|---|
| Visualizações | **≥ 1.000.000** |
| Comentários | **≥ 5.000** |
| Compartilhamentos (envios) | **≥ 130.000** |

Se o post não mostra alguma métrica (o criador pode esconder curtidas/compartilhamentos), ele **não está validado** — registrar como "sem métrica completa" e não usar sem o OK do CEO.

## 2. Onde procurar
- **Instagram (navegador logado, só leitura):** busca por palavras-chave e hashtags ([hashtags do nicho do cliente], #motivação, #empreendedorismo…), aba Reels de perfis grandes do nicho, Explorar, áudios em alta.
- Perfis de referência para começar: perfis do nicho do cliente com milhões de seguidores; "Contas parecidas" no perfil do cliente.
- TikTok e YouTube Shorts: só como fonte de **ideia** — a métrica que vale é a da plataforma onde o vídeo está.

## 3. Como conferir as métricas (sem tocar em nada)
- **Visualizações:** número sobre o vídeo na grade de Reels do perfil ou na página do Reel.
- **Curtidas, comentários, repostagens e compartilhamentos:** na página do Reel, na coluna de ações (curtir · comentar · repostar · compartilhar), nessa ordem.
- Anotar a **data da conferência** (os números mudam).
- Nunca curtir, seguir, comentar ou salvar com a conta do cliente durante a mineração.

## 4. Filtro de qualidade (além das métricas)
- Combina com a mensagem do cliente? (use os pilares da `FICHA.md`: [pilar 1 · pilar 2 · pilar 3].)
- É **positiva e construtiva**? Nada de polêmica política, ataque pessoal, promessa de riqueza, "prosperidade garantida" ou conteúdo que o CEO não aprovaria.
- A frase é **curta** (cabe em 1 tela, lida em ~3 s) e **forte** (uma ideia, uma virada)?
- Português correto (corrigir erros de digitação da original ao reescrever).
- Versículo: conferir a referência (livro, capítulo, versículo) e a tradução.

## 5. Direitos e ética
- **Frases:** versículos e ditados populares são de uso livre; frase autoral de outra pessoa → creditar o autor ou reescrever com palavras próprias mantendo a ideia.
- **Vídeos para react (tela dividida):** usar trecho curto, com crédito ao criador na tela e na legenda, e com reação que acrescenta comentário real. Se o criador pedir remoção, remover. Música do vídeo original pode gerar bloqueio de áudio.
- Nunca baixar conteúdo de fontes duvidosas; nunca apresentar conteúdo de terceiros como se fosse do cliente.

## 6. Como registrar
`entregas/clientes/<cliente>/mineracao/banco-de-frases.csv`:
```
data_conferencia,frase,autor_ou_referencia,link_original,views,comentarios,compartilhamentos,tema,horario_sugerido(06h/18h),status(estoque/usada/reprovada)
```
`entregas/clientes/<cliente>/mineracao/banco-de-videos-react.csv`:
```
data_conferencia,link,criador,views,comentarios,compartilhamentos,tema,trecho_inicio,trecho_fim,ideia_de_reacao,status
```

## 7. Entrega diária
Até a véspera: as frases, o vídeo do react e o que mais a grade do cliente pedir ([horário 1], [horário 2]…) (com ideia de reação), cada um com link e métricas. O CEO aprova antes de montar.
