import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { criarMundo, SALAS } from './mundo.js';
// Bonecos: padrão = estilo do vídeo de referência (bonecos.js). ?bonecos=trellis (ou antigo) volta ao personagem.js (cartoon + TRELLIS).
const _motorBonecos = new URLSearchParams(location.search).get('bonecos');
const { carregarModelos, criarPersonagem, posar } = await import(_motorBonecos === 'trellis' || _motorBonecos === 'pixar' || _motorBonecos === 'antigo' ? './personagem.js' : './bonecos.js');
import { iniciarTvCerebro } from './cerebro-tv.js';
import { criarAnel, estimarPorTempo } from './progresso-anel.js';

const DADOS = window.DADOS_ESCRITORIO || { agentes: [], camposAPreencher: null, entregas: 0 };

// ---------- Quem é quem, onde senta e o que aparece no balão ----------
const PERFIL = {
  'gerente-geral':          { nome: 'Gerente-Geral',          cor: '#f59e0b', sala: 'gerencia',  icone: '📋' },
  'editor-viral-podcast':   { nome: 'Editor Viral de Podcasts', cor: '#22c55e', sala: 'trabalho',  icone: '🎙️' },
  desenvolvedor:            { nome: 'Desenvolvedor',          cor: '#3b82f6', sala: 'trabalho',  icone: '💻' },
  'web-designer':           { nome: 'Web Designer',           cor: '#ec4899', sala: 'trabalho',  icone: '🎨' },
  copywriter:               { nome: 'Copywriter',             cor: '#a855f7', sala: 'trabalho',  icone: '✍️' },
  'especialista-instagram': { nome: 'Especialista Instagram', cor: '#f43f5e', sala: 'trabalho',  icone: '📱' },
  'social-media':           { nome: 'Social Media',           cor: '#fb7185', sala: 'trabalho',  icone: '🗓️' },
  'especialista-ganchos':   { nome: 'Especialista em Ganchos', cor: '#f59e0b', sala: 'trabalho',  icone: '🪝' },
  'editor-de-palestras':    { nome: 'Editor de Palestras',    cor: '#0f766e', sala: 'trabalho',  icone: '🎤' },
  'editor-de-video':        { nome: 'Editor de Vídeo',        cor: '#d946ef', sala: 'trabalho',  icone: '🎬' },
  'especialista-frases':    { nome: 'Especialista em Frases', cor: '#14b8a6', sala: 'trabalho',  icone: '✨' },
  oraculo:                  { nome: 'Oráculo',                cor: '#8b5cf6', sala: 'trabalho',  icone: '🔮' },
  'dev-seguranca':          { nome: 'Dev Segurança',          cor: '#ef4444', sala: 'trabalho',  icone: '🛡️' },
  'gestor-de-trafego':      { nome: 'Gestor de Tráfego',      cor: '#0ea5e9', sala: 'comercial', icone: '📣' },
  vendedor:                 { nome: 'Vendedor',               cor: '#f97316', sala: 'comercial', icone: '🤝' },
  atendente:                { nome: 'Atendente',              cor: '#84cc16', sala: 'comercial', icone: '💬' },
  contador:                 { nome: 'Contador',               cor: '#eab308', sala: 'comercial', icone: '🧮' },
  analista:                 { nome: 'Analista',               cor: '#6366f1', sala: 'comercial', icone: '📊' },
};
const ORDEM = Object.keys(PERFIL);
// Nomes próprios dos agentes: tabela editável em escritorio/nomes-agentes.json (sem ela, vale o cargo).
let NOMES = {};
try { const r = await fetch('/nomes-agentes.json', { cache: 'no-store' }); if (r.ok) NOMES = await r.json(); } catch { /* sem tabela: usa o cargo */ }

// ---------- Renderização ----------
const cont = document.getElementById('cena');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
cont.appendChild(renderer.domElement);

const rotulos = new CSS2DRenderer();
rotulos.setSize(innerWidth, innerHeight);
rotulos.domElement.className = 'rotulos';
cont.appendChild(rotulos.domElement);

const GER = 'gerente-geral';
const listaDados = [...DADOS.agentes].sort((a, b) => {
  const ia = ORDEM.indexOf(a.slug), ib = ORDEM.indexOf(b.slug);
  return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
});
{ const gi = listaDados.findIndex((d) => d.slug === GER); if (gi > 0) listaDados.unshift(...listaDados.splice(gi, 1)); }
const equipe = listaDados.map((dados) => {
  const base = PERFIL[dados.slug] || { nome: dados.slug, cor: '#94a3b8', icone: '💡' };
  const n = NOMES[dados.slug] || {};
  const proprio = String(n.apelido || n.nome || '').trim();
  return { dados, perfil: { ...base, cargo: base.nome, nome: proprio || base.nome } }; // nome = pessoa; cargo = função
});
const mundo = await criarMundo(equipe.map((e) => ({ slug: e.dados.slug, nome: e.perfil.nome, cor: e.perfil.cor, icone: e.perfil.icone })));
const cena = mundo.cena;
const colisores = mundo.colisores;
const tvCerebro = iniciarTvCerebro(mundo.telaCerebro);

const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 0.1, 500);
// no computador o painel esquerdo cobre parte da tela, então a câmera mira um pouco à esquerda
const DX = innerWidth > 860 ? -4.0 : 0;
const ASPECTO = () => innerWidth / innerHeight;
const AJUSTE = () => (ASPECTO() < 1 ? 2.3 : Math.max(1, 1.55 / ASPECTO() * 1.15));
const DIR = new THREE.Vector3(0.30, 0.64, 0.70).normalize(); // de onde a câmera olha (sudeste, de cima)
function vistaDaZona(id) {
  const z = mundo.zonas[id];
  const alvo = new THREE.Vector3(z.alvo[0] + (id === 'geral' ? DX : DX * 0.7), z.alvo[1], z.alvo[2]);
  return { pos: alvo.clone().addScaledVector(DIR, z.dist * AJUSTE()), alvo };
}
const VISTA_GERAL = vistaDaZona('geral');
camera.position.copy(VISTA_GERAL.pos);

const controles = new OrbitControls(camera, renderer.domElement);
controles.target.copy(VISTA_GERAL.alvo);
controles.enableDamping = true;
controles.maxPolarAngle = Math.PI * 0.46;
controles.minDistance = 3;
controles.maxDistance = 140;
controles.autoRotateSpeed = 0.45;
let girando = !new URLSearchParams(location.search).has('parado'); // vista aérea gira sozinha sobre o prédio
controles.autoRotate = girando;

// dia ou noite (lembra a escolha neste navegador)
let noite = true; // a referência é noturna: abre à noite
try { noite = localStorage.getItem('escritorio-noite-v5') !== '0'; } catch {}
function aplicarLuz() {
  mundo.definirNoite(noite);
  document.getElementById('btnLuz').textContent = noite ? '☀️' : '🌙';
  renderer.toneMappingExposure = noite ? 1.15 : 1.0;
  document.getElementById('btnLuz').title = noite ? 'Mudar para dia' : 'Mudar para noite';
}
aplicarLuz();
document.getElementById('btnLuz').onclick = () => {
  noite = !noite;
  try { localStorage.setItem('escritorio-noite-v5', noite ? '1' : '0'); } catch {}
  aplicarLuz();
};

// ---------- Agentes ----------
const agentes = [];
const clicaveis = [];
function iniciais(nome) {
  return nome.split(/[\s-]+/).filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');
}

document.getElementById('resumoEquipe').textContent = 'carregando personagens…';
await carregarModelos();

equipe.forEach(({ dados, perfil }, i) => {
  const salaInfo = mundo.salas[dados.slug];
  const g = new THREE.Group(); // posição no chão; o corpo senta/levanta dentro do personagem
  g.position.set(salaInfo.assento.x, 0, salaInfo.assento.z);
  g.rotation.y = salaInfo.assento.rot;
  cena.add(g);
  const p = criarPersonagem(dados.slug, i + 1, perfil.cor);
  g.add(p.raiz);
  p.partes.forEach((m) => { m.userData.slug = dados.slug; clicaveis.push(m); });

  const anel = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.64, 40), new THREE.MeshBasicMaterial({ color: perfil.cor, transparent: true, opacity: 0.9 }));
  anel.rotation.x = -Math.PI / 2;
  anel.position.y = 0.035;
  anel.visible = false;
  g.add(anel);

  const tag = document.createElement('div');
  tag.className = 'tag-agente';
  const bolha = document.createElement('div');
  bolha.className = 'bolha oculto';
  const el = document.createElement('button');
  el.className = 'rotulo';
  el.title = perfil.nome === perfil.cargo ? perfil.cargo : `${perfil.nome} · ${perfil.cargo}`;
  el.innerHTML = `<span class="pt" style="background:${perfil.cor}"></span><span class="txt"><b class="nm">${esc(perfil.nome)}</b><small>${perfil.nome === perfil.cargo ? '' : `${esc(perfil.cargo)} `}<em>· parado</em></small></span>`;
  const rotuloEm = el.querySelector('em');
  el.addEventListener('click', (e) => { e.stopPropagation(); selecionar(dados.slug, true); });
  bolha.addEventListener('click', (e) => { e.stopPropagation(); selecionar(dados.slug, true); });
  const prog = criarAnel({ cor: perfil.cor, onClick: () => selecionar(dados.slug, true) }); // anel de progresso sobre a cabeça
  const linhaAnel = document.createElement('div'); // anel + balão da tarefa ao lado
  linhaAnel.className = i % 2 ? 'linha-anel esq' : 'linha-anel';
  const balao = document.createElement('div');
  balao.className = 'tarefa-bal oculto';
  balao.addEventListener('click', (e) => { e.stopPropagation(); selecionar(dados.slug, true); });
  linhaAnel.append(prog.el, balao);
  tag.append(linhaAnel, bolha, el);
  const rot = new CSS2DObject(tag);
  rot.position.set(0, 1.75, 0);
  g.add(rot);

  agentes.push({ dados, perfil, sala: dados.slug, salaInfo, grupo: g, p, anel, prog, tag, dadosProg: null, rotulo: el, rotuloEm, bolha, balao, textoBalao: '', rotObj: rot, fase: i * 1.7, status: 'parado', tarefa: '',
    ia: { estado: 'sentado', rota: [], poi: null, espera: 0, voltando: false, paradoDesde: null, limite: 0, jaPassou: false } });
});

// ---------- Interface ----------
function esc(s) { return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function md(t) {
  const inl = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code>$1</code>');
  let html = '', lista = null;
  for (const linha of t.split('\n')) {
    const l = linha.trimEnd();
    const m = l.match(/^\s*([-*]|\d+\.)\s+(.*)$/);
    if (m) {
      const tipo = /\d/.test(m[1]) ? 'ol' : 'ul';
      if (lista !== tipo) { if (lista) html += `</${lista}>`; html += `<${tipo}>`; lista = tipo; }
      html += `<li>${inl(m[2])}</li>`;
      continue;
    }
    if (lista) { html += `</${lista}>`; lista = null; }
    const h = l.match(/^#{1,6}\s+(.*)$/);
    if (h) html += `<h4>${inl(h[1])}</h4>`;
    else if (l.trim()) html += `<p>${inl(l)}</p>`;
  }
  if (lista) html += `</${lista}>`;
  return html;
}

const $ = (id) => document.getElementById(id);
$('resumoEquipe').textContent = `${agentes.length} agentes`;
$('sAgentes').textContent = agentes.length;
$('sEntregas').textContent = DADOS.entregas;
const campos = DADOS.camposAPreencher;
$('sFicha').textContent = campos == null ? 'sem ficha' : campos === 0 ? 'Completa' : `${campos} campos`;
if (campos) $('sFicha').style.color = '#fbbf24';
if (campos) $('sFicha').title = 'Campos ainda "[A PREENCHER]" em PROJETO.md';

const lista = $('lista');
for (const a of agentes) {
  const li = document.createElement('li');
  li.innerHTML = `<button data-slug="${esc(a.dados.slug)}">
      <span class="av" style="background:${a.perfil.cor}">${esc(iniciais(a.perfil.nome))}</span>
      <span class="nome"><b>${esc(a.perfil.nome)}</b><small>${esc(a.perfil.nome === a.perfil.cargo ? '' : a.perfil.cargo + ' · ')}${esc(SALAS[a.sala].nome)}</small></span>
      <span class="status"><span class="pt cinza"></span>Parado</span></button>`;
  li.firstElementChild.addEventListener('click', () => { selecionar(a.dados.slug, true); fecharPainelCelular(); });
  a.chip = li.querySelector('.status');
  lista.appendChild(li);
}

const EXEMPLOS = ['Cortar o podcast novo em vídeos virais', 'Calcular preço, custo e margem', 'Criar a página de vendas', 'Montar 5 ideias de Reels para esta semana'];
for (const ex of EXEMPLOS) {
  const b = document.createElement('button');
  b.textContent = ex;
  b.onclick = () => { $('tarefa').value = ex; $('tarefa').focus(); };
  $('chips').appendChild(b);
}
function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.remove('oculto');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => t.classList.add('oculto'), 2600);
}
// Fazer pedido direto pela página (14/11/2026): escolhe o agente e o servidor chama o Claude Code em segundo plano.
{
  const sel = $('agentePedido');
  for (const { dados, perfil } of equipe) {
    const o = document.createElement('option');
    o.value = dados.slug;
    o.textContent = `${perfil.icone || ''} ${perfil.nome} — ${perfil.cargo}`.trim();
    sel.appendChild(o);
  }
  sel.value = GER;
}
$('btnCopiar').onclick = async () => {
  const txt = $('tarefa').value.trim();
  const agente = $('agentePedido').value;
  if (!txt) { $('tarefa').focus(); return toast('Escreva o pedido primeiro'); }
  const btn = $('btnCopiar');
  btn.disabled = true; btn.textContent = 'Enviando…';
  try {
    const r = await fetch('/pedido', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Pedido-Escritorio': '1' },
      body: JSON.stringify({ agente, texto: txt }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.erro || 'falhou');
    $('tarefa').value = '';
    toast(`Pedido enviado para ${nomeDe(agente)}!`);
  } catch (e) {
    toast('Não consegui enviar: ' + e.message);
  } finally {
    btn.disabled = false; btn.textContent = 'Fazer pedido';
  }
};

// zonas (botões e teclas 1–7)
const nav = $('salas');
const botoesSala = {};
const ORDEM_ZONAS = ['geral', 'gerencia', 'salao', 'lounge', 'cozinha', 'recepcao', 'reuniao'];
ORDEM_ZONAS.forEach((id, i) => {
  const b = document.createElement('button');
  b.textContent = mundo.zonas[id].nome;
  b.title = `Tecla ${i + 1}`;
  b.onclick = () => irParaSala(id);
  nav.appendChild(b);
  botoesSala[id] = b;
});
botoesSala.geral.classList.add('on');
function marcarSala(id) { for (const [k, b] of Object.entries(botoesSala)) b.classList.toggle('on', k === id); }
function irParaSala(id) {
  if (modo === 'gerente') trocarModo('geral', false);
  marcarSala(id);
  girando = id === 'geral'; controles.autoRotate = girando; atualizarBtnGirar();
  const v = vistaDaZona(id);
  voar(v.pos, v.alvo, 1.4);
}
function atualizarBtnGirar() { const b = $('btnGirar'); if (b) b.classList.toggle('on', girando); }
$('btnGirar').onclick = () => { girando = !girando; controles.autoRotate = girando; atualizarBtnGirar(); };
atualizarBtnGirar();

// painel de detalhe
let selecionado = null;
function selecionar(slug, mover) {
  const a = agentes.find((x) => x.dados.slug === slug);
  if (!a) return;
  selecionado = a;
  for (const x of agentes) {
    x.anel.visible = x === a;
    x.rotulo.classList.toggle('on', x === a);
  }
  lista.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.slug === slug));
  const d = a.dados;
  $('dir').innerHTML = `
    <div class="det-topo">
      <span class="av" style="background:${a.perfil.cor}">${esc(iniciais(a.perfil.nome))}</span>
      <div><h2>${esc(a.perfil.nome)}</h2><div class="cargo-det">${esc(a.perfil.cargo)}</div><code>${esc(d.arquivo)}</code></div>
      <button class="fechar" id="fecharDet" aria-label="Fechar">✕</button>
    </div>
    <div class="det-linha">
      ${chipHtml(a)}
      <span class="status">${esc(SALAS[a.sala].nome)}</span>
      <span class="status">Ferramentas: ${esc(d.ferramentas)}</span>
    </div>
    <div class="det-desc">${esc(d.descricao)}</div>
    <button class="primario" id="pedirAgente">Pedir uma tarefa a este agente</button>
    <div class="det-corpo">${md(d.corpo)}</div>`;
  $('dir').classList.remove('oculto');
  $('dir').scrollTop = 0;
  $('fecharDet').onclick = desselecionar;
  $('pedirAgente').onclick = () => {
    $('agentePedido').value = d.slug;
    $('tarefa').value = '';
    abrirPainelCelular();
    $('tarefa').focus();
  };
  if (mover && modo === 'geral') {
    const p = a.grupo.position;
    girando = false; controles.autoRotate = false; atualizarBtnGirar();
    voar(new THREE.Vector3(p.x + 2.6, 3.4, p.z + 3.8), new THREE.Vector3(p.x, 1.2, p.z + 0.1));
    marcarSala(mundo.salas[a.dados.slug].zona);
  }
}
// ---------- Pedidos e entregas (14/11/2026) ----------
// Lista os pedidos feitos pela página; ao clicar, o painel da direita mostra a conclusão do agente
// e os arquivos que ele criou (vídeos tocam ali mesmo).
let PEDIDOS = [];
let pedidoAberto = null;
const statusVisto = {};
const EXT_VIDEO = /\.(mp4|mov)$/i, EXT_IMG = /\.(png|jpe?g|webp)$/i;
const linkArq = (rel) => '/arquivo?c=' + encodeURIComponent(rel);
const horaPed = (t) => new Date(t).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
function mdSimples(t) {
  return esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^#+ (.*)$/gm, '<b>$1</b>').replace(/\n/g, '<br>');
}
function desenharPedidos() {
  const ul = $('pedidos');
  if (!PEDIDOS.length) { ul.innerHTML = '<li class="vazio">Nenhum pedido feito pela página ainda.</li>'; return; }
  ul.innerHTML = '';
  for (const p of PEDIDOS) {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.className = 'pedido-item' + (pedidoAberto === p.id ? ' on' : '');
    const st = p.status === 'trabalhando' ? '<span class="status">⏳ trabalhando</span>' : `<span class="status ok">✔ concluído · ${p.arquivos.length} arquivo(s)</span>`;
    b.innerHTML = `<b>${esc(nomeDe(p.agente))}</b> <small>${horaPed(p.inicio)}</small><br><span class="pedido-txt">${esc(p.texto.slice(0, 90))}${p.texto.length > 90 ? '…' : ''}</span><br>${st}`;
    b.onclick = () => abrirPedido(p.id);
    li.appendChild(b); ul.appendChild(li);
  }
}
function abrirPedido(id) {
  const p = PEDIDOS.find((x) => x.id === id);
  if (!p) return;
  pedidoAberto = id;
  const arqs = p.arquivos.map((a) => {
    const nome = a.rel.split('/').pop();
    const prev = EXT_VIDEO.test(a.rel) ? `<video src="${linkArq(a.rel)}" controls preload="metadata" playsinline></video>`
      : EXT_IMG.test(a.rel) ? `<img src="${linkArq(a.rel)}" alt="${esc(nome)}" loading="lazy">` : '';
    return `<li>${prev}<a href="${linkArq(a.rel)}" target="_blank" rel="noopener">${esc(nome)}</a><br><code>${esc(a.rel)}</code></li>`;
  }).join('');
  $('dir').innerHTML = `
    <div class="det-topo">
      <div><h2>${esc(nomeDe(p.agente))}</h2><div class="cargo-det">Pedido das ${horaPed(p.inicio)} · ${p.status === 'trabalhando' ? '⏳ trabalhando' : '✔ concluído às ' + horaPed(p.fim)}</div></div>
      <button class="fechar" id="fecharDet" aria-label="Fechar">✕</button>
    </div>
    <div class="det-desc"><b>Pedido:</b> ${esc(p.texto)}</div>
    <h3 class="sub-det">Conclusão do agente</h3>
    <div class="det-corpo">${p.resposta ? mdSimples(p.resposta) : 'Ainda trabalhando… a conclusão aparece aqui quando ele terminar.'}</div>
    <h3 class="sub-det">O que ele fez (${p.arquivos.length})</h3>
    <ul class="arquivos-pedido">${arqs || '<li class="vazio">Nenhum arquivo novo em entregas/ até agora.</li>'}</ul>`;
  $('dir').classList.remove('oculto');
  $('fecharDet').onclick = () => { pedidoAberto = null; desselecionar(); desenharPedidos(); };
  desenharPedidos();
}
async function atualizarPedidos() {
  try {
    const r = await fetch('/pedidos', { cache: 'no-store' });
    if (!r.ok) return;
    PEDIDOS = await r.json();
    for (const p of PEDIDOS) {
      if (statusVisto[p.id] === 'trabalhando' && p.status === 'concluido') toast(`${nomeDe(p.agente)} concluiu! Veja em "Pedidos e entregas".`);
      statusVisto[p.id] = p.status;
    }
    desenharPedidos();
    if (pedidoAberto) {
      const p = PEDIDOS.find((x) => x.id === pedidoAberto);
      if (p && $('dir').dataset.ver !== p.status + p.arquivos.length + p.resposta.length) { abrirPedido(p.id); $('dir').dataset.ver = p.status + p.arquivos.length + p.resposta.length; }
    }
  } catch { /* servidor fora do ar: tenta de novo */ }
}
setTimeout(() => { atualizarPedidos(); setInterval(atualizarPedidos, 5000); }, 0);

function desselecionar() {
  selecionado = null;
  for (const x of agentes) { x.anel.visible = false; x.rotulo.classList.remove('on'); }
  lista.querySelectorAll('button').forEach((b) => b.classList.remove('on'));
  $('dir').classList.add('oculto');
}

// ---------- Status ao vivo ----------
const ROTULO_STATUS = { trabalhando: 'trabalhando', concluido: 'concluiu', parado: 'parado' };
const COR_PONTO = { trabalhando: 'verde', concluido: 'azul', parado: 'cinza' };
const CONCLUIDO_POR = 10 * 60 * 1000; // "concluiu" fica visível por 10 minutos
function chipHtml(a) {
  const tarefa = (a.status !== 'parado' && a.tarefa ? ` · ${esc(a.tarefa.slice(0, 60))}` : '') + (a.progTexto && a.status === 'trabalhando' ? ` · ${esc(a.progTexto)}` : '');
  return `<span class="status ${a.status}" id="detStatus"><span class="pt ${COR_PONTO[a.status]}"></span>${ROTULO_STATUS[a.status][0].toUpperCase() + ROTULO_STATUS[a.status].slice(1)}${tarefa}</span>`;
}
const porSlug = Object.fromEntries(agentes.map((a) => [a.dados.slug, a]));
const nomeDe = (slug) => porSlug[slug]?.perfil.nome || slug;
const corDe = (slug) => porSlug[slug]?.perfil.cor || '#6b7280';
const hora = (t) => new Date(t).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

function aplicarEstado(est) {
  const vivo = $('sVivo');
  vivo.textContent = est.conectado ? 'Conectado' : 'Aguardando';
  vivo.style.color = est.conectado ? '#4ade80' : '';
  vivo.title = est.conectado ? 'Recebendo eventos do Claude Code' : 'Nenhum evento ainda: faça um pedido no Claude Code (numa sessão aberta depois da configuração)';
  let trabalhando = 0;
  for (const a of agentes) {
    const e = est.agentes[a.dados.slug];
    let status = e?.status || 'parado';
    if (status === 'concluido' && est.agora - e.desde > CONCLUIDO_POR) status = 'parado';
    if (status === 'trabalhando') trabalhando++;
    const mudou = status !== a.status || (e?.tarefa || '') !== a.tarefa;
    const statusAntes = a.status;
    a.status = status;
    a.tarefa = e?.tarefa || '';
    // ---- anel de progresso ----
    if (status === 'trabalhando' && e?.inicio) {
      if (a.dadosProg && a.dadosProg.inicio !== e.inicio) a.prog.esconder(); // nova tarefa: reinicia o anel
      a.prog.iniciar();
      a.dadosProg = { inicio: e.inicio, progresso: e.progresso, esperadoMs: e.esperadoMs, fonte: e.fonteEsperado, amostras: e.amostras, desvio: est.agora - Date.now() };
    } else if (statusAntes === 'trabalhando' && a.prog.visivel()) {
      if (status === 'concluido') a.prog.concluir(); else a.prog.esconder();
      a.dadosProg = null;
    } else if (status !== 'trabalhando' && a.prog.visivel() && a.prog.estado().fase !== 'check') { a.prog.esconder(); a.dadosProg = null; }
    a.tag.classList.toggle('com-anel', a.prog.visivel());
    if (selecionado === a && $('detStatus')) $('detStatus').outerHTML = chipHtml(a);
    if (!mudou) continue;
    a.rotulo.classList.remove('trabalhando', 'concluido');
    if (status !== 'parado') a.rotulo.classList.add(status);
    a.rotuloEm.textContent = `· ${ROTULO_STATUS[status]}`;
    a.bolha.textContent = status === 'trabalhando' ? a.perfil.icone : status === 'concluido' ? '✅' : '';
    a.bolha.title = a.tarefa || '';
    a.bolha.classList.toggle('oculto', status === 'parado');
    a.chip.className = `status ${status}`;
    a.chip.innerHTML = `<span class="pt ${COR_PONTO[status]}"></span>${ROTULO_STATUS[status][0].toUpperCase() + ROTULO_STATUS[status].slice(1)}`;
    if (selecionado === a && $('detStatus')) $('detStatus').outerHTML = chipHtml(a);
  }
  $('sTrab').textContent = `${trabalhando}/${agentes.length}`;
  $('sConcl').textContent = est.concluidasHoje ?? 0;
  $('resumoEquipe').textContent = `${agentes.length} agentes · ${trabalhando ? `${trabalhando} trabalhando` : 'ninguém trabalhando agora'}`;
  document.querySelector('.marca .pt').className = `pt ${trabalhando ? 'verde' : 'cinza'}`;

  const feed = $('feed');
  if (est.feed.length) {
    feed.innerHTML = est.feed.map((f) => `<li style="--cor:${corDe(f.agente)}">
        <b>${esc(nomeDe(f.agente))}</b>${f.para ? ` → <b>${esc(nomeDe(f.para))}</b>` : ''}: ${esc(f.texto)}
        <time>${hora(f.t)}</time></li>`).join('');
  }
}
async function buscarEstado() {
  try {
    const r = await fetch('/estado', { cache: 'no-store' });
    if (r.ok) aplicarEstado(await r.json());
  } catch { /* servidor parado: tenta de novo */ }
}
buscarEstado();
setInterval(buscarEstado, 2000);

// painel no celular
function abrirPainelCelular() { $('esq').classList.add('aberto'); }
function fecharPainelCelular() { $('esq').classList.remove('aberto'); }
$('btnPainel').onclick = () => $('esq').classList.toggle('aberto');

// ---------- Câmera: voo suave ----------
let voo = null;
function voar(pos, alvo, dur = 1.1) {
  voo = { p0: camera.position.clone(), a0: controles.target.clone(), p1: pos.clone(), a1: alvo.clone(), t: 0, dur };
}

// ---------- Movimento dos agentes ----------
// Regra do CEO: quem recebe trabalho senta na mesa e fica lá; só levanta depois de MUITO tempo sem fazer nada.
// (?rapido na URL encurta os tempos só para demonstração.)
const FATOR_TEMPO = new URLSearchParams(location.search).has('rapido') ? 0.04 : 1;
const OCIOSO_PRIMEIRO = [6 * 60 * FATOR_TEMPO, 14 * 60 * FATOR_TEMPO]; // segundos parado antes do primeiro passeio
const OCIOSO_ENTRE = [3 * 60 * FATOR_TEMPO, 7 * 60 * FATOR_TEMPO];     // depois de voltar do passeio
const rnd = (a, b) => a + Math.random() * (b - a);
const lerpAng = (a, b, k) => { const d = ((((b - a) + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) - Math.PI; return a + d * Math.min(1, k); };
// os caminhos são uma rede de pontos (corredores, portas, ruas entre as baias) montada em mundo.js
function naMesaDe(a) { const p = a.grupo.position, c = a.salaInfo.assento; return Math.hypot(p.x - c.x, p.z - c.z) < 1.3; }
function iniciarPasseio(a) {
  let poi;
  if (Math.random() < 0.25 && agentes.length > 1) { // visitar a mesa de outro agente (fica no corredor de trás da cadeira)
    const o = agentes[(Math.random() * agentes.length) | 0];
    if (o !== a) { const l = o.salaInfo.lado; poi = { x: l.x, z: l.z, rot: o.salaInfo.assento.rot + Math.PI * 0.8, no: o.salaInfo.no, visita: true }; }
  }
  if (!poi) {
    const livres = mundo.pois.filter((q) => !q.dono || q.dono === a);
    poi = livres[(Math.random() * livres.length) | 0];
    if (!poi) return;
    poi.dono = a;
  }
  a.ia.poi = poi; a.ia.voltando = false; a.ia.estado = 'indo';
  const casa = a.salaInfo, pts = [];
  if (naMesaDe(a)) pts.push({ x: casa.lado.x, z: casa.lado.z });
  pts.push(...mundo.rota(0, 0, casa.no, poi.no, poi));
  a.ia.rota = pts;
}
function voltarParaCasa(a) {
  if (a.ia.poi && a.ia.poi.dono === a) a.ia.poi.dono = null;
  const p = a.grupo.position, casa = a.salaInfo, pts = [];
  const de = a.ia.poi && !a.ia.voltando && a.ia.rota.length === 0 ? a.ia.poi.no : null; // parado no destino: parte do nó dele
  if (a.ia.poi && a.ia.poi.via && de != null) pts.push(...[...a.ia.poi.via].reverse());
  a.ia.poi = null; a.ia.voltando = true; a.ia.estado = 'indo';
  pts.push(...mundo.rota(p.x, p.z, de, casa.no, null));
  pts.push({ x: casa.lado.x, z: casa.lado.z }, { x: casa.assento.x, z: casa.assento.z });
  a.ia.rota = pts;
}
function atualizarAgente(a, dt, t) {
  const ia = a.ia, g = a.grupo, trabalhando = a.status === 'trabalhando';
  let pose = a.status;
  if (ia.estado === 'sentado') {
    g.rotation.y = lerpAng(g.rotation.y, a.salaInfo.assento.rot, dt * 6);
    // regra do CEO: quem trabalha fica sentado; só levanta depois de MUITO tempo sem fazer nada
    if (a.status !== 'parado') ia.paradoDesde = null; // trabalhando ou acabou de concluir: relógio do ócio zera
    else {
      if (ia.paradoDesde == null) { ia.paradoDesde = t; ia.limite = rnd(...(ia.jaPassou ? OCIOSO_ENTRE : OCIOSO_PRIMEIRO)); }
      if (t - ia.paradoDesde > ia.limite) iniciarPasseio(a);
    }
  } else if (ia.estado === 'indo') {
    pose = 'andando';
    if (trabalhando && !ia.voltando) voltarParaCasa(a);
    const alvo = ia.rota[0];
    if (!alvo) { ia.estado = 'sentado'; }
    else {
      const dx = alvo.x - g.position.x, dz = alvo.z - g.position.z, d = Math.hypot(dx, dz);
      const vel = ia.voltando && trabalhando ? 2.0 : 1.4;
      if (d < 0.08) {
        ia.rota.shift();
        if (!ia.rota.length) {
          if (ia.voltando) { ia.estado = 'sentado'; ia.jaPassou = true; ia.paradoDesde = null; g.position.set(a.salaInfo.assento.x, 0, a.salaInfo.assento.z); }
          else { ia.estado = 'emPe'; ia.espera = t + rnd(6, 14); }
        }
      } else {
        const passo = Math.min(d, vel * dt);
        g.position.x += (dx / d) * passo; g.position.z += (dz / d) * passo;
        g.rotation.y = lerpAng(g.rotation.y, Math.atan2(dx, dz), dt * 9);
        a.p.ciclo += dt * vel * 6.2;
      }
    }
  } else if (ia.estado === 'emPe') {
    pose = ia.poi && ia.poi.sentar ? 'parado' : 'em_pe';
    if (ia.poi) g.rotation.y = lerpAng(g.rotation.y, ia.poi.rot, dt * 5);
    if (trabalhando || t > ia.espera) voltarParaCasa(a);
  }
  posar(a.p, pose, t, a.fase, dt);
}

// ---------- Modo "Assumir o Gerente" (3ª pessoa) ----------
let modo = 'geral';
const gerente = agentes.find((a) => a.dados.slug === GER);
let controlado = null;
const cam3 = { yaw: 0, pitch: 0.32, dist: 4.8, pos: new THREE.Vector3() };
const teclas = new Set();
// onde o gerente aparece ao ser assumido: em frente à mesa, rumo à porta da sala (porta ao sul, x≈-9.5)
const PONTO_INICIAL_GERENTE = [{ x: -8.6, z: -6.6, rot: 0 }, { x: -9.5, z: -6.2, rot: 0 }, { x: -9.5, z: -4, rot: 0 }];
// câmera de 3ª pessoa com colisão: paredes finas e longas e o limite do prédio encurtam a distância
let paredesCol = null;
function camLivre(x, z, dentro = true) {
  if (!paredesCol) paredesCol = colisores.filter((c) => Math.min(c.x1 - c.x0, c.z1 - c.z0) < 0.45 && Math.max(c.x1 - c.x0, c.z1 - c.z0) > 1.0);
  if (dentro && (x < L.x0 + 0.3 || x > L.x1 - 0.3 || z < L.z0 + 0.3 || z > L.z1 - 0.3)) return false;
  return !paredesCol.some((c) => x > c.x0 - 0.3 && x < c.x1 + 0.3 && z > c.z0 - 0.3 && z < c.z1 + 0.3);
}
function posCamera3(alvoY) {
  const g = controlado.grupo.position, fx = Math.sin(cam3.yaw), fz = Math.cos(cam3.yaw), cp = Math.cos(cam3.pitch);
  let d = cam3.dist;
  const dentro = g.x > L.x0 && g.x < L.x1 && g.z > L.z0 && g.z < L.z1;
  for (let k = 0.15; k <= cam3.dist; k += 0.15) { // anda para trás até bater; para no último ponto livre
    if (!camLivre(g.x - fx * k * cp, g.z - fz * k * cp, dentro)) { d = k - 0.3; break; }
  }
  // perto da parede: câmera mais perto E mais alta (passa por cima da parede de 2,7 m e olha o personagem de cima)
  let y = alvoY + Math.sin(cam3.pitch) * cam3.dist;
  if (d < cam3.dist) {
    d = Math.max(1.3, d);
    const k = Math.min(1, (cam3.dist - d) / 2.5);
    y = y + (4.7 - y) * k;
  }
  return new THREE.Vector3(g.x - fx * d * cp, Math.max(0.6, y), g.z - fz * d * cp);
}
const livre = (x, z) => !colisores.some((c) => x > c.x0 - 0.28 && x < c.x1 + 0.28 && z > c.z0 - 0.28 && z < c.z1 + 0.28);
const L = mundo.limites;
function trocarModo(novo, animar = true) {
  if (novo === modo) return;
  if (novo === 'gerente' && !gerente) return toast('Não há gerente na equipe');
  const antes = modo;
  modo = novo;
  document.querySelectorAll('#modos button').forEach((b) => b.classList.toggle('on', b.dataset.modo === novo));
  const assumindo = novo === 'gerente';
  controles.enabled = !assumindo;
  $('dica').classList.toggle('oculto', !assumindo);
  $('setas').classList.toggle('oculto', !assumindo);
  $('esq').classList.toggle('oculto', assumindo);
  if (assumindo) {
    voo = null;
    desselecionar();
    marcarSala('');
    fecharPainelCelular();
    controlado = gerente;
    if (gerente.ia.poi && gerente.ia.poi.dono === gerente) gerente.ia.poi.dono = null;
    gerente.ia.estado = 'controlado'; gerente.ia.poi = null; gerente.ia.voltando = false;
    const p = gerente.grupo.position;
    // sentado na mesa (ou fora de um ponto livre): levanta e começa num ponto aberto, de frente para a porta da gerência
    if (naMesaDe(gerente) || !livre(p.x, p.z)) {
      const ini = PONTO_INICIAL_GERENTE.find((q) => livre(q.x, q.z)) || PONTO_INICIAL_GERENTE[0];
      p.set(ini.x, 0, ini.z); gerente.grupo.rotation.y = ini.rot;
    }
    cam3.yaw = gerente.grupo.rotation.y; cam3.pitch = 0.32; cam3.dist = 4.8;
    cam3.pos.copy(posCamera3(1.35)); // começa já na posição certa (sem atravessar paredes)
    $('dica').innerHTML = `Você é <b>${esc(gerente.perfil.nome)}</b> (Gerente-Geral) · ` + '<b>W A S D</b> andar · <b>Shift</b> correr · arraste para girar a câmera · roda do mouse aproxima · <b>Esc</b> sair';
  } else {
    if (antes === 'gerente' && controlado) {
      const p = controlado.grupo.position;
      controles.target.set(p.x, 1, p.z);
      controlado = null;
      voltarParaCasa(gerente); // o gerente volta sozinho para a mesa
    }
    teclas.clear();
    if (animar) { voar(VISTA_GERAL.pos, VISTA_GERAL.alvo); marcarSala('geral'); }
  }
}
document.querySelectorAll('#modos button').forEach((b) => (b.onclick = () => trocarModo(b.dataset.modo)));

const MAPA_TECLAS = { KeyW: 'frente', ArrowUp: 'frente', KeyS: 'tras', ArrowDown: 'tras', KeyA: 'esq', ArrowLeft: 'esq', KeyD: 'dir', ArrowRight: 'dir' };
addEventListener('keydown', (e) => {
  if (e.target.tagName === 'TEXTAREA') return;
  const k = MAPA_TECLAS[e.code];
  if (k && modo === 'gerente') { teclas.add(k); e.preventDefault(); }
  if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') teclas.add('correr');
  if (modo === 'geral' && /^Digit[1-7]$/.test(e.code)) irParaSala(ORDEM_ZONAS[+e.code.slice(5) - 1]);
  if (e.code === 'Escape') { if (modo === 'gerente') trocarModo('geral'); else desselecionar(); }
});
addEventListener('keyup', (e) => {
  const k = MAPA_TECLAS[e.code];
  if (k) teclas.delete(k);
  if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') teclas.delete('correr');
});
addEventListener('blur', () => teclas.clear());
document.querySelectorAll('#setas button').forEach((b) => {
  const k = b.dataset.k;
  b.addEventListener('pointerdown', (e) => { e.preventDefault(); teclas.add(k); });
  for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) b.addEventListener(ev, () => teclas.delete(k));
});

// arrastar para girar a câmera (3ª pessoa) + clique para selecionar
const canvas = renderer.domElement;
let toque = null;
canvas.addEventListener('pointerdown', (e) => { toque = { x: e.clientX, y: e.clientY, ux: e.clientX, uy: e.clientY, moveu: false }; });
canvas.addEventListener('pointermove', (e) => {
  if (!toque) return;
  if (Math.hypot(e.clientX - toque.x, e.clientY - toque.y) > 6) toque.moveu = true;
  if (modo === 'gerente') {
    cam3.yaw -= (e.clientX - toque.ux) * 0.006;
    cam3.pitch = Math.max(0.02, Math.min(1.2, cam3.pitch + (e.clientY - toque.uy) * 0.004));
  }
  toque.ux = e.clientX; toque.uy = e.clientY;
});
canvas.addEventListener('wheel', (e) => { if (modo === 'gerente') { cam3.dist = Math.max(2.2, Math.min(9, cam3.dist + e.deltaY * 0.004)); e.preventDefault(); } }, { passive: false });
const raio = new THREE.Raycaster();
canvas.addEventListener('pointerup', (e) => {
  const foiClique = toque && !toque.moveu;
  toque = null;
  if (!foiClique) return;
  const r = canvas.getBoundingClientRect();
  raio.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
  const hit = raio.intersectObjects(clicaveis, false)[0];
  if (hit) selecionar(hit.object.userData.slug, modo === 'geral');
});
controles.addEventListener('start', () => { voo = null; if (girando) { girando = false; controles.autoRotate = false; atualizarBtnGirar(); } });

function atualizarControlado(dt, t) {
  const a = controlado, g = a.grupo;
  const fx = Math.sin(cam3.yaw), fz = Math.cos(cam3.yaw);
  const rx = -fz, rz = fx;
  let mx = 0, mz = 0;
  if (teclas.has('frente')) { mx += fx; mz += fz; }
  if (teclas.has('tras')) { mx -= fx; mz -= fz; }
  if (teclas.has('dir')) { mx += rx; mz += rz; }
  if (teclas.has('esq')) { mx -= rx; mz -= rz; }
  const len = Math.hypot(mx, mz);
  let pose = 'em_pe';
  if (len > 0) {
    const vel = teclas.has('correr') ? 4.4 : 2.5;
    mx /= len; mz /= len;
    const nx = Math.max(L.x0 - 8, Math.min(L.x1 + 8, g.position.x + mx * vel * dt));
    const nz = Math.max(L.z0 - 6, Math.min(L.z1 + 6, g.position.z + mz * vel * dt));
    if (livre(nx, g.position.z)) g.position.x = nx;
    if (livre(g.position.x, nz)) g.position.z = nz;
    g.rotation.y = lerpAng(g.rotation.y, Math.atan2(mx, mz), dt * 10);
    a.p.ciclo += dt * vel * 6.2;
    pose = 'andando';
  }
  posar(a.p, pose, t, a.fase, dt);
  // câmera atrás do personagem
  const alvo = new THREE.Vector3(g.position.x, 1.35, g.position.z);
  const desejada = posCamera3(alvo.y);
  cam3.pos.lerp(desejada, 1 - Math.exp(-dt * 12));
  camera.position.copy(cam3.pos);
  camera.lookAt(alvo);
}

// ---------- Anéis de progresso: REAL (etapas reportadas) × ESTIMADO (tempo ÷ duração esperada) ----------
const fmtMin = (ms) => ms < 90000 ? `${Math.round(ms / 1000)} s` : `${Math.round(ms / 60000)} min`;
const corta = (t, n) => (t.length > n ? t.slice(0, Math.max(1, n - 1)).trimEnd() + '…' : t);
// Texto do balão: "tarefa · etapa" (~50 caracteres). Tarefa = descrição do gancho; etapa = progresso.mjs.
function montarBalao(tarefa, etapa, concluido) {
  if (concluido) return '✔ concluído';
  const t = String(tarefa || '').replace(/\s+/g, ' ').trim(), e = String(etapa || '').replace(/\s+/g, ' ').trim();
  if (t && e) { const ec = corta(e, 22); return `${corta(t, 50 - 3 - ec.length)} · ${ec}`; }
  return corta(t || e, 50);
}
function atualizarBalao(a) {
  const fase = a.prog.visivel() ? a.prog.estado().fase : 'oculto';
  const concluido = fase === 'check';
  const etapa = a.dadosProg?.progresso?.etapa || '';
  const txt = fase === 'oculto' ? '' : montarBalao(a.tarefa, etapa, concluido);
  if (txt !== a.textoBalao) {
    a.textoBalao = txt;
    a.balao.textContent = txt;
    a.balao.title = txt ? `${a.perfil.nome}: ${a.tarefa || ''}${etapa ? ` · ${etapa}` : ''}` : '';
    a.balao.classList.toggle('oculto', !txt);
    a.balao.classList.toggle('ok', concluido);
    a.balao.style.setProperty('--cor', a.perfil.cor);
  }
}
function atualizarAneis(dt) {
  for (const a of agentes) {
    atualizarBalao(a);
    a.tag.classList.toggle('com-anel', a.prog.visivel());
    const d = a.dadosProg;
    if (!d || !a.prog.visivel() || a.status !== 'trabalhando') continue;
    const decorrido = Date.now() + d.desvio - d.inicio;
    if (d.progresso) {
      const p = d.progresso;
      const txt = p.total ? `${p.feito}/${p.total}` : `${Math.round(p.pct)}%`;
      a.progTexto = `progresso real ${txt}${p.etapa ? ` (${p.etapa})` : ''}`;
      a.prog.atualizar(dt, { modo: 'real', pct: p.pct, etapa: p.etapa, dica: `${a.perfil.nome}: progresso REAL ${txt}${p.etapa ? ` — ${p.etapa}` : ''}` });
    } else {
      const est = estimarPorTempo(decorrido, d.esperadoMs || 600000);
      const base = d.fonte === 'historico' ? `mediana de ${d.amostras} execução(ões) anterior(es)` : 'duração padrão, sem histórico';
      a.progTexto = `estimativa pelo tempo${est.demorando ? ' (demorando mais que o normal)' : ''}`;
      a.prog.atualizar(dt, { modo: 'estimado', pct: est.pct, demorando: est.demorando, dica: `${a.perfil.nome}: ESTIMATIVA pelo tempo (${fmtMin(decorrido)} de ~${fmtMin(d.esperadoMs || 600000)}; ${base}). Não é medida.` });
    }
  }
}

// ---------- Loop ----------
window.__escritorio = { get agentes() { return agentes; }, get controles() { return controles; }, mundo, camera, renderer }; // só para inspeção/depuração no console
const relogio = new THREE.Clock();
let ultimoSel = null;
function quadro() {
  const dt = Math.min(relogio.getDelta(), 0.05);
  const t = relogio.elapsedTime;

  for (const a of agentes) {
    if (a === controlado) continue;
    atualizarAgente(a, dt, t);
    if (a.anel.visible) a.anel.scale.setScalar(1 + Math.sin(t * 4) * 0.08);
  }
  if (controlado) {
    atualizarControlado(dt, t);
    if (controlado.anel.visible) controlado.anel.scale.setScalar(1 + Math.sin(t * 4) * 0.08);
    for (const a of agentes) a.rotObj.visible = a === controlado || a.anel.visible || a.prog.visivel() || a.grupo.position.distanceTo(controlado.grupo.position) < 9;
  } else {
    for (const a of agentes) a.rotObj.visible = true;
    if (voo) {
      voo.t += dt;
      const k = Math.min(voo.t / voo.dur, 1);
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      camera.position.lerpVectors(voo.p0, voo.p1, e);
      controles.target.lerpVectors(voo.a0, voo.a1, e);
      if (k >= 1) voo = null;
    } else if (selecionado && modo === 'geral') { // a câmera acompanha o agente selecionado quando ele passeia
      const p = selecionado.grupo.position;
      if (ultimoSel === selecionado) {
        const dx = p.x - ultimoSelPos.x, dz = p.z - ultimoSelPos.z;
        camera.position.x += dx; camera.position.z += dz; controles.target.x += dx; controles.target.z += dz;
      }
    }
    controles.update();
  }
  ultimoSel = selecionado && modo === 'geral' && !voo ? selecionado : null;
  if (ultimoSel) ultimoSelPos.copy(ultimoSel.grupo.position);

  atualizarAneis(dt);
  mundo.atualizar(camera, dt, t, agentes.map((a) => a.grupo.position));
  tvCerebro.desenhar(performance.now() / 1000);

  // de longe, os rótulos viram só uma bolinha colorida (passe o mouse ou clique para ver o nome)
  document.body.classList.toggle('longe', modo === 'geral' && camera.position.distanceTo(controles.target) > 34);

  renderer.render(cena, camera);
  rotulos.render(cena, camera);
  requestAnimationFrame(quadro);
}
const ultimoSelPos = new THREE.Vector3();
quadro();

// painéis começam logo abaixo da barra do topo (que pode quebrar em duas linhas)
const ajustarTopo = () => document.documentElement.style.setProperty('--topo', `${document.querySelector('.topo').getBoundingClientRect().bottom + 10}px`);
ajustarTopo();
addEventListener('resize', ajustarTopo);

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  rotulos.setSize(innerWidth, innerHeight);
});
