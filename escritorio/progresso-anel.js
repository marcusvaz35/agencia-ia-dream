// Anel de progresso circular (componente independente, sem Three.js).
// Uso:
//   const anel = criarAnel({ cor: '#3b82f6', onClick: () => ... });
//   algumElementoDom.prepend(anel.el);          // ex.: dentro da etiqueta que já segue a cabeça (CSS2DObject)
//   anel.iniciar(); anel.atualizar(dt, { modo: 'real'|'estimado', pct: 0..100, etapa, demorando });
//   anel.concluir();                            // preenche a 100%, mostra ✔ ~1,5 s, some com "pop"
//   anel.esconder();                            // some sem comemorar
// O tamanho na tela é constante (é um elemento HTML ancorado ao personagem), logo continua legível
// na vista aérea; a classe `body.longe` (CSS) aumenta um pouco quando a câmera está distante.
const TAM = 40;          // px (CSS)
const ESPESSURA = 5;     // px
const TEMPO_CHECK = 4;   // s mostrando ✔ (e o balão "concluído")

export function criarAnel({ cor = '#22c55e', onClick } = {}) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const el = document.createElement('div');
  el.className = 'anel-prog oculto';
  const cv = document.createElement('canvas');
  cv.width = cv.height = TAM * dpr;
  cv.style.width = cv.style.height = `${TAM}px`;
  const legenda = document.createElement('span');
  legenda.className = 'anel-leg';
  el.append(cv, legenda);
  if (onClick) el.addEventListener('click', (e) => { e.stopPropagation(); onClick(); });
  const ctx = cv.getContext('2d');
  ctx.scale(dpr, dpr);

  const e = { ativo: false, exibido: 0, alvo: 0, modo: 'estimado', demorando: false, fase: 'oculto', tFase: 0, t: 0, sujo: true, ultimo: '' };

  function desenhar() {
    const c = TAM / 2, r = (TAM - ESPESSURA) / 2 - 2;
    ctx.clearRect(0, 0, TAM, TAM);
    // disco escuro translúcido (fundo do texto) + trilho
    ctx.beginPath(); ctx.arc(c, c, r + ESPESSURA / 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(15,23,42,.78)'; ctx.fill();
    ctx.lineWidth = ESPESSURA; ctx.lineCap = 'butt';
    ctx.beginPath(); ctx.arc(c, c, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(148,163,184,.30)'; ctx.stroke();
    // arco: começa no topo, cresce no sentido horário
    const f = Math.max(0, Math.min(1, e.exibido));
    if (f > 0.004) {
      const ini = -Math.PI / 2, fim = ini + f * Math.PI * 2;
      ctx.lineCap = e.modo === 'real' || e.fase === 'check' ? 'round' : 'butt';
      ctx.strokeStyle = cor;
      ctx.setLineDash(e.modo === 'estimado' && e.fase !== 'check' ? [4.5, 3.2] : []); // tracejado = estimativa
      ctx.beginPath(); ctx.arc(c, c, r, ini, fim); ctx.stroke();
      ctx.setLineDash([]);
    }
    // centro
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if (e.fase === 'check') {
      ctx.font = '700 16px system-ui, sans-serif'; ctx.fillStyle = '#4ade80';
      ctx.fillText('✔', c, c + 1);
    } else {
      const n = Math.round(e.exibido * 100);
      const txt = (e.modo === 'estimado' ? '≈' : '') + n + '%';
      ctx.font = `700 ${txt.length > 4 ? 8.5 : 10}px system-ui, sans-serif`;
      ctx.fillText(txt, c, c + 1);
    }
  }

  e.iniciar = () => {
    if (e.ativo) return;
    e.ativo = true; e.exibido = 0; e.alvo = 0; e.fase = 'entrando'; e.tFase = 0; e.demorando = false;
    el.classList.remove('oculto', 'saindo', 'check'); el.classList.add('pop-entra');
    e.sujo = true;
  };
  e.atualizar = (dt, { modo, pct, etapa = '', demorando = false, dica = '' }) => {
    if (!e.ativo || e.fase === 'check' || e.fase === 'saindo') return;
    e.t += dt; e.tFase += dt;
    if (e.fase === 'entrando' && e.tFase > 0.3) { e.fase = 'ativo'; el.classList.remove('pop-entra'); }
    if (modo !== e.modo) { e.modo = modo; e.sujo = true; }
    e.alvo = Math.max(0, Math.min(1, pct / 100));
    // easing exponencial: suave e independente do FPS
    const k = 1 - Math.exp(-dt * 5);
    const antes = e.exibido;
    e.exibido += (e.alvo - e.exibido) * k;
    if (Math.abs(e.alvo - e.exibido) < 0.0015) e.exibido = e.alvo;
    if (demorando !== e.demorando) { e.demorando = demorando; el.classList.toggle('demora', demorando); legenda.textContent = demorando ? 'demorando mais que o normal' : ''; }
    const chave = etapa + '|' + dica;
    if (chave !== e.ultimo) { e.ultimo = chave; el.title = dica || etapa; legenda.dataset.etapa = etapa; }
    if (e.exibido !== antes || e.sujo) { desenhar(); e.sujo = false; }
  };
  e.concluir = () => {
    if (!e.ativo || e.fase === 'check' || e.fase === 'saindo') return;
    e.fase = 'check'; e.tFase = 0; e.alvo = e.exibido = 1; e.modo = 'real';
    legenda.textContent = ''; el.classList.remove('demora', 'pop-entra'); el.classList.add('check');
    desenhar();
    setTimeout(() => e.esconder(true), TEMPO_CHECK * 1000);
  };
  e.esconder = (comPop = false) => {
    if (!e.ativo) return;
    e.fase = 'saindo';
    el.classList.remove('pop-entra');
    if (!comPop) { fim(); return; }
    el.classList.add('saindo');
    setTimeout(fim, 260);
  };
  function fim() { e.ativo = false; e.fase = 'oculto'; el.classList.add('oculto'); el.classList.remove('saindo', 'check', 'demora'); legenda.textContent = ''; }
  e.el = el;
  e.visivel = () => e.ativo;
  e.estado = () => ({ ativo: e.ativo, fase: e.fase, modo: e.modo, exibido: e.exibido, demorando: e.demorando });
  return e;
}

// Estimativa honesta: tempo decorrido ÷ duração esperada (mediana do histórico do agente), com teto de 95%.
// Passou do esperado: fica em 95% e marca "demorando".
export function estimarPorTempo(decorridoMs, esperadoMs) {
  const x = decorridoMs / Math.max(esperadoMs, 1000);
  return x >= 1 ? { pct: 95, demorando: true } : { pct: 95 * x, demorando: false };
}
