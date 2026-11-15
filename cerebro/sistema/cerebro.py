#!/usr/bin/env python3
"""Segundo Cérebro — integra o cofre do Obsidian a TODO trabalho feito no Claude Code e no Codex.

Ganchos (configurados em ~/.claude/settings.json e ~/.codex/hooks.json):
  inicio     (SessionStart)      → injeta preferências globais + lista de projetos do cofre
  buscar     (UserPromptSubmit)  → procura no cofre notas ligadas ao pedido e injeta no contexto
  registrar  (Stop)              → em segundo plano, um Claude "curador" registra o que foi aprendido
  indices                        → refaz os índices de cada pasta e o 00-INDICE (roda depois de registrar)

Desligar por um momento: export SEGUNDO_CEREBRO_OFF=1. Log: ~/.segundo-cerebro/registro.log
Só biblioteca padrão do Python.
"""
import datetime as dt
import fcntl
import hashlib
import json
import os
import re
import subprocess
import sys
import time
import unicodedata
from pathlib import Path

BASE = Path.home() / '.segundo-cerebro'
CONF = json.loads((BASE / 'config.json').read_text())
VAULT = Path(CONF['vault'])
LOG = BASE / 'registro.log'
PASTAS = {
    '01-Projetos': 'Projetos', '02-Padroes': 'Padrões', '03-Decisoes': 'Decisões', '04-Preferencias': 'Preferências',
    '05-Stack': 'Stack e ferramentas', '06-Aprendizados': 'Aprendizados', '07-Sessoes': 'Sessões',
}
STOP = set('a o e é de da do das dos em no na nos nas um uma uns umas que para pra pro por com sem se ao aos as os '
           'eu voce você ele ela isso esse essa este esta aqui ali la lá me te nos mais muito tudo todo toda faz fazer '
           'quero preciso agora tambem também tbm vc pode como qual quais onde quando ja já nao não sim ok vai ser '
           'the and of to in for is it on with this that'.split())


def log(msg):
    with open(LOG, 'a') as f:
        f.write(f'{dt.datetime.now():%Y-%m-%d %H:%M:%S} {msg}\n')


def desligado():
    return os.environ.get('SEGUNDO_CEREBRO_OFF') == '1'


def sem_acento(t):
    return ''.join(c for c in unicodedata.normalize('NFD', t.lower()) if unicodedata.category(c) != 'Mn')


def termos(texto):
    return [w for w in re.findall(r'[a-z0-9][a-z0-9_\-]{2,}', sem_acento(texto)) if w not in STOP]


def ler_nota(p):
    t = p.read_text(errors='ignore')
    meta, corpo = {}, t
    m = re.match(r'^---\n(.*?)\n---\n?(.*)$', t, re.S)
    if m:
        corpo = m.group(2)
        for ln in m.group(1).splitlines():
            if ':' in ln:
                k, v = ln.split(':', 1)
                meta[k.strip()] = v.strip().strip('"')
    return meta, corpo


def notas():
    for p in VAULT.rglob('*.md'):
        rel = p.relative_to(VAULT)
        if rel.parts[0].startswith('.') or p.name.startswith('_indice') or rel.parts[0] == '99-Sistema' \
                or p.name == '00-INDICE.md':
            continue
        yield p, rel


def entrada_hook():
    try:
        return json.loads(sys.stdin.read() or '{}')
    except Exception:
        return {}


def saida_contexto(evento, texto):
    print(json.dumps({'hookSpecificOutput': {'hookEventName': evento, 'additionalContext': texto}}, ensure_ascii=False))


def projeto_de(cwd):
    p = Path(cwd or os.getcwd())
    try:
        raiz = subprocess.run(['git', '-C', str(p), 'rev-parse', '--show-toplevel'], capture_output=True, text=True,
                              timeout=3).stdout.strip()
        if raiz:
            p = Path(raiz)
    except Exception:
        pass
    # sem git: sobe até a pasta que tem CLAUDE.md ou .claude/ (raiz do projeto)
    for q in [p, *p.parents]:
        if q == Path.home() or q == Path('/'):
            break
        if (q / 'CLAUDE.md').exists() or (q / '.claude').is_dir():
            return q.name, str(q)
    return p.name, str(p)


# ------------------------------------------------------------------ inicio / buscar
def inicio():
    if desligado():
        return
    d = entrada_hook()
    nome, _ = projeto_de(d.get('cwd'))
    prefs = []
    for p in sorted((VAULT / '04-Preferencias').glob('*.md')):
        if p.name.startswith('_'):
            continue
        meta, _ = ler_nota(p)
        prefs.append(f"- {p.stem}: {meta.get('resumo', '')}")
    projs = [p.stem for p in sorted((VAULT / '01-Projetos').glob('*.md')) if not p.name.startswith('_')]
    texto = (f'🧠 SEGUNDO CÉREBRO ativo (cofre Obsidian: {VAULT}). Projeto atual: {nome}.\n'
             'Preferências do usuário (valem em qualquer projeto):\n' + '\n'.join(prefs[:15]) +
             f"\nProjetos já registrados: {', '.join(projs[:30]) or 'nenhum ainda'}.\n"
             'A cada pedido, as notas relacionadas aparecem no contexto automaticamente: leia as úteis antes de agir. '
             'O registro do que foi aprendido é automático ao fim de cada execução (não precisa escrever no cofre).')
    saida_contexto('SessionStart', texto)


def buscar():
    if desligado():
        return
    d = entrada_hook()
    pedido = d.get('prompt') or d.get('user_prompt') or ''
    if len(pedido.strip()) < 12:
        return
    nome_proj, _ = projeto_de(d.get('cwd'))
    q = set(termos(pedido))
    if not q:
        return
    res = []
    for p, rel in notas():
        meta, corpo = ler_nota(p)
        titulo = set(termos(p.stem))
        cab = set(termos(' '.join([meta.get('resumo', ''), meta.get('tags', ''), meta.get('projetos', '')])))
        corpo_t = termos(corpo)
        freq = {}
        for w in corpo_t:
            freq[w] = freq.get(w, 0) + 1
        s = 4 * len(q & titulo) + 2 * len(q & cab) + sum(min(freq.get(w, 0), 3) for w in q) * 0.5
        if sem_acento(nome_proj) in sem_acento(meta.get('projetos', '') + p.stem):
            s += 1.5
        if rel.parts[0] == '07-Sessoes':
            s *= 0.6
        if s >= 3:
            res.append((s, p, rel, meta, corpo))
    if not res:
        return
    res.sort(key=lambda x: -x[0])
    log(f"buscou: {len(res[:7])} nota(s) para {nome_proj} · " + ', '.join(r[1].stem for r in res[:3]))
    linhas = ['🧠 SEGUNDO CÉREBRO — já existe conhecimento registrado ligado a este pedido (de qualquer projeto). '
              'Leia as notas úteis (Read no caminho) ANTES de começar e siga padrões, decisões e preferências delas:']
    for k, (s, p, rel, meta, corpo) in enumerate(res[:7]):
        linhas.append(f"- [{meta.get('tipo', rel.parts[0])}] {p.stem} — {meta.get('resumo', '')} ({p})")
        if k < 2:
            trecho = re.sub(r'\s+', ' ', corpo).strip()[:500]
            linhas.append(f'  trecho: {trecho}')
    saida_contexto('UserPromptSubmit', '\n'.join(linhas))


# ------------------------------------------------------------------ registrar
def textos(o):
    """Extrai textos de um item de transcrição (formato do Claude Code ou do Codex)."""
    if isinstance(o, str):
        return [o]
    if isinstance(o, list):
        r = []
        for x in o:
            r += textos(x)
        return r
    if isinstance(o, dict):
        if o.get('type') in ('text', 'input_text', 'output_text') and isinstance(o.get('text'), str):
            return [o['text']]
        if 'content' in o:
            return textos(o['content'])
    return []


def resumo_turno(transcript, ultima_msg=''):
    """Último pedido do usuário + o que o assistente disse e fez depois dele."""
    linhas = []
    try:
        with open(transcript, errors='ignore') as f:
            linhas = f.readlines()[-3000:]
    except Exception:
        pass
    eventos = []
    for ln in linhas:
        try:
            j = json.loads(ln)
        except Exception:
            continue
        msg = j.get('message') or j.get('payload') or j
        role = msg.get('role') or j.get('type')
        tipo = msg.get('type')
        if j.get('isSidechain') or j.get('isMeta'):
            continue
        cont = msg.get('content')
        if role == 'user':
            if isinstance(cont, list) and any(isinstance(c, dict) and c.get('type') == 'tool_result' for c in cont):
                continue
            t = ' '.join(textos(cont)).strip()
            if t and not t.startswith('<') and 'system-reminder' not in t[:40]:
                eventos.append(('user', t))
        elif role == 'assistant':
            if isinstance(cont, list):
                for c in cont:
                    if isinstance(c, dict) and c.get('type') == 'tool_use':
                        inp = c.get('input') or {}
                        arg = inp.get('file_path') or inp.get('command') or inp.get('description') or inp.get('url') or ''
                        eventos.append(('tool', f"{c.get('name')}: {str(arg)[:160]}"))
            t = ' '.join(textos(cont)).strip()
            if t:
                eventos.append(('assistant', t))
        elif tipo in ('function_call', 'local_shell_call', 'custom_tool_call'):  # Codex
            arg = msg.get('arguments') or msg.get('input') or msg.get('action') or ''
            eventos.append(('tool', f"{msg.get('name', tipo)}: {str(arg)[:160]}"))
    ini = max((k for k, (r, _) in enumerate(eventos) if r == 'user'), default=-1)
    if ini < 0:
        return None
    pedido = eventos[ini][1]
    depois = eventos[ini + 1:]
    tools = list(dict.fromkeys(t for r, t in depois if r == 'tool'))
    falas = [t for r, t in depois if r == 'assistant']
    if ultima_msg and (not falas or falas[-1] != ultima_msg):
        falas.append(ultima_msg)
    return {'pedido': pedido[:2500], 'ferramentas': tools[:80], 'falas': '\n---\n'.join(falas)[-7000:]}


def registrar():
    """Gancho Stop: decide rápido e dispara o curador em segundo plano (não atrasa a resposta)."""
    if desligado():
        return
    d = entrada_hook()
    if d.get('stop_hook_active'):
        return
    tr = d.get('transcript_path') or ''
    r = resumo_turno(tr, d.get('last_assistant_message') or '') if tr else None
    if not r:
        return
    mexeu = [t for t in r['ferramentas'] if re.match(r'(Write|Edit|MultiEdit|NotebookEdit|Bash|apply_patch|shell|'
                                                      r'exec_command|local_shell|Agent|Task|mcp__)', t)]
    if not mexeu and len(r['ferramentas']) < 2:
        return  # conversa sem execução: nada para registrar
    nome, raiz = projeto_de(d.get('cwd'))
    r.update(projeto=nome, pasta=raiz, quando=f'{dt.datetime.now():%Y-%m-%d %H:%M}',
             ferramenta='Codex' if '.codex' in tr else 'Claude Code', sessao=d.get('session_id', ''))
    chave = hashlib.sha1((r['sessao'] + r['pedido'] + str(len(r['ferramentas']))).encode()).hexdigest()[:16]
    if CONF.get('modo', 'sessao') == 'sessao':
        # A própria sessão (que conhece todo o contexto) registra antes de encerrar — não depende de outra conta.
        feito = BASE / 'registrados.txt'
        if feito.exists() and chave in feito.read_text():
            return
        with open(feito, 'a') as f:
            f.write(chave + '\n')
        dia = f'{dt.datetime.now():%Y-%m-%d}'
        log(f"pediu registro na sessão: {nome} ({r['ferramenta']})")
        print(json.dumps({'decision': 'block', 'reason': (
            f'🧠 Registro automático do Segundo Cérebro (não é pedido do usuário; é a rotina do sistema). '
            f'Registre agora, em silêncio, o que esta execução ensinou no cofre {VAULT}, seguindo as regras de '
            f'{VAULT}/99-Sistema/Como-funciona.md (seção "Regras do registro"): entrada em 07-Sessoes/{dia}.md; '
            f'linha no Histórico de 01-Projetos/{nome}.md (crie pelo modelo se não existir); e, só se houver '
            f'conhecimento durável, crie/atualize notas em 02-Padroes, 03-Decisoes, 04-Preferencias, 05-Stack, '
            f'06-Aprendizados (procure antes para não duplicar). Sem segredos nem dados pessoais. Depois rode '
            f'`python3 ~/.segundo-cerebro/cerebro.py indices`. Não repita a resposta ao usuário: termine só com '
            f'"🧠 registrado no segundo cérebro".')}, ensure_ascii=False))
        return
    fila = BASE / 'fila'
    fila.mkdir(exist_ok=True)
    arq = fila / f'{int(time.time())}-{chave}.json'
    if any(fila.glob(f'*-{chave}.json')):
        return
    arq.write_text(json.dumps(r, ensure_ascii=False))
    subprocess.Popen([sys.executable, __file__, 'trabalhar'], stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL,
                     stderr=subprocess.DEVNULL, start_new_session=True,
                     env={**os.environ, 'SEGUNDO_CEREBRO_OFF': '1'})


PROMPT_CURADOR = """Você é o CURADOR do Segundo Cérebro do usuário: um cofre do Obsidian em {vault}.
Abaixo está o resumo de uma execução que acabou de ser entregue ({ferramenta}, projeto "{projeto}", pasta {pasta}, {quando}).
Registre no cofre o que foi APRENDIDO, em português do Brasil, curto e útil para reaproveitar em trabalhos futuros de qualquer projeto.

Regras do cofre (siga à risca; leia {vault}/99-Sistema/Como-funciona.md se tiver dúvida):
1. SEMPRE: acrescente uma entrada em 07-Sessoes/{dia}.md (crie se não existir, com o modelo de 99-Sistema/Modelos/Sessao.md):
   "## {hora} · [[{projeto}]] · {ferramenta}" + 1 linha do pedido + 2–4 tópicos do que foi feito/decidido + links [[ ]] para as notas que você criar ou atualizar.
2. SEMPRE: garanta a nota 01-Projetos/{projeto}.md (modelo 99-Sistema/Modelos/Projeto.md) e acrescente 1 linha datada na seção "## Histórico". Atualize "Stack" e "Pasta" se aparecerem.
3. SÓ quando houver conhecimento durável, crie OU ATUALIZE (procure antes com Grep/Glob — prefira atualizar a duplicar):
   - 02-Padroes/   → jeitos de fazer que deram certo e devem ser repetidos (padrão visual, de código, de processo, de entrega)
   - 03-Decisoes/  → escolhas tomadas e o porquê (com data)
   - 04-Preferencias/ → gostos/regras do usuário que valem em qualquer projeto (como ele quer as coisas, o que ele não quer)
   - 05-Stack/     → ferramentas, bibliotecas, comandos, configurações e seus truques/limites
   - 06-Aprendizados/ → erros, causas e correções; o que evitar
   Cada nota: frontmatter com tipo (projeto|padrao|decisao|preferencia|stack|aprendizado|sessao), projetos: [nomes], tags: [..], criado, atualizado, resumo (1 linha). Título = nome do arquivo, claro e pesquisável. Corpo curto: contexto, o que fazer, exemplo, link [[{projeto}]].
4. Correções e pedidos explícitos do usuário ("não faça X", "sempre Y", "ficou ruim porque…") são o mais valioso: registre como Preferência ou Aprendizado.
5. NÃO invente nada que não esteja no resumo. NÃO copie senhas, tokens, chaves, e-mails, telefones ou dados pessoais. Não registre conversa trivial.
6. Não mexa em .obsidian/, 99-Sistema/ nem nos arquivos _indice.md (são refeitos sozinhos). Não apague notas.
Responda só "ok" no final.

RESUMO DA EXECUÇÃO
Pedido do usuário:
{pedido}

Ferramentas usadas (amostra):
{ferramentas}

O que o assistente disse/entregou:
{falas}
"""


def ambiente_limpo():
    """Sem as variáveis do app que abriu a sessão: o curador usa o login próprio do usuário."""
    env = {k: v for k, v in os.environ.items() if not k.startswith(('ANTHROPIC_', 'CLAUDE_CODE_', 'CODEX_'))}
    env['SEGUNDO_CEREBRO_OFF'] = '1'
    return env


def curador(prompt):
    """Roda o curador: Codex (login ChatGPT) por padrão; Claude Code se configurado ou se o Codex falhar."""
    ordem = [CONF.get('curador', 'codex')] + [c for c in ('codex', 'claude') if c != CONF.get('curador', 'codex')]
    p = None
    for c in ordem:
        if c == 'codex':
            cmd = [CONF.get('codex', 'codex'), 'exec', '--cd', str(VAULT), '--skip-git-repo-check',
                   '--sandbox', 'workspace-write', prompt]
        else:
            cmd = [CONF.get('claude', 'claude'), '-p', prompt, '--model', CONF.get('modelo', 'sonnet'),
                   '--allowedTools', 'Read,Write,Edit,Glob,Grep', '--permission-mode', 'acceptEdits',
                   '--add-dir', str(VAULT)]
        p = subprocess.run(cmd, cwd=str(VAULT), capture_output=True, text=True, timeout=900, env=ambiente_limpo(),
                           stdin=subprocess.DEVNULL)
        p.args = c
        if p.returncode == 0:
            return p
        log(f'curador {c} falhou rc={p.returncode}: {(p.stderr or p.stdout).strip()[-200:]}')
    return p


def trabalhar():
    os.environ['SEGUNDO_CEREBRO_OFF'] = '1'
    trava = open(BASE / '.trava', 'w')
    try:
        fcntl.flock(trava, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except BlockingIOError:
        return  # outro curador já está esvaziando a fila
    while True:
        itens = sorted((BASE / 'fila').glob('*.json'))
        if not itens:
            break
        arq = itens[0]
        try:
            r = json.loads(arq.read_text())
            agora = dt.datetime.now()
            prompt = PROMPT_CURADOR.format(vault=VAULT, dia=f'{agora:%Y-%m-%d}', hora=r['quando'][-5:],
                                           ferramentas='\n'.join(r['ferramentas']) or '-', **{k: v for k, v in r.items()
                                                                                                 if k != 'ferramentas'})
            t0 = time.time()
            p = curador(prompt)
            log(f"registrou {r['projeto']} ({r['ferramenta']}) via {p.args} em {time.time() - t0:.0f}s rc={p.returncode} "
                f"{(p.stdout or p.stderr).strip()[-120:]!r}")
        except Exception as e:
            log(f'erro {arq.name}: {e}')
        arq.rename(arq.with_suffix('.feito')) if arq.exists() else None
        indices()
    for f in (BASE / 'fila').glob('*.feito'):
        if time.time() - f.stat().st_mtime > 7 * 86400:
            f.unlink()


# ------------------------------------------------------------------ índices
def indices():
    geral = ['---', 'tipo: indice', f'atualizado: {dt.date.today()}', '---', '# 🧠 Segundo Cérebro — Índice geral', '',
             'Mapa de tudo que já foi feito e aprendido em qualquer projeto (Claude Code e Codex). '
             'Atualizado sozinho. Como funciona: [[Como-funciona]].', '']
    for pasta, nome in PASTAS.items():
        d = VAULT / pasta
        d.mkdir(exist_ok=True)
        itens = []
        for p in sorted(d.glob('*.md'), key=lambda x: x.stat().st_mtime, reverse=True):
            if p.name.startswith('_'):
                continue
            meta, _ = ler_nota(p)
            itens.append((p.stem, meta.get('resumo', ''), meta.get('projetos', ''), meta.get('atualizado', '')))
        corpo = [f'---\ntipo: indice\natualizado: {dt.date.today()}\n---', f'# {nome}', '',
                 f'{len(itens)} nota(s). Mais recentes primeiro.', '']
        corpo += [f'- [[{t}]] — {r}' + (f' · {pj}' if pj and pasta != '01-Projetos' else '') for t, r, pj, _ in itens]
        (d / f'_indice {nome}.md').write_text('\n'.join(corpo) + '\n')
        for old in d.glob('_indice*.md'):
            if old.name != f'_indice {nome}.md':
                old.unlink()
        geral.append(f'## [[_indice {nome}|{nome}]] ({len(itens)})')
        geral += [f'- [[{t}]] — {r}' for t, r, _, _ in itens[:(30 if pasta == '07-Sessoes' else 12)]][:12]
        geral.append('')
    (VAULT / '00-INDICE.md').write_text('\n'.join(geral))


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else ''
    try:
        {'inicio': inicio, 'buscar': buscar, 'registrar': registrar, 'trabalhar': trabalhar, 'indices': indices}[cmd]()
    except KeyError:
        print(__doc__)
    except Exception as e:  # um gancho nunca pode travar o trabalho
        log(f'falha em {cmd}: {e}')
