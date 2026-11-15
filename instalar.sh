#!/usr/bin/env bash
# Instalador da Agência IA Dream (macOS). Seguro e repetível: pode rodar de novo sem estragar nada.
# Uso:  bash instalar.sh            (pergunta antes de instalar programas)
#       bash instalar.sh --sim      (responde "sim" a tudo que é seguro)
#       bash instalar.sh --sem-brew (não tenta instalar programas, só confere e avisa)
#       bash instalar.sh --sem-cerebro (não mexe em ~/.claude, ~/.segundo-cerebro nem no cofre)
#       bash instalar.sh --sem-dono (pula a etapa "camada do dono")
#       bash instalar.sh --com-whisper (baixa o modelo de voz de ~470 MB; com --sim, é o único jeito de baixar sem perguntar)
# Nunca apaga nem sobrescreve o que você já tem: faz backup datado antes de mesclar configurações.
set -u

SIM=0; SEM_BREW=0; SEM_CEREBRO=0; COM_WHISPER=0; SEM_DONO=0; COM_EDITPRO=0
for a in "$@"; do
  case "$a" in
    --sim) SIM=1 ;;
    --sem-brew) SEM_BREW=1 ;;
    --sem-cerebro) SEM_CEREBRO=1 ;;
    --com-whisper) COM_WHISPER=1 ;;
    --sem-dono) SEM_DONO=1 ;;
    --com-editpro) COM_EDITPRO=1 ;;
    -h|--help) sed -n 2,9p "$0"; exit 0 ;;
    *) echo "Opção desconhecida: $a"; exit 2 ;;
  esac
done

KIT="$(cd "$(dirname "$0")" && pwd -P)"
DIA="$(date +%Y%m%d-%H%M%S)"
COFRE_PADRAO="$HOME/Documents/Dream"
FALTAM=()   # itens que a pessoa ainda precisa resolver à mão

ok()   { printf '  [ok] %s\n' "$*"; }
aviso(){ printf '  [!]  %s\n' "$*"; }
passo(){ printf '\n== %s\n' "$*"; }
confirma() {
  [ "$SIM" = 1 ] && return 0
  local r; read -r -p "  $1 [s/N] " r; [ "$r" = "s" ] || [ "$r" = "S" ] || [ "$r" = "sim" ]
}

echo "Agência IA Dream — instalador"
echo "Pasta do kit: $KIT"
echo "Sua pasta pessoal: $HOME"
[ "$(uname -s)" = "Darwin" ] || aviso "Este kit foi feito para macOS. Em outro sistema, algumas ferramentas (WhatsApp, Photoshop, notificações) não funcionam."

# ---------------------------------------------------------------- 1. Programas
passo "1/9 Programas necessários"
BREW=0
if command -v brew >/dev/null 2>&1; then BREW=1; ok "Homebrew encontrado"
else
  aviso "Homebrew não encontrado. Para instalar (site oficial https://brew.sh), cole no Terminal o comando que está na página e volte aqui."
  FALTAM+=("Instalar o Homebrew (https://brew.sh) e rodar este instalador de novo")
fi

instala_se_falta() {  # nome do comando | pacote brew | descrição
  local cmd="$1" pkg="$2" desc="$3"
  if command -v "$cmd" >/dev/null 2>&1; then ok "$desc ($cmd)"; return; fi
  if [ "$BREW" = 1 ] && [ "$SEM_BREW" = 0 ]; then
    if confirma "Falta $desc. Instalar com 'brew install $pkg'?"; then
      brew install "$pkg" >/dev/null 2>&1 && command -v "$cmd" >/dev/null 2>&1 && { ok "$desc instalado"; return; }
      aviso "Não consegui instalar $pkg automaticamente."
    fi
  fi
  aviso "Falta: $desc  ->  brew install $pkg"
  FALTAM+=("Instalar $desc: brew install $pkg")
}
instala_se_falta python3 python "Python 3"
instala_se_falta node node "Node.js (escritório 3D e ferramentas)"
instala_se_falta ffmpeg ffmpeg "ffmpeg (vídeo e áudio)"
instala_se_falta yt-dlp yt-dlp "yt-dlp (baixar vídeos de referência)"
instala_se_falta uv uv "uv (ambientes Python dos editores)"
instala_se_falta whisper-cli whisper-cpp "whisper-cpp (transcrição de voz)"
instala_se_falta gh gh "GitHub CLI (opcional)"

# Modelo de voz: passo à parte. Versão e hash fixos (fonte oficial: huggingface.co/ggerganov/whisper.cpp, commit abaixo).
WHISPER_COMMIT="5359861c739e955e79d9a303bcbc70fb988958b1"
WHISPER_SHA256="1be3a9b2063867b937e64e2ec7483364a79917e157fa98c5d94b5c1fffea987b"
MODELO_WHISPER="$HOME/.cache/whisper-cpp/ggml-small.bin"
if ls "$HOME"/.cache/whisper-cpp/ggml-*.bin >/dev/null 2>&1; then
  ok "Modelo de voz do whisper encontrado"
else
  QUER=0
  if [ "$COM_WHISPER" = 1 ]; then QUER=1
  elif [ "$SIM" = 0 ] && command -v curl >/dev/null 2>&1; then
    confirma "Baixar o modelo de voz do whisper (ggml-small.bin, cerca de 470 MB, de huggingface.co/ggerganov/whisper.cpp)?" && QUER=1
  fi
  if [ "$QUER" = 1 ]; then
    mkdir -p "$HOME/.cache/whisper-cpp"
    if curl -L --fail -o "$MODELO_WHISPER.parcial" "https://huggingface.co/ggerganov/whisper.cpp/resolve/$WHISPER_COMMIT/ggml-small.bin" 2>/dev/null \
       && [ "$(shasum -a 256 "$MODELO_WHISPER.parcial" | cut -d' ' -f1)" = "$WHISPER_SHA256" ]; then
      mv "$MODELO_WHISPER.parcial" "$MODELO_WHISPER"; ok "Modelo de voz baixado e conferido (SHA-256 ok) em $MODELO_WHISPER"
    else
      rm -f "$MODELO_WHISPER.parcial"; aviso "Download falhou ou o SHA-256 não bate; apaguei o arquivo."
      FALTAM+=("Baixar o modelo de voz: bash instalar.sh --com-whisper (ou veja MANUAL.md)")
    fi
  else
    FALTAM+=("Modelo de voz do whisper (~470 MB) NÃO baixado: rode  bash instalar.sh --com-whisper  quando quiser transcrever vídeos")
  fi
fi

if command -v claude >/dev/null 2>&1; then ok "Claude Code encontrado"
else aviso "Claude Code (comando 'claude') não encontrado."; FALTAM+=("Instalar o Claude Code (https://claude.com/claude-code) e fazer 'claude auth login'"); fi

# ---------------------------------------------------------------- 2. Caminho
passo "2/9 Ajustando os caminhos para esta pasta"
python3 - "$KIT" <<'PY'
import os, sys
kit = sys.argv[1]
marca = '__PASTA_AGENCIA__'
guarda = os.path.join(kit, '.caminho-instalado')
antigo = open(guarda).read().strip() if os.path.exists(guarda) else ''
trocas = [marca] + ([antigo] if antigo and antigo != kit else [])
n = 0
for raiz, ds, fs in os.walk(kit):
    ds[:] = [d for d in ds if d not in ('.git', 'node_modules', 'modelos')]
    for f in fs:
        if f == 'instalar.sh': continue
        p = os.path.join(raiz, f)
        try: t = open(p, encoding='utf-8').read()
        except Exception: continue
        o = t
        for x in trocas: t = t.replace(x, kit)
        if t != o:
            open(p, 'w', encoding='utf-8').write(t); n += 1
open(guarda, 'w').write(kit)
print(f"  [ok] caminho ajustado em {n} arquivo(s)")
PY
grep -q '.caminho-instalado' "$KIT/.gitignore" 2>/dev/null || echo ".caminho-instalado" >> "$KIT/.gitignore"
chmod +x "$KIT"/ferramentas/*.sh "$KIT"/ferramentas/*/*.sh 2>/dev/null
mkdir -p "$KIT/entregas" "$KIT/VIDEOS-PRONTOS"
ok "Pastas entregas/ e VIDEOS-PRONTOS/ prontas"

# ---------------------------------------------------------------- 3. Segredos
passo "3/9 Arquivo de chaves (vazio, só você preenche)"
mkdir -p "$HOME/.maquina-4h"
if [ -f "$HOME/.maquina-4h/segredos.env" ]; then ok "Já existe ~/.maquina-4h/segredos.env (não mexi)"
else
  cp "$KIT/segredos.env.exemplo" "$HOME/.maquina-4h/segredos.env" && chmod 600 "$HOME/.maquina-4h/segredos.env"
  ok "Criei ~/.maquina-4h/segredos.env (vazio, permissão 600). Preencha só o que for usar."
fi

# ---------------------------------------------------------------- 4. Cérebro
passo "4/9 Segundo cérebro (cofre + motor + ganchos)"
if [ "$SEM_CEREBRO" = 1 ]; then
  aviso "Pulado (--sem-cerebro)."
else
  COFRE="$COFRE_PADRAO"
  if [ ! -e "$COFRE" ]; then
    mkdir -p "$COFRE" && cp -R "$KIT/cerebro/cofre/." "$COFRE/" && ok "Cofre criado em $COFRE"
  else
    DEST="$HOME/Documents/Dream-kit-novo"
    if [ -e "$DEST" ]; then ok "Você já tem $COFRE e $DEST (não mexi em nenhum)"
    else
      mkdir -p "$DEST" && cp -R "$KIT/cerebro/cofre/." "$DEST/"
      aviso "Você JÁ TEM um cofre em $COFRE. Não sobrescrevi. Copiei o conteúdo do kit para $DEST — abra no Obsidian e mova as notas que quiser."
    fi
  fi
  mkdir -p "$HOME/.segundo-cerebro/fila"
  if [ -f "$HOME/.segundo-cerebro/cerebro.py" ] && ! cmp -s "$KIT/cerebro/sistema/cerebro.py" "$HOME/.segundo-cerebro/cerebro.py"; then
    cp "$HOME/.segundo-cerebro/cerebro.py" "$HOME/.segundo-cerebro/cerebro.py.bak-$DIA"
    aviso "Já existia um cerebro.py diferente; guardei cópia em ~/.segundo-cerebro/cerebro.py.bak-$DIA"
  fi
  cp "$KIT/cerebro/sistema/cerebro.py" "$HOME/.segundo-cerebro/cerebro.py"; ok "Motor instalado em ~/.segundo-cerebro/cerebro.py"
  if [ -f "$HOME/.segundo-cerebro/config.json" ]; then ok "config.json já existe (não mexi)"
  else
    CL="$(command -v claude 2>/dev/null || echo claude)"
    python3 - "$KIT/cerebro/sistema/config.exemplo.json" "$HOME/.segundo-cerebro/config.json" "$COFRE" "$CL" <<'PY'
import sys, json
ex, dest, cofre, cl = sys.argv[1:5]
c = json.load(open(ex)); c['vault'] = cofre; c['claude'] = cl
json.dump(c, open(dest, 'w'), indent=2, ensure_ascii=False)
PY
    ok "config.json criado"
  fi

  # mescla os ganchos em ~/.claude/settings.json
  mkdir -p "$HOME/.claude"
  python3 - "$KIT/global/hooks-cerebro.json" "$HOME/.claude/settings.json" "$DIA" <<'PY'
import sys, json, os, shutil
novo = json.load(open(sys.argv[1]))['hooks']
dest, dia = sys.argv[2], sys.argv[3]
cfg = {}
if os.path.exists(dest):
    shutil.copy(dest, f"{dest}.bak-{dia}")
    try: cfg = json.load(open(dest))
    except Exception:
        print(f"  [!]  {dest} não é um JSON válido; não mexi. Corrija e rode de novo."); sys.exit(0)
hooks = cfg.setdefault('hooks', {})
add = 0
for ev, grupos in novo.items():
    atuais = hooks.setdefault(ev, [])
    ja = [h.get('command', '') for grp in atuais for h in grp.get('hooks', [])]
    for g in grupos:
        cmd = g['hooks'][0]['command']
        if cmd in ja: continue
        atuais.append(g); add += 1
json.dump(cfg, open(dest, 'w'), indent=2, ensure_ascii=False)
print(f"  [ok] ganchos do cérebro: {add} adicionado(s) (backup: settings.json.bak-{dia})" if add else "  [ok] ganchos do cérebro já estavam instalados")
PY
  # trecho no CLAUDE.md global
  if [ -f "$HOME/.claude/CLAUDE.md" ] && grep -q 'Segundo Cérebro (vale em todos os projetos)' "$HOME/.claude/CLAUDE.md"; then
    ok "~/.claude/CLAUDE.md já tem o trecho do cérebro"
  else
    [ -f "$HOME/.claude/CLAUDE.md" ] && cp "$HOME/.claude/CLAUDE.md" "$HOME/.claude/CLAUDE.md.bak-$DIA"
    { [ -f "$HOME/.claude/CLAUDE.md" ] && echo; cat "$KIT/global/CLAUDE-cerebro.md"; } >> "$HOME/.claude/CLAUDE.md"
    ok "Trecho do cérebro acrescentado a ~/.claude/CLAUDE.md"
  fi
  python3 "$HOME/.segundo-cerebro/cerebro.py" indices >/dev/null 2>&1 && ok "Índices do cofre refeitos" || aviso "Não consegui refazer os índices (teste: python3 ~/.segundo-cerebro/cerebro.py indices)"
fi

# ---------------------------------------------------------------- 5. Skill
passo "5/9 Skill de motion da Agência"
if [ "$SEM_CEREBRO" = 1 ]; then aviso "Pulado (--sem-cerebro)."
else
  mkdir -p "$HOME/.claude/skills"
  if [ -e "$HOME/.claude/skills/motion-agencia" ]; then ok "motion-agencia já instalada (não mexi)"
  else cp -R "$KIT/global/skills/motion-agencia" "$HOME/.claude/skills/" && ok "motion-agencia instalada em ~/.claude/skills/"; fi
fi

# ---------------------------------------------------------------- 6. Dependências de terceiros
passo "6/9 Skills de terceiros (você instala na fonte original)"
for s in editor-video hyperframes media-use; do
  if [ -d "$HOME/.claude/skills/$s" ]; then ok "skill $s encontrada"
  else aviso "skill $s NÃO encontrada (veja MANUAL.md, seção 'O que não vem no pacote')"; fi
done

# ---------------------------------------------------------------- 7. Escritório
passo "7/9 Escritório 3D"
if command -v node >/dev/null 2>&1; then ok "Para abrir: cd \"$KIT\" && node escritorio/servidor.mjs  (depois http://localhost:5173)"
else aviso "Instale o Node.js para abrir o escritório."; fi

# ---------------------------------------------------------------- 8. Camada do dono (opcional)
passo "8/9 Camada do dono (opcional)"
DONO_DIR="$HOME/.agencia-dono"
DONO_OK=0; DONO_FONTE=""
if [ "$SEM_DONO" = 1 ]; then
  aviso "Pulado (--sem-dono)."
else
  if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
    GH_USER="$(gh api user -q .login 2>/dev/null)"
    if [ -n "$GH_USER" ] && gh repo view "$GH_USER/agencia-ia-dream-dono" >/dev/null 2>&1; then DONO_OK=1; DONO_FONTE="$GH_USER/agencia-ia-dream-dono"; fi
  fi
  if [ "$DONO_OK" = 1 ]; then
    if confirma "Instalar a sua camada pessoal (EDIT IA PRO e suas preferências)?"; then
      if [ -d "$DONO_DIR/.git" ]; then
        git -C "$DONO_DIR" pull --ff-only >/dev/null 2>&1 && ok "Camada pessoal atualizada em $DONO_DIR" || aviso "Não consegui atualizar $DONO_DIR (segui com a cópia que já existe)."
      else
        gh repo clone "$DONO_FONTE" "$DONO_DIR" >/dev/null 2>&1 && ok "Camada pessoal baixada em $DONO_DIR" || aviso "Não consegui baixar a camada pessoal."
      fi
      if [ -f "$DONO_DIR/instalar-dono.sh" ]; then
        EXTRA=""; [ "$SIM" = 1 ] && EXTRA="$EXTRA --sim"; [ "$COM_EDITPRO" = 1 ] && EXTRA="$EXTRA --com-editpro"
        bash "$DONO_DIR/instalar-dono.sh" $EXTRA
      fi
    else
      aviso "Camada pessoal não instalada (você pode rodar depois: bash instalar.sh)."
    fi
  fi
fi
if [ "$DONO_OK" = 0 ] && [ ! -d "$HOME/.claude/skills/editor-video" ] && [ "$SEM_DONO" = 0 ]; then
  echo "  EDIT IA PRO é um produto à parte: cada pessoa compra o seu; sem ele os editores de vídeo ficam sem o portão de qualidade e sem o ambiente de edição (alternativa: uv + Pillow, no manual)."
fi

if [ ! -d "$HOME/.claude/skills/editor-video" ]; then
  FALTAM+=("Skill editor-video (EDIT IA PRO): comprar/instalar na fonte original. Sem ela os editores de vídeo ficam sem o portão de qualidade; alternativa: uv + pillow (MANUAL.md)")
fi

# ---------------------------------------------------------------- 9. Checklist
passo "9/9 O que ainda falta fazer à mão"
cat <<EOF
  1. Entrar no Claude Code:            claude auth login
  2. Abrir o Claude Code NESTA pasta:  cd "$KIT" && claude
  3. Instagram: instalar a extensão "Claude in Chrome" no Chrome e entrar no Instagram do SEU cliente.
  4. Cortes de podcast (opcional): instalar o app Edits e conectar o MCP com a SUA chave:
         claude mcp add --transport http metapilot-native <URL_DO_SEU_EDITS> --header "Authorization: Bearer <SUA_CHAVE>"
     (a URL e a chave aparecem nas configurações do app Edits; veja MANUAL.md)
  5. Voz (opcional): chave da ElevenLabs em ~/.maquina-4h/segredos.env (ELEVENLABS_API_KEY e ELEVENLABS_VOICE_ID).
  6. WhatsApp (opcional): app WhatsApp do Mac + WHATSAPP_PARA no segredos.env + permissão de Acessibilidade
     (Ajustes do Sistema > Privacidade e Segurança > Acessibilidade).
  7. Photoshop (opcional): necessário só para as artes de evento e telão.
  8. Obsidian (opcional): abrir a pasta ~/Documents/Dream como cofre.
  9. Preencher PROJETO.md e criar seu cliente: cp -R clientes/_modelo clientes/<nome>
 10. Recriar as tarefas agendadas (MANUAL.md, seção 7).
EOF
if [ ${#FALTAM[@]} -gt 0 ]; then
  echo; echo "  Pendências encontradas por este instalador:"
  for f in "${FALTAM[@]}"; do echo "   - $f"; done
fi
echo
echo "  AVISO: depois de instalar, esta pasta tem o SEU caminho nos textos. Não faça commit dela; se quiser guardar alterações suas, use uma cópia."
echo "Pronto. Nada foi publicado e nenhuma chave foi enviada a lugar nenhum."
