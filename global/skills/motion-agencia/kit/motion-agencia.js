/* Motion Agência — biblioteca de cenas e transições para HyperFrames (GSAP em linha do tempo pausada).
   Uso: <script src="assets/motion-agencia.js"></script> depois de carregar o GSAP.
   Regras: tempo SEMPRE absoluto na linha do tempo raiz (tl). Nada de Date.now/Math.random/repeat:-1.
   Tudo é função do tempo da timeline (cai bem no seek do render). Cores só por var(--...). */
(function () {
  const MA = (window.MA = {});
  const mk = (tag, cls, parent, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (/ma-(vig|grain|flash|sweep|flare|hud|floor)/.test(cls || "")) { e.setAttribute("data-layout-allow-occlusion", ""); e.setAttribute("data-layout-allow-overlap", ""); } if (html != null) e.innerHTML = html; if (parent) parent.appendChild(e); return e; };
  MA.mk = mk;
  // seeded rand (determinístico)
  let _s = 7; MA.rand = () => { _s = (_s * 16807) % 2147483647; return (_s - 1) / 2147483646; };
  MA.ease = { out: "expo.out", soft: "power3.out", back: "back.out(1.7)", in: "power3.in", io: "power2.inOut" };
  const px = (e, o) => Object.assign(e.style, o);

  /* ---- tempo por palavra: distribui palavras de um trecho [t0,t1] por peso (letras). Pausas ficam fora do trecho. ---- */
  MA.tempo = function (palavras, t0, t1) {
    const w = palavras.map(p => (typeof p === "string" ? p : p.w).replace(/[^\p{L}\p{N}]/gu, "").length + 1.2);
    const tot = w.reduce((a, b) => a + b, 0); let acc = 0;
    return palavras.map((p, i) => { const o = typeof p === "string" ? { w: p } : { ...p }; o.t = +(t0 + (t1 - t0) * acc / tot).toFixed(3); acc += w[i]; return o; });
  };

  /* ---- moldura HUD: rótulo de cena, relógio REC, cruzes, rodapé. cfg={marca,dur,cenas:[{t,foot}]} ---- */
  MA.hud = function (root, tl, cfg) {
    const h = mk("div", "ma-hud", root);
    ["tl", "tr", "bl", "br"].forEach(c => mk("div", "ma-cross ma-cross-" + c, h, "+"));
    const L = mk("div", "ma-lbl ma-lbl-tl", h), R = mk("div", "ma-lbl ma-lbl-tr", h), F = mk("div", "ma-lbl ma-lbl-foot", h);
    const p = { t: 0 }, pad = n => String(n).padStart(2, "0");
    const draw = () => {
      const t = p.t; let n = 0; cfg.cenas.forEach((c, i) => { if (t >= c.t - 1e-3) n = i; });
      L.textContent = cfg.marca + " / " + String(n + 1).padStart(3, "0");
      R.innerHTML = '<span class="ma-dot"></span>REC 00:' + pad(Math.floor(t / 60)) + ":" + pad(Math.floor(t % 60));
      F.textContent = cfg.cenas[n].foot || "";
    };
    draw();
    tl.to(p, { t: cfg.dur, duration: cfg.dur, ease: "none", onUpdate: draw }, 0);
    return h;
  };

  /* ---- acabamento ---- */
  MA.acabamento = function (root, tl, dur) {
    mk("div", "ma-vig", root);
    const g = mk("div", "ma-grain", root);
    tl.fromTo(g, { backgroundPosition: "0px 0px" }, { backgroundPosition: "-300px 300px", duration: dur, ease: "steps(" + Math.round(dur * 12) + ")" }, 0);
  };
  MA.chao = function (parent, tl, dur) {
    const f = mk("div", "ma-floor", parent);
    tl.fromTo(f, { backgroundPosition: "0px 0px" }, { backgroundPosition: "0px 900px", duration: dur, ease: "none" }, 0);
    return f;
  };
  /* câmera em micro-movimento: empurrão lento em `cam` + "chute" curto nos cortes em `kick` (dois elementos aninhados, senão os transforms brigam) */
  MA.camera = function (cam, kick, tl, dur, cortes = []) {
    tl.fromTo(cam, { scale: 1.0, x: 0 }, { scale: 1.06, x: -8, duration: dur, ease: "none", transformOrigin: "50% 50%" }, 0);
    cortes.forEach(t => tl.fromTo(kick, { scale: 1 }, { scale: 1.035, duration: 0.07, ease: "power2.out", yoyo: true, repeat: 1, transformOrigin: "50% 50%" }, t));
  };

  /* ---- transições ---- */
  MA.flare = function (root, tl, t, y = 960, dur = 0.9) {            // linha de luz horizontal que abre (abertura / loop)
    const f = mk("div", "ma-flare", root); px(f, { top: y + "px" });
    tl.fromTo(f, { opacity: 0, scaleX: 0.02 }, { opacity: 1, scaleX: 1, duration: dur * 0.5, ease: "expo.out", transformOrigin: "50% 50%" }, t)
      .to(f, { opacity: 0, scaleY: 6, duration: dur * 0.5, ease: "power2.in" }, t + dur * 0.5);
    return f;
  };
  MA.flash = function (root, tl, t, pico = 0.55, dur = 0.28) {       // flash de cor (usa --acc)
    const f = mk("div", "ma-flash", root);
    tl.fromTo(f, { opacity: 0 }, { opacity: pico, duration: dur * 0.2, ease: "power2.out" }, t).to(f, { opacity: 0, duration: dur * 0.8, ease: "power2.in" }, t + dur * 0.2);
  };
  MA.varredura = function (root, tl, t, dur = 0.6, de = -400, ate = 1500) { // varredura de luz diagonal
    const s = mk("div", "ma-sweep", root); px(s, { left: "0px", transform: "skewX(-18deg)" });
    tl.fromTo(s, { x: de, opacity: 0 }, { x: ate, opacity: 0.95, duration: dur, ease: "power2.inOut" }, t).to(s, { opacity: 0, duration: dur * 0.3 }, t + dur * 0.7);
  };
  /* mergulho em túnel de grade: anéis quadrados que crescem de dentro para fora (use no corte para a próxima cena) */
  MA.tunel = function (root, tl, t, dur = 0.7, n = 7) {
    const box = mk("div", "", root); px(box, { position: "absolute", inset: "0", zIndex: 62, pointerEvents: "none" });
    for (let i = 0; i < n; i++) {
      const r = mk("div", "", box); px(r, { position: "absolute", left: "50%", top: "50%", width: "160px", height: "284px", marginLeft: "-80px", marginTop: "-142px", border: "3px solid var(--acc)", boxShadow: "0 0 30px var(--glow)", opacity: 0 });
      const d = (i / n) * dur * 0.6;
      tl.fromTo(r, { scale: 0.2, opacity: 0 }, { scale: 14, opacity: 0.9, duration: dur * 0.5, ease: "power2.in" }, t + d).to(r, { opacity: 0, duration: dur * 0.2 }, t + d + dur * 0.4);
    }
  };

  /* ---- texto sincronizado com a fala ----
     linhas = [[{w:"Você",t:0.5},{w:"negócio",t:1.9,key:true,cls:"ma-big"}], ...]; saida = tempo em que o bloco some */
  MA.palavras = function (tl, parent, linhas, o = {}) {
    const box = mk("div", "ma-words " + (o.cls || ""), parent); px(box, { top: (o.top ?? 700) + "px" }); if (o.size) box.style.fontSize = o.size + "px";
    const lead = o.lead ?? 0.06;
    linhas.forEach(l => {
      const row = mk("div", "ma-line", box);
      l.forEach(w => {
        const s = mk("span", "ma-w " + (w.cls || ""), row, "<i>" + w.w + "</i>" + (w.key ? "<b>" + w.w + "</b>" : ""));
        tl.fromTo(s, { opacity: 0, y: 40, filter: "blur(16px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.34, ease: MA.ease.out }, w.t - lead);
        if (w.key) {
          const b = s.querySelector("b");
          tl.fromTo(b, { opacity: 0 }, { opacity: 1, duration: 0.12, ease: "power1.out" }, w.t);
          tl.fromTo(s, { scale: 1 }, { scale: 1.07, duration: 0.14, ease: "power2.out", yoyo: true, repeat: 1, transformOrigin: "50% 60%" }, w.t);
        }
      });
    });
    if (o.saida != null) tl.to(box, { opacity: 0, y: -26, filter: "blur(10px)", duration: 0.22, ease: "power2.in" }, o.saida);
    return box;
  };
  /* palavra com bloom enorme (a palavra-chave do vídeo) */
  MA.bloom = function (tl, parent, texto, t, o = {}) {
    const wrap = mk("div", "ma-words", parent); px(wrap, { top: (o.top ?? 800) + "px", fontSize: (o.size ?? 200) + "px" });
    const glow = mk("div", "ma-line", wrap, texto); px(glow, { color: "var(--acc)", filter: "blur(34px)", position: "absolute", left: 0, right: 0, opacity: 0 });
    const main = mk("div", "ma-line", wrap, texto); px(main, { color: "var(--acc)", textShadow: "0 0 40px var(--glow)", opacity: 0 });
    tl.fromTo(main, { opacity: 0, scale: 1.35, filter: "blur(18px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.5, ease: MA.ease.out }, t);
    tl.fromTo(glow, { opacity: 0, scale: 1.1 }, { opacity: 0.9, scale: 1, duration: 0.4, ease: "power2.out" }, t).to(glow, { opacity: 0.45, duration: 0.8, ease: "sine.inOut" }, t + 0.4);
    if (o.saida != null) tl.to(wrap, { opacity: 0, duration: 0.2 }, o.saida);
    return wrap;
  };
  /* "não é X, é Y": risca X com linha vermelha no tempo t */
  MA.riscar = function (tl, alvo, t, dur = 0.28) {
    alvo.style.position = "relative"; alvo.style.display = "inline-block"; const line = mk("div", "", alvo);
    px(line, { position: "absolute", left: "-4%", right: "-4%", top: "54%", height: "9px", background: "var(--warn)", boxShadow: "0 0 24px var(--warn)", borderRadius: "5px" });
    tl.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: dur, ease: "power3.out", transformOrigin: "0% 50%" }, t);
    tl.to(alvo.querySelectorAll("i"), { opacity: 0.38, duration: 0.25 }, t + dur * 0.5);
    return line;
  };

  /* ---- CENAS ---- */
  /* prompt digitando: caixa com cursor e texto mono. cfg={top,texto,t,dur,rotulo} */
  MA.prompt = function (tl, parent, c) {
    const box = mk("div", "", parent); px(box, { position: "absolute", left: "150px", width: "780px", top: c.top + "px", padding: "34px 38px", border: "3px solid var(--acc)", borderRadius: "22px", boxShadow: "0 0 50px var(--glow), inset 0 0 40px var(--line)", background: "rgba(0,0,0,.35)", fontFamily: "var(--f-mono)", color: "var(--txt)", fontSize: "40px", lineHeight: 1.3, opacity: 0 });
    mk("div", "", box, (c.rotulo || "PROMPT · 1 LINHA")).style.cssText = "font-size:22px;letter-spacing:.2em;color:var(--acc);margin-bottom:18px";
    const txt = mk("span", "", box); const cur = mk("span", "", box, "▌"); cur.style.color = "var(--acc)";
    const p = { n: 0 };
    tl.fromTo(box, { opacity: 0, y: 40, scale: .96 }, { opacity: 1, y: 0, scale: 1, duration: .4, ease: MA.ease.out }, c.t);
    tl.to(p, { n: c.texto.length, duration: c.dur, ease: "none", onUpdate() { txt.textContent = c.texto.slice(0, Math.round(p.n)); } }, c.t + .3);
    for (let k = 0; k < 12; k++) tl.set(cur, { opacity: k % 2 ? 1 : 0 }, c.t + .3 + k * .26);
    return box;
  };
  /* alvo/mira: anéis + cruz + (opcional) flecha que acerta o centro em t+0.5 */
  MA.alvo = function (tl, parent, c) {
    const g = mk("div", "", parent); px(g, { position: "absolute", left: (c.x ?? 540) - 260 + "px", top: (c.y ?? 900) - 260 + "px", width: "520px", height: "520px" });
    [520, 380, 240, 100].forEach((d, i) => { const r = mk("div", "", g); px(r, { position: "absolute", left: (520 - d) / 2 + "px", top: (520 - d) / 2 + "px", width: d + "px", height: d + "px", border: "3px solid var(--acc)", borderRadius: "50%", opacity: 0, boxShadow: i == 3 ? "0 0 40px var(--glow)" : "none" }); tl.fromTo(r, { opacity: 0, scale: 1.5 }, { opacity: 1 - i * .12, scale: 1, duration: .45, ease: MA.ease.out }, c.t + i * .08); });
    const h = mk("div", "", g); px(h, { position: "absolute", left: 0, right: 0, top: "259px", height: "2px", background: "var(--acc)", opacity: 0 }); const v = mk("div", "", g); px(v, { position: "absolute", top: 0, bottom: 0, left: "259px", width: "2px", background: "var(--acc)", opacity: 0 });
    tl.to([h, v], { opacity: .8, duration: .3 }, c.t + .3);
    if (c.flecha) { const a = mk("div", "", g, "➤"); px(a, { position: "absolute", left: "-120px", top: "210px", fontSize: "90px", color: "var(--acc2)", textShadow: "0 0 30px var(--glow)", opacity: 0 }); tl.fromTo(a, { x: -200, y: -200, opacity: 0 }, { x: 380, y: 50, opacity: 1, duration: .35, ease: "power3.in" }, c.t + .5); }
    return g;
  };
  /* blocos que se empilham: base (alicerce) enche, depois torre sobe. c={t,tBase,tTopo,base,topo,topY} */
  MA.blocos = function (tl, parent, c) {
    const baseY = c.baseY ?? 1080, W = 640, X = (1080 - W) / 2;
    const base = mk("div", "", parent); px(base, { position: "absolute", left: X + "px", top: baseY + "px", width: W + "px", height: "120px", border: "3px solid var(--acc)", background: "rgba(255,255,255,.04)", overflow: "hidden", boxShadow: "0 0 40px var(--glow)" });
    const fill = mk("div", "", base); px(fill, { position: "absolute", inset: 0, background: "linear-gradient(90deg,var(--acc),var(--acc2))", opacity: .92 });
    tl.fromTo(base, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .3, ease: MA.ease.out }, c.tBase - .25);
    tl.fromTo(fill, { scaleX: 0 }, { scaleX: 1, duration: .55, ease: "power3.out", transformOrigin: "0% 50%" }, c.tBase);
    const bl = mk("div", "ma-mono", parent, c.base); px(bl, { position: "absolute", left: X + "px", width: W + "px", top: baseY + 140 + "px", textAlign: "center", fontSize: "30px", color: "var(--acc)", opacity: 0 }); tl.fromTo(bl, { opacity: 0 }, { opacity: 1, duration: .25 }, c.tBase + .3);
    const wid = [520, 400, 280];
    wid.forEach((w, i) => {
      const b = mk("div", "", parent); px(b, { position: "absolute", left: (1080 - w) / 2 + "px", top: baseY - (i + 1) * 128 + "px", width: w + "px", height: "108px", border: "3px solid var(--acc2)", background: "linear-gradient(90deg,rgba(255,255,255,.06),var(--line))", boxShadow: "0 0 30px var(--glow)" });
      tl.fromTo(b, { opacity: 0, y: -260 }, { opacity: 1, y: 0, duration: .42, ease: "bounce.out" }, c.tTopo + i * .17);
    });
    const tl2 = mk("div", "ma-mono", parent, c.topo); px(tl2, { position: "absolute", left: X + "px", width: W + "px", top: baseY - 3 * 128 - 70 + "px", textAlign: "center", fontSize: "30px", color: "var(--acc2)", opacity: 0 }); tl.fromTo(tl2, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .3 }, c.tTopo + .5);
    return [base, bl, tl2];
  };
  /* tira de filme com marcador "quadro a quadro". c={t,top,dur} */
  MA.filme = function (tl, parent, c) {
    const strip = mk("div", "", parent); px(strip, { position: "absolute", left: "-40px", width: "1900px", top: c.top + "px", height: "230px", display: "flex", gap: "16px", opacity: 0 });
    for (let i = 0; i < 12; i++) { const f = mk("div", "", strip, "<span class=ma-mono style='font-size:22px;color:var(--dim)'>" + String(i + 1).padStart(2, "0") + "</span>"); px(f, { flex: "0 0 180px", border: "3px solid var(--line)", borderRadius: "10px", padding: "12px", background: "rgba(0,0,0,.3)" }); }
    const mark = mk("div", "", parent); px(mark, { position: "absolute", left: "538px", top: c.top - 40 + "px", width: "4px", height: "310px", background: "var(--acc)", boxShadow: "0 0 24px var(--glow)", opacity: 0 });
    tl.fromTo(strip, { opacity: 0 }, { opacity: 1, duration: .3 }, c.t).fromTo(strip, { x: 0 }, { x: -500, duration: c.dur, ease: "none" }, c.t); tl.to(mark, { opacity: 1, duration: .3 }, c.t + .2); return strip;
  };
  /* chuva de losangos (keyframes). c={t,dur,n} */
  MA.chuva = function (tl, parent, c) {
    const n = c.n ?? 60; for (let i = 0; i < n; i++) { const d = mk("div", "", parent); const s = 14 + MA.rand() * 22; px(d, { position: "absolute", left: 150 + MA.rand() * 780 + "px", top: "260px", width: s + "px", height: s + "px", background: i % 5 ? "var(--acc)" : "var(--acc2)", opacity: 0, boxShadow: "0 0 14px var(--glow)" });
      const t0 = c.t + MA.rand() * c.dur * .7; tl.fromTo(d, { opacity: 0, y: 0, rotation: 45 }, { opacity: .95, y: 700 + MA.rand() * 700, rotation: 45, duration: .9 + MA.rand() * .8, ease: "power1.in" }, t0).to(d, { opacity: 0, duration: .2 }, t0 + 1.0); }
  };
  /* cartões de referência que enchem um a um. c={t,top,itens:["Tipografia",...],passo} */
  MA.cartoes = function (tl, parent, c) {
    c.itens.forEach((nome, i) => {
      const k = mk("div", "", parent); px(k, { position: "absolute", left: "150px", width: "780px", top: c.top + i * 150 + "px", height: "124px", border: "3px solid var(--line)", borderRadius: "16px", background: "rgba(0,0,0,.35)", overflow: "hidden", opacity: 0 });
      const f = mk("div", "", k); px(f, { position: "absolute", inset: 0, background: "linear-gradient(90deg,var(--glow),transparent)" });
      const tx = mk("div", "ma-mono", k, nome); px(tx, { position: "absolute", left: "34px", top: "36px", fontSize: "38px", color: "var(--txt)" });
      const t = c.t + i * (c.passo ?? .5); tl.fromTo(k, { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: .35, ease: MA.ease.out }, t).fromTo(f, { scaleX: 0 }, { scaleX: 1, duration: .5, ease: "power2.out", transformOrigin: "0% 50%" }, t + .1).to(k, { borderColor: "var(--acc)", duration: .2 }, t + .5);
    });
  };
  /* antes × depois cortado por uma linha que varre. c={t,top,antes,depois,h} */
  MA.antesDepois = function (tl, parent, c) {
    const h = c.h ?? 560, box = mk("div", "", parent); px(box, { position: "absolute", left: "150px", width: "780px", top: c.top + "px", height: h + "px", border: "3px solid var(--line)", overflow: "hidden", borderRadius: "18px" });
    const A = mk("div", "ma-words", box, c.antes); px(A, { position: "absolute", left: 0, top: 0, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "70px", color: "var(--dim)", background: "rgba(0,0,0,.35)" });
    const D = mk("div", "ma-words", box, c.depois); px(D, { position: "absolute", left: 0, top: 0, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "70px", color: "var(--acc)", background: "var(--bg1)", textShadow: "0 0 40px var(--glow)" });
    const bar = mk("div", "", box); px(bar, { position: "absolute", top: 0, bottom: 0, width: "6px", left: 0, background: "var(--acc2)", boxShadow: "0 0 30px var(--glow)" });
    tl.fromTo(box, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: .35, ease: MA.ease.out }, c.t);
    tl.fromTo(D, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: .8, ease: "power3.inOut" }, c.t + .5).fromTo(bar, { x: 0 }, { x: 774, duration: .8, ease: "power3.inOut" }, c.t + .5).to(bar, { opacity: 0, duration: .2 }, c.t + 1.3);
  };
  /* logo (texto/ícone) com chips orbitando. c={t,x,y,logo,chips:[..]} — o logo vem do cliente, nunca da referência */
  MA.logoChips = function (tl, parent, c) {
    const x = c.x ?? 540, y = c.y ?? 900, core = mk("div", "", parent, c.logo); px(core, { position: "absolute", left: x - 110 + "px", top: y - 110 + "px", width: "220px", height: "220px", border: "4px solid var(--acc)", transform: "rotate(45deg)", display: "none" });
    core.style.display = "block"; core.innerHTML = "<div style='transform:rotate(-45deg);height:100%;display:flex;align-items:center;justify-content:center;font-family:var(--f-display);font-size:70px;color:var(--acc);text-shadow:0 0 30px var(--glow)'>" + c.logo + "</div>"; core.style.boxShadow = "0 0 60px var(--glow)"; tl.fromTo(core, { opacity: 0, scale: .4 }, { opacity: 1, scale: 1, duration: .5, ease: MA.ease.back }, c.t);
    c.chips.forEach((nome, i) => { const ang = i / c.chips.length * Math.PI * 2 - Math.PI / 2, ch = mk("div", "ma-mono", parent, nome); px(ch, { position: "absolute", left: x - 110 + "px", top: y - 28 + "px", width: "220px", textAlign: "center", padding: "12px 0", border: "2px solid var(--acc2)", borderRadius: "40px", fontSize: "26px", color: "var(--txt)", background: "rgba(0,0,0,.45)", opacity: 0 });
      tl.fromTo(ch, { opacity: 0, x: Math.cos(ang) * 700, y: Math.sin(ang) * 700 }, { opacity: 1, x: Math.cos(ang) * 330, y: Math.sin(ang) * 330, duration: .6, ease: MA.ease.out }, c.t + .4 + i * .12); });
  };
  /* arco gigante com pergunta (semicírculo que desenha e o texto dentro). c={t,top,texto} */
  MA.arco = function (tl, parent, c) {
    const NS = "http://www.w3.org/2000/svg", s = document.createElementNS(NS, "svg"); s.setAttribute("viewBox", "0 0 1000 560"); px(s, { position: "absolute", left: "40px", top: c.top + "px", width: "1000px", height: "560px", overflow: "visible" });
    const p = document.createElementNS(NS, "path"); p.setAttribute("d", "M40 540 A460 460 0 0 1 960 540"); p.setAttribute("fill", "none"); p.setAttribute("stroke", "var(--acc)"); p.setAttribute("stroke-width", "4"); p.setAttribute("pathLength", "1"); p.style.filter = "drop-shadow(0 0 14px var(--glow))"; s.appendChild(p); parent.appendChild(s);
    tl.fromTo(p, { strokeDasharray: "1 1", strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: .9, ease: "power2.inOut" }, c.t);
    const q = mk("div", "ma-words", parent, c.texto); px(q, { top: c.top + 230 + "px", fontSize: "76px", opacity: 0 }); tl.fromTo(q, { opacity: 0, y: 30, filter: "blur(12px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: .4, ease: MA.ease.out }, c.t + .5);
  };
  /* CTA: caixa de comentário digitando a palavra-chave + raios. c={t,top,texto,dur} */
  MA.cta = function (tl, parent, c) {
    const rays = mk("div", "", parent); px(rays, { position: "absolute", left: "-300px", top: c.top - 480 + "px", width: "1680px", height: "1680px", opacity: 0, background: "repeating-conic-gradient(from 0deg,var(--line) 0deg 2deg,transparent 2deg 16deg)", WebkitMaskImage: "radial-gradient(circle,#000 0%,transparent 62%)", maskImage: "radial-gradient(circle,#000 0%,transparent 62%)" });
    tl.fromTo(rays, { opacity: 0, rotation: 0 }, { opacity: .85, rotation: 40, duration: c.dur ?? 3, ease: "none" }, c.t);
    const box = mk("div", "", parent); px(box, { position: "absolute", left: "150px", width: "780px", top: c.top + "px", height: "150px", border: "3px solid var(--acc)", borderRadius: "75px", background: "rgba(0,0,0,.5)", boxShadow: "0 0 60px var(--glow)", display: "flex", alignItems: "center", padding: "0 48px", fontFamily: "var(--f-display)", fontSize: "72px", color: "var(--txt)", letterSpacing: "-.02em" });
    const txt = mk("span", "", box); const cur = mk("span", "", box, "▌"); cur.style.color = "var(--acc)"; const send = mk("div", "ma-mono", box, "ENVIAR"); px(send, { marginLeft: "auto", fontSize: "24px", color: "var(--acc)", border: "2px solid var(--acc)", borderRadius: "30px", padding: "10px 20px" });
    const p = { n: 0 }; tl.fromTo(box, { opacity: 0, y: 50, scale: .94 }, { opacity: 1, y: 0, scale: 1, duration: .45, ease: MA.ease.out }, c.t);
    tl.to(p, { n: c.texto.length, duration: c.digitar ?? .6, ease: "none", onUpdate() { txt.textContent = c.texto.slice(0, Math.round(p.n)); } }, c.t + .35);
    tl.fromTo(send, { scale: 1 }, { scale: 1.18, duration: .15, ease: "power2.out", yoyo: true, repeat: 1 }, c.t + .35 + (c.digitar ?? .6) + .15);
    return box;
  };
})();
