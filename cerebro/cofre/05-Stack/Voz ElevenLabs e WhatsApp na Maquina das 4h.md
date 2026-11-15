---
tipo: stack
projetos: [Agencia IA Dream]
tags: [elevenlabs, whatsapp, automacao, seguranca]
criado: 2026-11-12
resumo: Scripts da Máquina das 4:00 para voz clonada do Cliente Exemplo (ElevenLabs, só roteiro aprovado) e envio do vídeo como documento no WhatsApp (Cloud API); chaves só em ~/.maquina-4h/segredos.env
---
# Voz ElevenLabs e WhatsApp (Máquina das 4:00)
- `ferramentas/voz-elevenlabs.mjs`: sem `--confirmar` só conta caracteres; limite 1.500; registra uso em `~/.maquina-4h/uso-voz.log`.
- `ferramentas/whatsapp-enviar.mjs`: sobe o mp4 e manda como documento; fora da janela de 24 h usa modelo aprovado (cabeçalho Documento).
- Chaves SÓ no arquivo `~/.maquina-4h/segredos.env` (chmod 600), digitadas pelo CEO; o agente nunca digita nem imprime chaves. Guia: `entregas/projetos/maquina-4h/CONFIGURAR-VOZ-E-WHATSAPP.md`.
- Voz clonada não pode ser usada fora do ElevenLabs sem gastar crédito lá; economizar gerando só o roteiro final aprovado.

Projetos: [[Agencia IA Dream]]

- Voice ID não é segredo (pode ser gravado pelo agente); API key e token do WhatsApp NÃO: o CEO insere pelo Terminal com `read -s` para nunca passarem pelo chat nem pelo agente.

- 12/11: chave de API pode vir restrita por permissões; teste de validade sem gastar crédito pode dar 401 (voices_read). Ao criar a chave, marcar Text to Speech.

- Resolvido 12/11: em elevenlabs.io/app/developers/api-keys → ⋯ → Edit, Restrict Key ligado; marcar Text to Speech (Access) e Voices (Read). Depois o GET /v1/voices/<id> funciona sem gastar crédito.

- 13/11: endpoint de alinhamento por letra `POST /v1/forced-alignment` (multipart `file` + `text`) exige a permissão **Forced Alignment** na chave (a chave "Cliente Exemplo voz" só tem Text to Speech + Voices Read). Ligar a permissão = mudança de config da conta → só o CEO (ou com OK explícito); o classificador bloqueou o clique do agente. Custo de créditos do alinhamento não verificado.

- 13/11 RESOLVIDO: com OK explícito do CEO ("permito usar o ElevenLabs") a permissão Forced Alignment foi ligada na chave "Cliente Exemplo voz" e `POST /v1/forced-alignment` (multipart `file` + `text`; texto sem alterações do que foi falado) devolveu `characters[{text,start,end}]` e `words[...]` com `loss`. Úteis para lip-sync por visemas, legendas e cortes por palavra. Sem custo observado informado; permissões atuais da chave: Text to Speech, Voices Read, Forced Alignment.

- 13/11: Image & Video › Lip sync no site: Avatar (upload ou "Select avatar"; no histórico de imagens, ⋮ → Lip sync usa a imagem) + Speech (Upload audio / Text to Speech); modelos vistos: "Sync 3" e "HeyGen Avatar 4". Custo mostrado no tooltip do botão de envio ANTES de gerar (ex.: Sync 3, áudio 0:36, 2 gerações = 58.483 créditos; plano atual com 0 vídeos restantes). Falha do provedor não é cobrada. Para enviar arquivos pelo Chrome, copiar para pasta do projeto (file_upload só lê pastas da sessão).

- 13/11 CUSTO do Lip sync (Image & Video): créditos POR SEGUNDO de áudio — HeyGen Avatar 4 606; Veed Fabric 606; Creatify Aurora 424; Sync Lipsync 2 Pro 505; Sync 3 806; MiniMax H3 Max 1.515. Custo = créditos/s × duração (36,28 s ⇒ HeyGen ≈ 22k, Aurora ≈ 15,4k). Plano do CEO: Creator US$22/mês, 121.002 créditos/mês, renova em 3/dez (conferir saldo em /app/subscription antes de gastar). Cada geração extra multiplica o custo (o contador "N gerações" do compositor).
