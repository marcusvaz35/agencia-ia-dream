# Agência IA Dream — comece aqui (1 página)

## O que é
Uma "empresa" de 18 agentes de IA que trabalham dentro do Claude Code, no seu Mac: gerente, especialista em Instagram, editores de vídeo, designer, copywriter, gestor de tráfego, vendedor, analista e outros. Junto vêm o **conhecimento** (como minerar posts virais, montar grade de conteúdo, editar cortes de podcast, etc.), as **ferramentas** (scripts de vídeo, voz e WhatsApp), um **escritório 3D** onde você vê os agentes trabalhando e um **segundo cérebro** (um cofre de notas que a IA lê e atualiza sozinha).

Você é o "CEO": dá a ideia e aprova. **Nada vai ao ar sem o seu OK.**

> Este pacote traz só o MÉTODO. Não traz chaves, contas, clientes, vídeos nem músicas de ninguém. Você usa as SUAS contas e as SUAS chaves.

## Como instalar (3 minutos de trabalho seu)

*Você recebeu o kit de outra pessoa (Parte A do manual) ou é o dono usando em outro computador (Parte B)? O texto abaixo é o mesmo para os dois; o instalador reconhece o dono sozinho e só pergunta pela camada pessoal a ele.*
1. Tenha o **Claude Code** instalado e logado (assinatura própria do Claude).
2. Baixe este repositório (botão verde "Code" > "Download ZIP", ou `git clone`) e abra a pasta no Claude Code (Terminal: `cd` até a pasta e digite `claude`).
3. Cole exatamente este texto no Claude:

```
Leia o arquivo INSTALAR.md desta pasta e instale tudo para mim, passo a passo. Pergunte antes de instalar qualquer programa ou mexer em configurações. No final, me diga em português simples o que ficou pronto e o que ainda preciso fazer à mão.
```

4. Responda às perguntas dele. Se preferir fazer sozinho: `bash instalar.sh` (e leia o `MANUAL.md`).

> **Atenção:** depois de instalar, esta pasta tem o SEU caminho nos textos. Não faça commit dela; se quiser guardar alterações suas, use uma cópia.

Guia completo, para leigos: **MANUAL.md**.

## Se você é o dono e está num computador novo
Faça antes: instalar o Claude Code e entrar na MESMA conta (`claude auth login`), e entrar no GitHub (`gh auth login`). Depois siga os passos acima e responda **sim** à pergunta "Instalar a sua camada pessoal?". As chaves (`~/.maquina-4h/segredos.env`) você leva por AirDrop ou gerenciador de senhas: elas não vão pelo GitHub. O passo a passo completo está na **Parte B do MANUAL.md**.

## Começar um trabalho novo
Crie `clientes/<nome>/` a partir de `clientes/_modelo`, preencha o `PROJETO.md` e a ficha, e faça o primeiro pedido ao gerente-geral. Detalhes no final do **MANUAL.md**. Regra: nenhum dado de cliente vai para o kit.
