// TV de 100" da Sala do Gerente: o Segundo Cérebro (cofre do Obsidian) funcionando ao vivo.
// Lê /cerebro (servidor.mjs) a cada 4 s e desenha no canvas: rede de notas, pastas e atividade.
const CORES = {
  '01-Projetos': '#4F8EF7', '02-Padroes': '#3FB950', '03-Decisoes': '#F0883E', '04-Preferencias': '#DB61A2',
  '05-Stack': '#A371F7', '06-Aprendizados': '#E3B341', '07-Sessoes': '#8B949E',
};
const NOMES = {
  '01-Projetos': 'Projetos', '02-Padroes': 'Padrões', '03-Decisoes': 'Decisões', '04-Preferencias': 'Preferências',
  '05-Stack': 'Stack', '06-Aprendizados': 'Aprendizados', '07-Sessoes': 'Sessões',
};

export function iniciarTvCerebro(tela) {
  const { canvas, textura } = tela;
  const g = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  let dados = null, nos = [], ultimoDesenho = 0, pulsos = [], logAnterior = '';

  async function buscar() {
    try {
      const d = await (await fetch('/cerebro', { cache: 'no-store' })).json();
      if (!d.ativo) { dados = d; return; }
      // mantém a posição dos nós já conhecidos; nós novos nascem no centro do grupo da pasta
      const antigos = new Map(nos.map((n) => [n.t, n]));
      const pastas = Object.keys(CORES);
      nos = d.nos.map((n) => {
        const a = antigos.get(n.t);
        if (a) return Object.assign(a, n);
        const k = Math.max(0, pastas.indexOf(n.pasta));
        const ang = (k / pastas.length) * Math.PI * 2;
        return { ...n, x: 330 + Math.cos(ang) * 150 + (Math.random() - 0.5) * 40, y: 400 + Math.sin(ang) * 150 + (Math.random() - 0.5) * 40, vx: 0, vy: 0, nasceu: performance.now() };
      });
      const topo = (d.log[0] || '');
      if (logAnterior && topo !== logAnterior) pulsos.push({ t: performance.now(), texto: topo });
      logAnterior = topo;
      dados = d;
    } catch { dados = { ativo: false, offline: true }; }
  }
  buscar();
  setInterval(buscar, 4000);

  function fisica() {
    const pastas = Object.keys(CORES);
    for (const a of nos) {
      const k = Math.max(0, pastas.indexOf(a.pasta));
      const ang = (k / pastas.length) * Math.PI * 2 - Math.PI / 2;
      a.vx += (330 + Math.cos(ang) * 175 - a.x) * 0.004;
      a.vy += (405 + Math.sin(ang) * 175 - a.y) * 0.004;
      for (const b of nos) {
        if (a === b) continue;
        const dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy + 0.1;
        if (d2 < 3600) { a.vx += (dx / d2) * 30; a.vy += (dy / d2) * 30; }
      }
    }
    for (const [i, j] of dados.arestas) {
      const a = nos[i], b = nos[j]; if (!a || !b) continue;
      const dx = b.x - a.x, dy = b.y - a.y;
      a.vx += dx * 0.0008; a.vy += dy * 0.0008; b.vx -= dx * 0.0008; b.vy -= dy * 0.0008;
    }
    for (const n of nos) {
      n.vx *= 0.82; n.vy *= 0.82; n.x += n.vx; n.y += n.vy;
      n.x = Math.max(40, Math.min(620, n.x)); n.y = Math.max(150, Math.min(680, n.y));
    }
  }

  function desenhar(t) {
    const agora = performance.now();
    if (agora - ultimoDesenho < 66) return; // ~15 quadros por segundo bastam
    ultimoDesenho = agora;
    const fundo = g.createLinearGradient(0, 0, W, H);
    fundo.addColorStop(0, '#0b1020'); fundo.addColorStop(1, '#151b2e');
    g.fillStyle = fundo; g.fillRect(0, 0, W, H);
    g.textBaseline = 'alphabetic';
    g.fillStyle = '#ffffff'; g.font = '700 46px Inter, system-ui, sans-serif';
    g.fillText('🧠 SEGUNDO CÉREBRO', 40, 72);
    const vivo = 0.5 + 0.5 * Math.sin(t * 3);
    g.fillStyle = `rgba(34,197,94,${0.5 + vivo * 0.5})`; g.beginPath(); g.arc(W - 150, 56, 10, 0, 7); g.fill();
    g.fillStyle = '#86efac'; g.font = '600 26px Inter, system-ui, sans-serif'; g.fillText('AO VIVO', W - 128, 66);
    if (!dados || !dados.ativo) {
      g.fillStyle = '#94a3b8'; g.font = '500 30px Inter, system-ui, sans-serif';
      g.fillText(dados?.offline ? 'Sem conexão com o servidor do escritório' : 'Carregando o cofre…', 40, 160);
      textura.needsUpdate = true; return;
    }
    g.fillStyle = '#94a3b8'; g.font = '500 24px Inter, system-ui, sans-serif';
    g.fillText(`${dados.total} notas · ${dados.arestas.length} ligações · Obsidian`, 42, 110);

    // rede de notas
    fisica();
    g.lineWidth = 1.2;
    for (const [i, j] of dados.arestas) {
      const a = nos[i], b = nos[j]; if (!a || !b) continue;
      g.strokeStyle = 'rgba(148,163,184,0.22)'; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
    }
    // pulso viajando pelas ligações (o cérebro "pensando")
    const nA = dados.arestas.length;
    for (let k = 0; k < Math.min(6, nA); k++) {
      const [i, j] = dados.arestas[Math.floor((t * 0.7 + k * 7.3) % nA)];
      const a = nos[i], b = nos[j]; if (!a || !b) continue;
      const f = (t * 0.9 + k * 0.37) % 1;
      g.fillStyle = 'rgba(253,224,71,0.9)'; g.beginPath(); g.arc(a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f, 3.5, 0, 7); g.fill();
    }
    const recentes = new Set(dados.recentes.map((r) => r.t));
    for (const n of nos) {
      const cor = CORES[n.pasta] || '#cbd5e1';
      const novo = agora - (n.nasceu || 0) < 6000;
      const r = n.pasta === '01-Projetos' ? 11 : 7;
      if (recentes.has(n.t) || novo) {
        g.fillStyle = cor + '44'; g.beginPath(); g.arc(n.x, n.y, r + 7 + vivo * 5, 0, 7); g.fill();
      }
      g.fillStyle = cor; g.beginPath(); g.arc(n.x, n.y, r, 0, 7); g.fill();
      if (n.pasta === '01-Projetos') { g.fillStyle = '#e2e8f0'; g.font = '600 18px Inter, system-ui, sans-serif'; g.fillText(n.t, n.x + 14, n.y + 6); }
    }

    // pastas
    let y = 160;
    g.font = '600 26px Inter, system-ui, sans-serif';
    for (const [p, nome] of Object.entries(NOMES)) {
      const c = dados.contagem[p] || 0;
      g.fillStyle = CORES[p]; g.beginPath(); g.roundRect(690, y - 22, 16, 26, 4); g.fill();
      g.fillStyle = '#e2e8f0'; g.fillText(nome, 718, y);
      g.fillStyle = CORES[p]; g.globalAlpha = 0.35; g.fillRect(900, y - 18, Math.min(300, 12 + c * 18), 20); g.globalAlpha = 1;
      g.fillStyle = '#ffffff'; g.fillText(String(c), 906 + Math.min(300, 12 + c * 18), y);
      y += 40;
    }

    // atividade ao vivo (log do cérebro)
    y += 18;
    g.fillStyle = '#94a3b8'; g.font = '700 22px Inter, system-ui, sans-serif'; g.fillText('ATIVIDADE', 690, y); y += 34;
    g.font = '500 20px Inter, system-ui, sans-serif';
    for (const ln of dados.log.slice(0, 6)) {
      const hora = ln.slice(11, 16), msg = ln.slice(20)
        .replace(/^buscou:/, '🔎 consultou').replace(/^pediu registro na sessão:/, '✍️ registrando').replace(/^registrou/, '✅ registrou');
      g.fillStyle = '#64748b'; g.fillText(hora, 690, y);
      g.fillStyle = '#cbd5e1'; g.fillText(msg.length > 46 ? msg.slice(0, 45) + '…' : msg, 760, y);
      y += 30;
    }
    // aviso de atividade nova
    pulsos = pulsos.filter((p) => agora - p.t < 5000);
    if (pulsos.length) {
      const a = 1 - (agora - pulsos[0].t) / 5000;
      g.fillStyle = `rgba(253,224,71,${0.18 * a})`; g.fillRect(0, 0, W, H);
    }
    textura.needsUpdate = true;
  }
  return { desenhar };
}
