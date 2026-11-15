// Servidor local do Escritório 3D.
// Lê os agentes de .claude/agents a cada carregamento da página,
// então qualquer agente novo ou editado aparece ao recarregar.
// Uso: node escritorio/servidor.mjs   →   http://localhost:5173
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, '..');
const PORTA = Number(process.env.PORT) || 5173;

const visivel = (nome) => !nome.startsWith('.'); // ignora ._arquivos do macOS e ocultos

function lerAgentes() {
  const dir = path.join(RAIZ, '.claude', 'agents');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith('.md') && visivel(f))
    .sort()
    .map((f) => {
      const txt = fs.readFileSync(path.join(dir, f), 'utf8').replace(/\r\n/g, '\n');
      const m = txt.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
      const fm = {};
      let corpo = txt;
      if (m) {
        for (const linha of m[1].split('\n')) {
          const i = linha.indexOf(':');
          if (i > 0) fm[linha.slice(0, i).trim()] = linha.slice(i + 1).trim();
        }
        corpo = m[2].trim();
      }
      return {
        arquivo: `.claude/agents/${f}`,
        slug: fm.name || f.replace(/\.md$/, ''),
        descricao: fm.description || '',
        ferramentas: fm.tools || 'todas',
        corpo,
      };
    });
}

function contarArquivos(dir) {
  if (!fs.existsSync(dir)) return 0;
  let n = 0;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!visivel(e.name)) continue;
    n += e.isDirectory() ? contarArquivos(path.join(dir, e.name)) : 1;
  }
  return n;
}

function camposAPreencher() {
  try {
    const t = fs.readFileSync(path.join(RAIZ, 'PROJETO.md'), 'utf8');
    return (t.match(/\[A PREENCHER/g) || []).length;
  } catch {
    return null;
  }
}

function dadosJs() {
  const dados = {
    agentes: lerAgentes(),
    camposAPreencher: camposAPreencher(),
    entregas: contarArquivos(path.join(RAIZ, 'entregas')),
    geradoEm: new Date().toISOString(),
  };
  return `window.DADOS_ESCRITORIO = ${JSON.stringify(dados)};\n`;
}

// ---------- Status ao vivo (vem dos ganchos em .claude/settings.json) ----------
const ARQ_EVENTOS = process.env.EVENTOS_ARQ || path.join(AQUI, 'eventos.jsonl'); // EVENTOS_ARQ: só para testes
const GERENTE = 'gerente-geral';

function lerEventos() {
  if (!fs.existsSync(ARQ_EVENTOS)) return null;
  let linhas = fs.readFileSync(ARQ_EVENTOS, 'utf8').split('\n').filter(Boolean);
  if (linhas.length > 3000) { // não deixa o arquivo crescer para sempre
    linhas = linhas.slice(-1500);
    fs.writeFileSync(ARQ_EVENTOS, linhas.join('\n') + '\n');
  }
  return linhas.map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
}

// ---- Progresso: duração esperada a partir das execuções passadas ----
const DUR_PADRAO = { [GERENTE]: 5 * 60 * 1000, _outros: 10 * 60 * 1000 }; // sem histórico (ESTIMATIVA)
const MAX_TAREFA = 2 * 60 * 60 * 1000; // sem "terminou" depois de 2 h = evento velho, descarta
const MIN_TAREFA = 5 * 1000;           // menos de 5 s não é uma execução de verdade
function mediana(v) { const s = [...v].sort((a, b) => a - b), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; }
function duracaoEsperada(slug, hist) {
  let v = (hist[slug] || []).slice(-20);
  if (v.length >= 2) { // tira outliers: muito mais longas ou curtas que a mediana
    const m = mediana(v);
    const f = v.filter((x) => x <= m * 3 && x >= m / 5);
    if (f.length) v = f;
  }
  if (v.length) return { ms: Math.round(mediana(v)), amostras: v.length, fonte: 'historico' };
  return { ms: slug === GERENTE ? DUR_PADRAO[GERENTE] : DUR_PADRAO._outros, amostras: 0, fonte: 'padrao' };
}

function estado() {
  const eventos = lerEventos();
  if (!eventos) return { conectado: false, agentes: {}, feed: [], concluidasHoje: 0 };
  const agentes = {};       // slug -> { status, desde, tarefa, inicio, progresso, fim }
  const tarefaPedida = {};  // slug -> última descrição pedida
  const agenteDoId = {};    // agent_id -> slug
  const hist = {};          // slug -> durações (ms) de execuções passadas
  const feed = [];
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  let concluidasHoje = 0;
  // novoTrabalho: reinicia o relógio e o progresso (nova tarefa)
  const marcar = (slug, status, t, tarefa, novoTrabalho) => {
    const ant = agentes[slug] || {};
    const a = { status, desde: t, tarefa: tarefa ?? ant.tarefa ?? '', inicio: ant.inicio ?? null, progresso: ant.progresso ?? null, fim: ant.fim ?? null, iniciou: ant.iniciou || false };
    if (status === 'trabalhando' && (novoTrabalho || ant.status !== 'trabalhando')) { a.inicio = t; a.progresso = null; a.fim = null; a.iniciou = false; }
    if (status === 'concluido') {
      a.fim = t;
      if (ant.status === 'trabalhando' && ant.inicio != null) { // par início → fim entra no histórico
        const d = t - ant.inicio;
        if (d >= MIN_TAREFA && d <= MAX_TAREFA) (hist[slug] ||= []).push(d);
      }
    }
    agentes[slug] = a;
  };

  for (const e of eventos) {
    switch (e.ev) {
      case 'UserPromptSubmit':
        marcar(GERENTE, 'trabalhando', e.t, e.desc, true);
        feed.push({ t: e.t, agente: GERENTE, texto: `Recebeu um pedido: “${e.desc}”` });
        break;
      case 'Stop':
        if (agentes[GERENTE]?.status === 'trabalhando') {
          marcar(GERENTE, 'concluido', e.t);
          feed.push({ t: e.t, agente: GERENTE, texto: 'Respondeu ao CEO' });
        }
        break;
      case 'PreToolUse':
        if (!e.agente) break;
        tarefaPedida[e.agente] = e.desc;
        // se o agente já estava numa tarefa que começou de fato, esta é uma NOVA tarefa: reinicia o anel
        marcar(e.agente, 'trabalhando', e.t, e.desc, agentes[e.agente]?.status === 'trabalhando' && agentes[e.agente]?.iniciou);
        feed.push({ t: e.t, agente: GERENTE, para: e.agente, texto: `Passou uma tarefa: “${e.desc}”` });
        break;
      case 'VideoPronto':
        marcar('editor-de-video', 'concluido', e.t, `Vídeo pronto: ${e.desc}`);
        feed.push({ t: e.t, agente: 'editor-de-video', texto: `🎬 Vídeo pronto para aprovar: ${e.desc} (VIDEOS-PRONTOS)` });
        break;
      case 'SubagentStart':
        if (e.id && e.agente) agenteDoId[e.id] = e.agente;
        if (e.agente) {
          const novo = agentes[e.agente]?.status === 'trabalhando' && agentes[e.agente]?.iniciou;
          marcar(e.agente, 'trabalhando', e.t, tarefaPedida[e.agente], novo);
          agentes[e.agente].iniciou = true;
        }
        break;
      case 'SubagentStop': {
        let slug = e.agente || agenteDoId[e.id];
        if (!slug) { // sem nome no evento: fecha o trabalho mais antigo em aberto
          const abertos = Object.entries(agentes).filter(([s, a]) => s !== GERENTE && a.status === 'trabalhando').sort((a, b) => a[1].desde - b[1].desde);
          slug = abertos[0]?.[0];
        }
        if (!slug) break;
        marcar(slug, 'concluido', e.t); // "terminou" sem "início": inicio fica nulo e a página não mostra anel
        if (e.t >= hoje.getTime()) concluidasHoje++;
        feed.push({ t: e.t, agente: slug, texto: `Terminou: “${agentes[slug].tarefa || 'tarefa'}”` });
        break;
      }
      case 'Progresso': { // vem de escritorio/progresso.mjs (PROGRESSO REAL por etapas)
        if (!e.agente) break;
        const ant = agentes[e.agente];
        // relatório de etapa de quem não estava trabalhando começa o trabalho; logo após "terminou" (3 s) é ignorado
        if (ant?.status === 'concluido' && e.t - ant.fim < 3000) break;
        if (!ant || ant.status !== 'trabalhando') marcar(e.agente, 'trabalhando', e.t, tarefaPedida[e.agente]);
        agentes[e.agente].progresso = { feito: e.feito ?? null, total: e.total ?? null, pct: Math.max(0, Math.min(100, Number(e.pct) || 0)), etapa: e.etapa || '', atualizadoEm: e.t };
        break;
      }
    }
  }
  const agora = Date.now();
  for (const [slug, a] of Object.entries(agentes)) {
    if (a.status === 'trabalhando' && agora - a.inicio > MAX_TAREFA) { // evento velho sem "terminou": zera
      a.status = 'parado'; a.inicio = null; a.progresso = null; a.fim = null;
    }
    delete a.iniciou;
    a.esperadoMs = null;
    if (a.status === 'trabalhando') {
      const d = duracaoEsperada(slug, hist);
      a.esperadoMs = d.ms; a.amostras = d.amostras; a.fonteEsperado = d.fonte;
    }
  }
  return { conectado: true, agentes, feed: feed.slice(-40).reverse(), concluidasHoje, agora };
}

// ---- Segundo Cérebro (cofre do Obsidian) para a TV da Sala do Gerente ----
function cerebro() {
  const base = path.join(process.env.HOME || '', '.segundo-cerebro');
  let vault;
  try { vault = JSON.parse(fs.readFileSync(path.join(base, 'config.json'), 'utf8')).vault; } catch { return { ativo: false }; }
  const notas = [];
  const andar = (dir) => {
    let itens = [];
    try { itens = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const it of itens) {
      if (it.name.startsWith('.') || it.name.startsWith('_indice') || it.name === '99-Sistema' || it.name === '00-INDICE.md') continue;
      const p = path.join(dir, it.name);
      if (it.isDirectory()) andar(p);
      else if (it.name.endsWith('.md')) {
        const txt = fs.readFileSync(p, 'utf8');
        const links = [...txt.matchAll(/\[\[([^\]|#]+)/g)].map((m) => m[1].trim());
        notas.push({ t: it.name.slice(0, -3), pasta: path.relative(vault, dir).split(path.sep)[0] || '', m: fs.statSync(p).mtimeMs, links });
      }
    }
  };
  andar(vault);
  const nomes = new Set(notas.map((n) => n.t));
  const arestas = [];
  notas.forEach((n, i) => n.links.forEach((l) => { const j = notas.findIndex((o) => o.t === l); if (j >= 0 && j !== i) arestas.push([i, j]); }));
  const contagem = {};
  for (const n of notas) contagem[n.pasta] = (contagem[n.pasta] || 0) + 1;
  let log = [];
  try { log = fs.readFileSync(path.join(base, 'registro.log'), 'utf8').trim().split('\n').slice(-8).reverse(); } catch {}
  return {
    ativo: true, total: notas.length, contagem, log,
    nos: notas.map((n) => ({ t: n.t, pasta: n.pasta, m: n.m })), arestas, nomes: nomes.size,
    recentes: [...notas].sort((a, b) => b.m - a.m).slice(0, 6).map((n) => ({ t: n.t, pasta: n.pasta, m: n.m })),
    agora: Date.now(),
  };
}

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.gltf': 'model/gltf+json',
  '.bin': 'application/octet-stream',
};

// ── Pedidos feitos pela página (14/11/2026) ──────────────────────────────────
// O CEO escolhe o agente e escreve o pedido; o servidor abre o Claude Code em segundo plano
// (modo "auto": o classificador de segurança barra ações perigosas) como gerente-geral, que delega
// ao agente escolhido — assim o anel e o balão aparecem no escritório pelos ganchos de sempre.
// Proteção: só aceita JSON com o cabeçalho X-Pedido-Escritorio (outro site não consegue mandar sem o
// navegador bloquear) e a origem tem de ser esta mesma página.
import { spawn } from 'node:child_process';
const _CLAUDE_LOCAL = path.join(process.env.HOME || '', '.local', 'bin', 'claude');
const CLAUDE = process.env.CLAUDE_BIN || (fs.existsSync(_CLAUDE_LOCAL) ? _CLAUDE_LOCAL : 'claude');
const PASTA_PEDIDOS = path.join(AQUI, 'pedidos');
// O Claude Code dos pedidos usa o login próprio do Mac (`claude` → /login), nunca credenciais herdadas
// de outra sessão: tiramos do ambiente tudo que começa com ANTHROPIC_ ou CLAUDE.
function ambienteLimpo() {
  const env = {};
  for (const [k, v] of Object.entries(process.env)) if (!/^(ANTHROPIC_|CLAUDE)/.test(k)) env[k] = v;
  env.PATH = `${path.join(process.env.HOME || '', '.local', 'bin')}:/opt/homebrew/bin:/usr/local/bin:${env.PATH || '/usr/bin:/bin'}`;
  env.CLAUDE_PROJECT_DIR = RAIZ;
  return env;
}
// Segurança (DNS rebinding): toda rota exige Host = localhost/127.0.0.1 (com a porta). Outro Host recebe 403.
const HOSTS_OK = new Set([`localhost:${PORTA}`, `127.0.0.1:${PORTA}`, `[::1]:${PORTA}`]);
const hostOk = (req) => HOSTS_OK.has(String(req.headers.host || '').toLowerCase());
function receberPedido(req, res) {
  const resp = (cod, obj) => { res.writeHead(cod, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(obj)); };
  const origem = req.headers.origin;
  let origemOk = true;
  if (origem) { try { origemOk = HOSTS_OK.has(new URL(origem).host.toLowerCase()) && new URL(origem).host === req.headers.host; } catch { origemOk = false; } }
  // Só roda o Claude se o Host E a origem forem os do próprio escritório (fecha DNS rebinding).
  if (!hostOk(req) || !origemOk || req.headers['x-pedido-escritorio'] !== '1'
    || !String(req.headers['content-type'] || '').startsWith('application/json')) return resp(403, { erro: 'pedido recusado' });
  let corpo = '';
  req.on('data', (c) => { corpo += c; if (corpo.length > 20000) req.destroy(); });
  req.on('end', () => {
    let p;
    try { p = JSON.parse(corpo); } catch { return resp(400, { erro: 'pedido inválido' }); }
    const texto = String(p.texto || '').trim().slice(0, 4000);
    const agente = String(p.agente || '');
    const slugs = lerAgentes().map((a) => a.slug);
    if (!texto) return resp(400, { erro: 'escreva o pedido' });
    if (!slugs.includes(agente)) return resp(400, { erro: 'agente desconhecido' });
    if (!fs.existsSync(CLAUDE)) return resp(500, { erro: 'Claude Code não encontrado neste Mac' });
    const id = new Date().toISOString().replace(/[:.]/g, '-');
    fs.mkdirSync(PASTA_PEDIDOS, { recursive: true });
    const instrucao = agente === 'gerente-geral'
      ? `Pedido do CEO feito pela página do Escritório 3D:\n\n${texto}\n\nVocê é o gerente-geral: entenda, divida e delegue aos agentes certos (Agent, com description curta), confira e salve a entrega conforme o CLAUDE.md. Nada vai ao ar sem OK do CEO. Antes de terminar, SALVE um resumo curto (o que foi feito, onde está, o que falta, o que precisa de decisão do CEO) em escritorio/pedidos/${id}-${agente}-RESPOSTA.md.`
      : `Pedido do CEO feito pela página do Escritório 3D para o agente "${agente}":\n\n${texto}\n\nDelegue AGORA esta tarefa ao agente ${agente} (ferramenta Agent, subagent_type "${agente}", description curta e clara do pedido). Confira o que ele entregar e salve conforme o CLAUDE.md. Antes de terminar, SALVE um resumo curto (o que foi feito, onde está, o que falta, o que precisa de decisão do CEO) em escritorio/pedidos/${id}-${agente}-RESPOSTA.md. Nada vai ao ar sem OK do CEO.`;
    const log = fs.openSync(path.join(PASTA_PEDIDOS, `${id}-${agente}.log`), 'a');
    fs.writeSync(log, `# Pedido ${id}\n# Agente: ${agente}\n# Texto: ${texto}\n\n`);
    const filho = spawn(CLAUDE, ['-p', instrucao, '--agent', 'gerente-geral', '--permission-mode', 'auto', '--output-format', 'text'],
      { cwd: RAIZ, detached: true, stdio: ['ignore', log, log], env: ambienteLimpo() });
    filho.on('error', (e) => fs.appendFileSync(path.join(PASTA_PEDIDOS, `${id}-${agente}.log`), `\nERRO ao iniciar: ${e.message}\n`));
    filho.on('exit', () => {
      const t = texto.replace(/["\\]/g, '').slice(0, 60);
      spawn('osascript', ['-e', `display notification "${t}" with title "Pedido concluído" subtitle "${agente}"`], { stdio: 'ignore' }).unref();
    });
    filho.unref();
    resp(200, { ok: true, id });
  });
}

// ── Lista de pedidos e o que cada um entregou (14/11/2026) ─────────────────────
// Para cada pedido: status (trabalhando/concluído), a conclusão do agente (RESPOSTA.md ou o fim do log)
// e os arquivos criados nas pastas de entrega durante o pedido. Arquivos são servidos só para leitura
// e só de dentro de entregas/ e VIDEOS-PRONTOS/.
import { execFileSync } from 'node:child_process';
const PASTAS_ENTREGA = ['entregas', 'VIDEOS-PRONTOS'];
function rodando(id) {
  try { execFileSync('pgrep', ['-f', id], { stdio: 'ignore' }); return true; } catch { return false; }
}
function arquivosEntre(ini, fim) {
  const achados = [];
  const andar = (dir, prof) => {
    if (prof > 7 || achados.length > 300) return;
    let itens; try { itens = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const it of itens) {
      if (!visivel(it.name)) continue;
      const p = path.join(dir, it.name);
      if (it.isDirectory()) { try { if (fs.statSync(p).mtimeMs >= ini) andar(p, prof + 1); } catch { /* */ } continue; }
      try { const st = fs.statSync(p); if (st.mtimeMs >= ini && st.mtimeMs <= fim + 5000) achados.push({ rel: path.relative(RAIZ, p), t: st.mtimeMs, tam: st.size }); } catch { /* */ }
    }
  };
  for (const pasta of PASTAS_ENTREGA) andar(path.join(RAIZ, pasta), 0);
  return achados.sort((a, b) => a.t - b.t).slice(0, 60);
}
function listarPedidos() {
  if (!fs.existsSync(PASTA_PEDIDOS)) return [];
  const logs = fs.readdirSync(PASTA_PEDIDOS).filter((f) => visivel(f) && f.endsWith('.log')).sort().reverse().slice(0, 25);
  return logs.map((f) => {
    const id = f.slice(0, 24);
    const agente = f.slice(25, -4);
    const log = fs.readFileSync(path.join(PASTA_PEDIDOS, f), 'utf8');
    const texto = (log.match(/^# Texto: (.*)$/m) || [])[1] || '';
    const ini = Date.parse(id.replace(/T(\d\d)-(\d\d)-(\d\d)-(\d+)Z/, 'T$1:$2:$3.$4Z')) || fs.statSync(path.join(PASTA_PEDIDOS, f)).birthtimeMs;
    const arqResp = path.join(PASTA_PEDIDOS, `${id}-${agente}-RESPOSTA.md`);
    const ativo = rodando(id);
    let resposta = fs.existsSync(arqResp) ? fs.readFileSync(arqResp, 'utf8') : '';
    if (!resposta && !ativo) {
      const saida = log.split('\n').slice(4).join('\n').replace(/🧠 registrado no segundo cérebro/g, '').trim();
      resposta = saida || 'O agente terminou sem deixar um resumo. Veja abaixo os arquivos que ele criou.';
    }
    const fim = ativo ? Date.now() : Math.max(fs.statSync(path.join(PASTA_PEDIDOS, f)).mtimeMs, fs.existsSync(arqResp) ? fs.statSync(arqResp).mtimeMs : 0);
    return { id, agente, texto, status: ativo ? 'trabalhando' : 'concluido', inicio: ini, fim, resposta, arquivos: arquivosEntre(ini, fim) };
  });
}
function servirArquivo(req, res, rel) {
  const arq = path.resolve(RAIZ, rel);
  const ok = PASTAS_ENTREGA.some((p) => arq.startsWith(path.join(RAIZ, p) + path.sep));
  if (!ok || !fs.existsSync(arq) || fs.statSync(arq).isDirectory()) { res.writeHead(404); return res.end('Não encontrado'); }
  const ext = path.extname(arq).toLowerCase();
  const tipo = { '.mp4': 'video/mp4', '.mov': 'video/quicktime', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
    '.md': 'text/plain; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json; charset=utf-8', '.html': 'text/plain; charset=utf-8', '.pdf': 'application/pdf' }[ext] || 'application/octet-stream';
  const tam = fs.statSync(arq).size;
  const faixa = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
  if (faixa) {
    const a = faixa[1] ? Number(faixa[1]) : 0; const b = faixa[2] ? Number(faixa[2]) : tam - 1;
    res.writeHead(206, { 'Content-Type': tipo, 'Content-Range': `bytes ${a}-${b}/${tam}`, 'Accept-Ranges': 'bytes', 'Content-Length': b - a + 1 });
    return fs.createReadStream(arq, { start: a, end: b }).pipe(res);
  }
  res.writeHead(200, { 'Content-Type': tipo, 'Content-Length': tam, 'Accept-Ranges': 'bytes' });
  fs.createReadStream(arq).pipe(res);
}

const servidor = http.createServer((req, res) => {
  if (!hostOk(req)) { res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('host recusado'); }
  let url;
  try { url = decodeURIComponent((req.url || '/').split('?')[0]); }
  catch { res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('pedido inválido'); }
  if (url === '/pedido' && req.method === 'POST') return receberPedido(req, res);
  if (url === '/pedidos') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    return res.end(JSON.stringify(listarPedidos()));
  }
  if (url === '/arquivo') return servirArquivo(req, res, new URL(req.url, 'http://x').searchParams.get('c') || '');
  if (url === '/dados.js') {
    res.writeHead(200, { 'Content-Type': TIPOS['.js'], 'Cache-Control': 'no-store' });
    return res.end(dadosJs());
  }
  if (url === '/estado') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    return res.end(JSON.stringify(estado()));
  }
  if (url === '/cerebro') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    return res.end(JSON.stringify(cerebro()));
  }
  const rel = url === '/' ? 'index.html' : url.replace(/^\/+/, '');
  const arq = path.resolve(AQUI, rel);
  if (!arq.startsWith(AQUI + path.sep) || !fs.existsSync(arq) || fs.statSync(arq).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Não encontrado');
  }
  res.writeHead(200, { 'Content-Type': TIPOS[path.extname(arq)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(arq).pipe(res);
});
servidor.listen(PORTA, '127.0.0.1', () => {
  console.log(`Escritório 3D rodando em http://localhost:${PORTA}`);
});
// Tailscale (OPCIONAL, desligado por padrão; ligue com ESCRITORIO_TAILSCALE=1): escuta TAMBÉM no IP da rede privada Tailscale (100.64.0.0/10), nunca em 0.0.0.0,
// para a TV/celular/computador do CEO abrirem http://<IP-tailscale>:5173 sem expor o escritório à rede do Wi-Fi nem à internet.
// Serve arquivos estáticos + /estado e recebe pedidos em POST /pedido (protegido por cabeçalho e origem).
if (process.env.ESCRITORIO_TAILSCALE === '1') import('node:os').then((os) => {
  const ips = Object.values(os.networkInterfaces()).flat().filter((i) => i && i.family === 'IPv4'
    && /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./.test(i.address)).map((i) => i.address);
  for (const ip of ips) {
    HOSTS_OK.add(`${ip}:${PORTA}`);
    const extra = http.createServer(servidor.listeners('request')[0]);
    extra.on('error', (e) => console.log('Tailscale: não foi possível escutar em', ip, e.code));
    extra.listen(PORTA, ip, () => console.log(`Escritório 3D (Tailscale) em http://${ip}:${PORTA}`));
  }
});
