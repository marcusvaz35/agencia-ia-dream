// Escritório da Agência — FASE 1 (refeita em 13/11/2026 depois da reprovação do CEO).
// Planta compacta (36 x 22 m) de UM andar copiando a referência (ver INVENTARIO-REFERENCIA.md):
//   fundo: Sala de reunião | Gerência | Arquivo/descanso ; corredor de vidro com tapete vermelho ;
//   meio: Sala de apoio | Lounge (2 sinucas, pebolim, sofás) ; frente: Cozinha | Banheiros/Depósito | Recepção ;
//   direita (metade da casa): Salão aberto com 3 bancadas e telão.
// x → leste, z → sul (câmera). Portas abrem sozinhas quando alguém se aproxima.
// Paredes, portas, pisos, luz e a maior parte dos props = geometria própria; móveis extras = Kenney Furniture Kit (CC0, ver modelos/pacotes/LICENCAS.md).
// API usada por escritorio.js: criarMundo(equipe) (async) → { cena, colisores, salas, pois, zonas, rota, atualizar(camera,dt,t,pessoas), definirNoite, telaCerebro, limites, centro }
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export const SALAS = {}; // nomes das zonas (e baias) para a interface

// ---------- medidas da planta ----------
const X0 = -18, X1 = 18, Z0 = -11, Z1 = 11;   // contorno externo
const ALT = 2.7, DH = 2.1;                     // altura das paredes e das portas

// ---------- pacote de móveis CC0 (Kenney) ----------
const NOMES_KIT = ['books', 'bookcaseOpen', 'bookcaseClosedWide', 'bookcaseOpenLow', 'cabinetTelevision', 'cardboardBoxClosed', 'cardboardBoxOpen', 'chairRounded', 'chairModernCushion', 'coatRackStanding',
  'computerKeyboard', 'computerMouse', 'laptop', 'kitchenCabinet', 'kitchenCabinetDrawer', 'kitchenCabinetUpper', 'kitchenCabinetUpperDouble', 'kitchenCoffeeMachine', 'kitchenFridgeLarge', 'kitchenFridge', 'kitchenMicrowave', 'kitchenSink', 'kitchenStove', 'toaster', 'kitchenBlender',
  'lampRoundFloor', 'lampRoundTable', 'lampSquareTable', 'lampSquareFloor', 'loungeSofa', 'loungeSofaLong', 'loungeChair', 'loungeDesignSofa', 'pillow', 'pillowBlue', 'plantSmall1', 'plantSmall2', 'plantSmall3', 'pottedPlant',
  'rugRectangle', 'rugRound', 'sideTable', 'sideTableDrawers', 'stoolBar', 'tableCoffee', 'tableRound', 'table', 'televisionModern', 'toilet', 'bathroomSink', 'bathroomMirror', 'trashcan', 'washerDryerStacked', 'speaker', 'radio', 'coatRack', 'desk', 'deskCorner', 'bench', 'benchCushion', 'tableCoffeeSquare', 'lampWall', 'cabinetBed', 'dryer', 'hoodLarge', 'kitchenBar', 'ceilingFan'];
export const KIT = {};
export async function carregarKit() {
  const loader = new GLTFLoader();
  await Promise.all(NOMES_KIT.map((n) => new Promise((res) => loader.load(`modelos/pacotes/kenney-furniture-kit/glb/${n}.glb`, (g) => {
    const o = g.scene; o.userData.caixa = new THREE.Box3().setFromObject(o); KIT[n] = o; res();
  }, undefined, () => res()))));
}

export const mat = (cor, rug = 0.7, met = 0, extra = {}) => new THREE.MeshStandardMaterial({ color: cor, roughness: rug, metalness: met, ...extra });

function canvasTex(w, h, desenhar, repetir) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  desenhar(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  if (repetir) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repetir); }
  return t;
}
const rep = (tex, rx, rz) => { const t = tex.clone(); t.needsUpdate = true; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, rz); return t; };
let semente = 7; const alea = () => { semente = (semente * 16807) % 2147483647; return (semente - 1) / 2147483646; };

// ---------- texturas ----------
function texMadeira(base = [206, 166, 122]) { // piso de madeira clara em espinha (chevron)
  return canvasTex(256, 256, (g, w, h) => {
    const P = 128, B = 16;
    g.fillStyle = '#7a5230'; g.fillRect(0, 0, w, h);
    const cor = (k, m) => { const v = ((k * 37 + m * 91) % 17) / 17; const f = 0.86 + v * 0.26; return `rgb(${base[0] * f | 0},${base[1] * f | 0},${base[2] * f | 0})`; };
    for (let px = 0; px < w; px += P) for (let half = 0; half < 2; half++) for (let k = -4; k < h / B + 4; k++) {
      const xa = half * 64, xb = xa + 64;
      const f = (x) => (half === 0 ? x * 0.5 : (128 - x) * 0.5);
      const kk = ((k % 16) + 16) % 16;
      g.fillStyle = cor(kk, half);
      g.beginPath();
      g.moveTo(px + xa, f(xa) + B * k); g.lineTo(px + xb, f(xb) + B * k);
      g.lineTo(px + xb, f(xb) + B * (k + 1)); g.lineTo(px + xa, f(xa) + B * (k + 1)); g.closePath(); g.fill();
      g.strokeStyle = 'rgba(40,22,10,.35)'; g.lineWidth = 1.2; g.stroke();
    }
  });
}
function texCarpete(cor = [88, 26, 34]) { // carpete vinho com retângulos mais claros (padrão do salão da referência)
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = `rgb(${cor[0]},${cor[1]},${cor[2]})`; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) { g.fillStyle = `rgba(190,80,60,${0.10 + alea() * 0.16})`; g.fillRect(alea() * w, alea() * h, 8 + alea() * 22, 5 + alea() * 9); }
    for (let i = 0; i < 4000; i++) { const v = alea() * 0.5 - 0.25; g.fillStyle = v > 0 ? `rgba(255,170,150,${v * 0.18})` : `rgba(0,0,0,${-v * 0.5})`; g.fillRect(alea() * w, alea() * h, 2, 2); }
  });
}
function texTabuas() { // piso de tábuas largas (lounge)
  return canvasTex(256, 256, (g, w, h) => {
    for (let i = 0; i < 8; i++) { const v = 0.9 + ((i * 53) % 7) / 40; g.fillStyle = `rgb(${210 * v | 0},${168 * v | 0},${120 * v | 0})`; g.fillRect(0, i * 32, w, 32); g.fillStyle = 'rgba(70,40,20,.45)'; g.fillRect(0, i * 32, w, 2);
      const off = (i * 97) % 200 + 20; g.fillRect(off, i * 32, 2, 32); }
  });
}
function texRipas() { // parede de ripas de madeira escura (placa da recepção)
  return canvasTex(256, 128, (g, w, h) => { g.fillStyle = '#4a2f1d'; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 32) { g.fillStyle = '#c9a070'; g.fillRect(x + 22, 0, 9, h); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(x, 0, 3, h); } });
}
function texIcone(tipo) { // placas de banheiro / acessibilidade
  return canvasTex(128, 128, (g, w, h) => {
    g.fillStyle = tipo === 'acess' ? '#1d4a8a' : '#2b2b30'; g.fillRect(0, 0, w, h); g.fillStyle = '#fff'; g.strokeStyle = '#fff'; g.lineWidth = 8; g.lineCap = 'round';
    if (tipo === 'acess') { g.beginPath(); g.arc(58, 30, 10, 0, 7); g.fill(); g.beginPath(); g.moveTo(58, 44); g.lineTo(58, 78); g.lineTo(88, 78); g.lineTo(98, 106); g.stroke(); g.beginPath(); g.arc(56, 88, 24, 0.8, 4.6); g.stroke(); }
    else { g.beginPath(); g.arc(64, 30, 13, 0, 7); g.fill(); if (tipo === 'f') { g.beginPath(); g.moveTo(64, 46); g.lineTo(40, 96); g.lineTo(88, 96); g.closePath(); g.fill(); } else { g.fillRect(48, 48, 32, 52); g.fillRect(48, 100, 12, 20); g.fillRect(68, 100, 12, 20); } }
  });
}
function texPiso() { return canvasTex(64, 64, (g, w, h) => { g.fillStyle = '#f0c419'; g.fillRect(0, 0, w, h); g.fillStyle = '#222'; g.font = '900 30px sans-serif'; g.textAlign = 'center'; g.fillText('!', 32, 44); }); }
function texLadrilho() {
  return canvasTex(128, 128, (g, w, h) => {
    g.fillStyle = '#b9b6ae'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#aaa79e'; g.fillRect(0, 0, w / 2, h / 2); g.fillRect(w / 2, h / 2, w / 2, h / 2);
    g.strokeStyle = '#a8a59b'; g.lineWidth = 2; g.strokeRect(0, 0, w, h); g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.moveTo(0, h / 2); g.lineTo(w, h / 2); g.stroke();
  });
}
function texGrama() {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#0d1c14'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 3500; i++) { g.fillStyle = `rgba(${20 + alea() * 30 | 0},${50 + alea() * 40 | 0},${28 + alea() * 20 | 0},${0.25 + alea() * 0.3})`; g.fillRect(alea() * w, alea() * h, 2 + alea() * 3, 2 + alea() * 3); }
  });
}
function texCalcada() {
  return canvasTex(128, 128, (g, w, h) => {
    g.fillStyle = '#7d7f86'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(255,255,255,${alea() * 0.06})`; g.fillRect(alea() * w, alea() * h, 3, 3); }
    g.strokeStyle = '#5c5e65'; g.lineWidth = 3; g.strokeRect(0, 0, w, h);
  });
}
function texTapete(c1, c2) {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = c1; g.fillRect(0, 0, w, h);
    g.strokeStyle = c2; g.lineWidth = 10; g.strokeRect(14, 14, w - 28, h - 28);
    g.lineWidth = 3; g.strokeRect(34, 34, w - 68, h - 68);
    g.fillStyle = c2; g.globalAlpha = 0.35; g.beginPath(); g.arc(w / 2, h / 2, 50, 0, 7); g.fill();
  });
}
function texJanelas() { // parede externa: reboco escuro + faixas de janela que brilham (mapa emissivo à parte)
  const cor = canvasTex(256, 128, (g, w, h) => {
    g.fillStyle = '#4a4036'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(0,0,0,${alea() * 0.12})`; g.fillRect(alea() * w, alea() * h, 3, 3); }
    g.fillStyle = '#1d2330'; g.fillRect(20, 26, 216, 66);
    g.fillStyle = '#2b2118'; g.fillRect(126, 26, 4, 66); g.fillRect(20, 58, 216, 3);
  });
  const emi = canvasTex(256, 128, (g, w, h) => {
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
    const gr = g.createLinearGradient(0, 26, 0, 92); gr.addColorStop(0, '#ffb45c'); gr.addColorStop(1, '#c4742a');
    g.fillStyle = gr; g.fillRect(20, 26, 216, 66);
    g.fillStyle = '#000'; g.fillRect(126, 26, 4, 66); g.fillRect(20, 58, 216, 3);
  });
  return { cor, emi };
}
function texPersiana() { // vidro com persiana horizontal (parte de cima mais fechada)
  return canvasTex(64, 256, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    for (let y = 0; y < h * 0.62; y += 8) { g.fillStyle = 'rgba(214,196,164,0.86)'; g.fillRect(0, y, w, 5.5); g.fillStyle = 'rgba(90,70,50,0.5)'; g.fillRect(0, y + 5.5, w, 1.5); }
    g.fillStyle = 'rgba(140,190,215,0.16)'; g.fillRect(0, h * 0.62, w, h * 0.38);
  });
}
function texPlaca(texto, sub) {
  return canvasTex(1024, 256, (g, w, h) => {
    g.fillStyle = '#2a1a10'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#c9975a'; g.lineWidth = 6; g.strokeRect(10, 10, w - 20, h - 20);
    g.fillStyle = '#f4ead9'; g.font = '800 104px Inter, system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(texto, w / 2, h / 2 - 14);
    g.fillStyle = '#d8a867'; g.font = '600 34px Inter, system-ui, sans-serif'; g.fillText(sub, w / 2, h - 58);
  });
}
function texRelatorio() { // telão "RELATÓRIO DO PROJETO" (barras abstratas, sem números inventados)
  return canvasTex(1024, 576, (g, w, h) => {
    g.fillStyle = '#0c1220'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#1b2742'; g.fillRect(0, 0, w, 84);
    g.fillStyle = '#fff'; g.font = '800 46px Inter, system-ui, sans-serif'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText('RELATÓRIO DO PROJETO', 40, 44);
    g.fillStyle = '#f59e0b'; g.fillRect(w - 180, 26, 140, 32);
    const cores = ['#38bdf8', '#34d399', '#f59e0b', '#f472b6'];
    for (let c = 0; c < 4; c++) {
      const x = 50 + c * 235; g.fillStyle = '#16203a'; g.fillRect(x, 120, 205, 150);
      g.fillStyle = cores[c]; g.fillRect(x + 14, 134, 90, 12);
      g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(x + 14, 160, 150, 8); g.fillRect(x + 14, 178, 110, 8);
    }
    for (let i = 0; i < 12; i++) { const bh = 40 + ((i * 53) % 150); g.fillStyle = cores[i % 4]; g.fillRect(60 + i * 38, 540 - bh, 26, bh); }
    g.strokeStyle = '#38bdf8'; g.lineWidth = 5; g.beginPath(); for (let i = 0; i < 12; i++) { const y = 470 - i * 16 - ((i * 37) % 30); i ? g.lineTo(540 + i * 38 * 0.9, y - 20) : g.moveTo(540, y); } g.stroke();
  });
}
function texQuadroGrafico() { // flip-chart / quadro com gráfico
  return canvasTex(256, 320, (g, w, h) => {
    g.fillStyle = '#f5f3ec'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#2c3a55'; g.lineWidth = 4; g.beginPath(); g.moveTo(30, 40); g.lineTo(30, 270); g.lineTo(230, 270); g.stroke();
    g.strokeStyle = '#c4382e'; g.lineWidth = 6; g.beginPath(); g.moveTo(40, 240); g.lineTo(90, 200); g.lineTo(130, 215); g.lineTo(180, 120); g.lineTo(222, 70); g.stroke();
    g.fillStyle = '#2f7d6b'; for (let i = 0; i < 4; i++) g.fillRect(48 + i * 44, 270 - 30 - i * 28, 24, 30 + i * 28);
  });
}
function texAvisos() { // quadro de avisos de cortiça
  return canvasTex(256, 192, (g, w, h) => {
    g.fillStyle = '#b5834f'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 700; i++) { g.fillStyle = `rgba(${60 + alea() * 40 | 0},35,15,${alea() * 0.25})`; g.fillRect(alea() * w, alea() * h, 3, 2); }
    const cs = ['#fff6d6', '#cfe8ff', '#ffd1d1', '#d6ffd9', '#fff'];
    for (let i = 0; i < 9; i++) { g.fillStyle = cs[i % 5]; g.save(); g.translate(20 + (i % 3) * 78, 18 + Math.floor(i / 3) * 56); g.rotate((alea() - 0.5) * 0.2); g.fillRect(0, 0, 58, 44); g.fillStyle = '#c33'; g.fillRect(26, -2, 6, 6); g.restore(); }
  });
}
function texGlow() { // piscina de luz no chão
  return canvasTex(128, 128, (g, w, h) => {
    const r = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    r.addColorStop(0, 'rgba(255,190,110,1)'); r.addColorStop(0.45, 'rgba(255,150,70,.45)'); r.addColorStop(1, 'rgba(255,120,40,0)');
    g.fillStyle = r; g.fillRect(0, 0, w, h);
  });
}


export async function criarMundo(equipe) {
  await carregarKit();
  const cena = new THREE.Scene();
  const neon = [], paredes = [], colisores = [], animados = [], pools = [], luzesPonto = [], portas = [];
  const grupo = (x, z, rot = 0, y = 0, p = cena) => { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = rot; p.add(g); return g; };
  const caixa = (w, h, d, m, x, y, z, p = cena, sombra = true) => {
    const me = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    me.position.set(x, y + h / 2, z); me.castShadow = sombra; me.receiveShadow = true; p.add(me); return me;
  };
  const caixaR = (w, h, d, m, x, y, z, p = cena, r = 0.04) => {
    const me = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001)), m);
    me.position.set(x, y + h / 2, z); me.castShadow = true; me.receiveShadow = true; p.add(me); return me;
  };
  const cil = (r1, r2, h, m, x, y, z, p = cena, seg = 20) => {
    const me = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg), m);
    me.position.set(x, y + h / 2, z); me.castShadow = true; me.receiveShadow = true; p.add(me); return me;
  };
  const emissivo = (cor, k = 1.4) => { const m = new THREE.MeshStandardMaterial({ color: cor, emissive: cor, emissiveIntensity: k, roughness: 0.5 }); neon.push(m); return m; };
  const colisor = (x, z, w, d) => colisores.push({ x0: x - w / 2, x1: x + w / 2, z0: z - d / 2, z1: z + d / 2 });
  const colisorR = (x, z, w, d, rot) => { const q = Math.abs(Math.sin(rot)) > 0.7; colisor(x, z, q ? d : w, q ? w : d); };
  const plano = (w, h, m, x, y, z, ry = 0, p = cena) => { const me = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); me.position.set(x, y, z); me.rotation.y = ry; p.add(me); return me; };
  const basico = (map) => new THREE.MeshBasicMaterial({ map, toneMapped: false });

  // ---------- materiais (paleta quente: madeira, vinho, bege, verde-azulado, preto fosco) ----------
  const PRETO = mat('#15161a', 0.75, 0.15), CINZA = mat('#3b3e46', 0.6, 0.25), METAL = mat('#a4a9b2', 0.35, 0.8), QUADRO = mat('#3a2e2a', 0.6, 0.2);
  const MAD = mat('#a8703f', 0.55), MAD_ESC = mat('#4f301c', 0.6), MAD_CL = mat('#d2a56d', 0.6), BEGE_MESA = mat('#cdbd9c', 0.7);
  const TEAL = mat('#3d8a8f', 0.85), TEAL_ESC = mat('#2a6a70', 0.85), BEGE = mat('#d9c8aa', 0.9), BRANCO = mat('#eeeae1', 0.65);
  const LARANJA = mat('#e0702a', 0.9), VERMELHO = mat('#b3262c', 0.75), AZUL = mat('#2b5aa8', 0.9), VERDE_F = mat('#2f8a52', 0.8), VERDE_F2 = mat('#3ca060', 0.8), VASO = mat('#e4ddd0', 0.7), VASO_PRETO = mat('#17181b', 0.6);
  const PAREDE_BEGE = mat('#cdb48f', 0.92), PAREDE_VINHO = mat('#4b1b1d', 0.95), TAMPA = mat('#8b7a66', 0.8);
  const texPers = texPersiana();
  const vidroMats = [];
  const vidroPers = (comp) => { const m = new THREE.MeshBasicMaterial({ map: rep(texPers, Math.max(1, comp / 1.6), 1), transparent: true, depthWrite: false, side: THREE.DoubleSide }); vidroMats.push(m); return m; };
  const vidroLiso = new THREE.MeshStandardMaterial({ color: 0x9cc7e0, transparent: true, opacity: 0.22, roughness: 0.05, metalness: 0.1, depthWrite: false, side: THREE.DoubleSide });

  // ---------- móveis Kenney (CC0): ajusta tamanho por altura/largura e coloca no chão ----------
  function K(nome, x, z, o = {}) {
    const base = KIT[nome]; if (!base) return null;
    const b = base.userData.caixa, sz = b.getSize(new THREE.Vector3());
    let s = o.s ?? 1;
    if (o.h) s = o.h / sz.y; else if (o.w) s = o.w / sz.x; else if (o.d) s = o.d / sz.z;
    const inner = base.clone(true);
    inner.position.set(-(b.min.x + b.max.x) / 2, -b.min.y, -(b.min.z + b.max.z) / 2);
    const g = new THREE.Group(); g.add(inner);
    g.scale.setScalar(s); g.rotation.y = o.rot || 0; g.position.set(x, o.y || 0, z); (o.p || cena).add(g);
    inner.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    if (o.col) colisorR(x, z, sz.x * s, sz.z * s, o.rot || 0);
    g.userData.tam = [sz.x * s, sz.y * s, sz.z * s];
    return g;
  }

  // ---------- equipe e baias ----------
  const gerente = equipe.find((e) => e.slug === 'gerente-geral') || equipe[0];
  const demais = equipe.filter((e) => e !== gerente);
  const LADOS_N = 6;
  const cols = Math.max(5, Math.ceil(demais.length / LADOS_N) + 1);
  const PITCH = 1.75, BX0 = 6.0;
  const FIM_BAIAS = BX0 + (cols - 1) * PITCH + 0.9;
  const EXG = FIM_BAIAS + 0.9;   // corredor leste entre as baias
  const limites = { x0: X0, x1: X1, z0: Z0, z1: Z1 };
  const centro = new THREE.Vector3(0, 0, 0);

  // ---------- céu, chão, calçada, árvores ----------
  const ceuDia = new THREE.Color(0xc9dcef), ceuNoite = new THREE.Color(0x070b16);
  cena.background = ceuNoite.clone();
  cena.fog = new THREE.Fog(0x070b16, 70, 190);
  const gramaM = new THREE.MeshStandardMaterial({ map: rep(texGrama(), 80, 80), roughness: 1 });
  const grama = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), gramaM);
  grama.rotation.x = -Math.PI / 2; grama.position.y = -0.04; grama.receiveShadow = true; cena.add(grama);
  const calcadaTex = texCalcada();
  const calcada = (x0, z0, x1, z1) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), new THREE.MeshStandardMaterial({ map: rep(calcadaTex, (x1 - x0) / 2, (z1 - z0) / 2), roughness: 0.9 }));
    m.rotation.x = -Math.PI / 2; m.position.set((x0 + x1) / 2, -0.01, (z0 + z1) / 2); m.receiveShadow = true; cena.add(m);
  };
  calcada(X0 - 3, Z1, X1 + 3.5, Z1 + 3.2); calcada(X1, Z0 - 3, X1 + 3.5, Z1); calcada(X0 - 3, Z0 - 3, X0, Z1); calcada(-2.4, Z1 + 3.2, 0.4, Z1 + 12);
  { const N = 150, copa = new THREE.InstancedMesh(new THREE.ConeGeometry(1.5, 4.2, 7), mat('#1d4a30', 0.95), N * 2), tronco = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.18, 0.24, 1.2, 6), mat('#2a1c12', 1), N);
    const m4 = new THREE.Matrix4(), cor = new THREE.Color(); let k = 0, t = 0;
    while (t < N) {
      const x = X0 - 30 + alea() * (X1 - X0 + 60), z = Z0 - 28 + alea() * (Z1 - Z0 + 56);
      if (x > X0 - 7 && x < X1 + 8 && z > Z0 - 7 && z < Z1 + 15) continue;
      const s = 0.65 + alea() * 0.8;
      m4.makeScale(s, s, s); m4.setPosition(x, 0.6 * s, z); tronco.setMatrixAt(t, m4);
      m4.makeScale(s, s, s); m4.setPosition(x, 2.6 * s, z); copa.setMatrixAt(k, m4); cor.setHSL(0.36 + alea() * 0.06, 0.45, 0.1 + alea() * 0.05); copa.setColorAt(k++, cor);
      m4.makeScale(s * 0.72, s * 0.72, s * 0.72); m4.setPosition(x, 4.3 * s, z); copa.setMatrixAt(k, m4); copa.setColorAt(k++, cor);
      t++;
    }
    copa.count = k; copa.instanceMatrix.needsUpdate = true; if (copa.instanceColor) copa.instanceColor.needsUpdate = true; tronco.instanceMatrix.needsUpdate = true;
    cena.add(copa, tronco); }
  const GLOW = texGlow();
  function pool(x, z, r, op = 0.5) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(r * 2, r * 2), new THREE.MeshBasicMaterial({ map: GLOW, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.position.set(x, 0.03, z); m.userData.op = op; cena.add(m); pools.push(m); return m;
  }
  const postes = [];
  for (let x = X0 - 1; x <= X1 + 3; x += 8) postes.push([x, Z1 + 3.0]);
  postes.push([X1 + 3.0, -6], [X1 + 3.0, 2], [X0 - 2.6, -4], [X0 - 2.6, 5]);
  for (const [x, z] of postes) {
    cil(0.06, 0.07, 3.6, PRETO, x, 0, z, cena, 8);
    const cab = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 8), emissivo('#ffc873', 2)); cab.position.set(x, 3.7, z); cena.add(cab);
    pool(x, z, 3.6, 0.5);
  }
  // mobiliário de calçada: banco de praça, bicicletário, ar-condicionado externo
  { const bc = grupo(-9, Z1 + 1.6); caixa(1.6, 0.06, 0.45, MAD, 0, 0.45, 0, bc); caixa(1.6, 0.5, 0.05, MAD, 0, 0.55, -0.2, bc); for (const lx of [-0.7, 0.7]) caixa(0.06, 0.45, 0.4, PRETO, lx, 0, 0, bc);
    for (let i = 0; i < 4; i++) { const a = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.025, 6, 14, Math.PI), METAL); a.position.set(8 + i * 0.5, 0.28, Z1 + 1.6); cena.add(a); }
    caixa(1.2, 0.9, 0.5, mat('#9aa0a8', 0.6), X1 + 0.5, 0, -2, cena); cil(0.28, 0.28, 0.06, PRETO, X1 + 0.5, 0.9, -2, cena, 12); }

  // ---------- pisos ----------
  const texMad = texMadeira(), texCar = texCarpete(), texLad = texLadrilho(), texTab = texTabuas();
  const piso = (x0, z0, x1, z1, tipo) => {
    const w = x1 - x0, d = z1 - z0; let m;
    if (tipo === 'espinha') m = new THREE.MeshStandardMaterial({ map: rep(texMad, w / 2.2, d / 2.2), roughness: 0.5, metalness: 0.05 });
    else if (tipo === 'tabuas') m = new THREE.MeshStandardMaterial({ map: rep(texTab, w / 2.4, d / 2.4), roughness: 0.55 });
    else if (tipo === 'carpete') m = new THREE.MeshStandardMaterial({ map: rep(texCar, w / 2.4, d / 2.4), roughness: 0.97 });
    else m = new THREE.MeshStandardMaterial({ map: rep(texLad, w / 1.2, d / 1.2), roughness: 0.4, metalness: 0.08 });
    const me = new THREE.Mesh(new THREE.PlaneGeometry(w, d), m);
    me.rotation.x = -Math.PI / 2; me.position.set((x0 + x1) / 2, 0.005, (z0 + z1) / 2); me.receiveShadow = true; cena.add(me); return me;
  };
  piso(-18, -11, -11, -5, 'carpete'); piso(-11, -11, -4, -5, 'carpete'); piso(-4, -11, 3, -5, 'tabuas');   // reunião, gerência, arquivo
  piso(-18, -5, 3, -3, 'tabuas');                                                                           // corredor
  piso(-18, -3, -11, 3, 'carpete'); piso(-11, -3, 3, 3, 'tabuas');                                         // apoio, lounge
  piso(-18, 3, -9, 11, 'ladrilho'); piso(-9, 3, -5, 11, 'ladrilho'); piso(-5, 3, 3, 11, 'espinha');       // cozinha, banheiros/depósito, recepção
  piso(3, -11, 18, 11, 'carpete');                                                                          // salão
  const tapete = (x, z, w, d, c1, c2, rot = 0) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ map: texTapete(c1, c2), roughness: 1 }));
    m.rotation.x = -Math.PI / 2; m.rotation.z = rot; m.position.set(x, 0.018, z); m.receiveShadow = true; cena.add(m);
  };
  { const tp = new THREE.Mesh(new THREE.PlaneGeometry(19, 1.0), new THREE.MeshStandardMaterial({ map: rep(texCar, 8, 0.5), roughness: 1, color: '#e0554f' })); tp.rotation.x = -Math.PI / 2; tp.position.set(-7.5, 0.012, -4); tp.receiveShadow = true; cena.add(tp); }

  // ---------- portas que abrem sozinhas ----------
  const MAD_PORTA = mat('#8a8f93', 0.7), MOLDURA = mat('#3a2a22', 0.6);
  function criarPorta(tipo, cx, cz, horiz, larg, lado = 1) {
    const g = grupo(cx, cz, horiz ? 0 : Math.PI / 2); g.userData.dinamico = true;
    const P = { g, tipo, cx, cz, larg, k: 0, lado, partes: [] };
    if (tipo === 'correr') { // porta de vidro dupla de correr com moldura escura
      const pw = larg / 2 + 0.02;
      for (const s of [-1, 1]) {
        const p = new THREE.Group(); p.position.set(s * larg / 4, 0, s * 0.045); g.add(p);
        caixa(pw, 0.07, 0.05, MOLDURA, 0, 0, 0, p, false); caixa(pw, 0.07, 0.05, MOLDURA, 0, DH - 0.07, 0, p, false); caixa(pw, 0.05, 0.05, MOLDURA, 0, 1.0, 0, p, false);
        caixa(0.07, DH, 0.05, MOLDURA, -pw / 2 + 0.035, 0, 0, p, false); caixa(0.07, DH, 0.05, MOLDURA, pw / 2 - 0.035, 0, 0, p, false);
        const v = new THREE.Mesh(new THREE.BoxGeometry(pw - 0.1, DH - 0.12, 0.02), vidroLiso); v.position.y = DH / 2; p.add(v);
        caixa(0.03, 0.4, 0.07, METAL, -s * (pw / 2 - 0.1), 0.9, 0, p, false);
        P.partes.push({ p, s, x0: s * larg / 4 });
      }
    } else { // porta de madeira de 1 folha com visor e maçaneta (gira em torno da dobradiça)
      const piv = new THREE.Group(); piv.position.set(-larg / 2 + 0.03, 0, 0); g.add(piv);
      caixa(larg - 0.06, DH, 0.05, MAD_PORTA, (larg - 0.06) / 2, 0, 0, piv, false);
      plano(0.32, 0.5, new THREE.MeshStandardMaterial({ color: 0xcfe3ee, emissive: 0x2a3a44, roughness: 0.2 }), (larg - 0.06) / 2, 1.35, 0.03, 0, piv);
      caixa(0.12, 0.03, 0.09, PRETO, larg - 0.18, 1.0, 0, piv, false);
      P.partes.push({ p: piv });
    }
    portas.push(P); return P;
  }

  // ---------- paredes ----------
  const jan = texJanelas();
  function parede(x0, z0, x1, z1, { tipo = 'vid', normal = null, gaps = [], interior = 'bege', ladoPorta = 1 } = {}) {
    const horiz = Math.abs(z0 - z1) < 1e-6;
    const a = horiz ? Math.min(x0, x1) : Math.min(z0, z1), b = horiz ? Math.max(x0, x1) : Math.max(z0, z1);
    const vaos = gaps.map(([c, l, tp]) => ({ c, l, tp, a: c - l / 2, b: c + l / 2 })).sort((p, q) => p.a - q.a);
    const segs = []; let cur = a;
    for (const v of vaos) { if (v.a > cur) segs.push([cur, v.a]); cur = v.b; }
    if (cur < b) segs.push([cur, b]);
    const esp = tipo === 'ext' ? 0.26 : tipo === 'vid' ? 0.07 : 0.16;
    const matPar = interior === 'vinho' ? PAREDE_VINHO : PAREDE_BEGE;
    for (const v of vaos) { // verga e batentes
      const cx = horiz ? v.c : x0, cz = horiz ? z0 : v.c;
      caixa(horiz ? v.l + 0.1 : esp + 0.04, ALT - DH, horiz ? esp + 0.04 : v.l + 0.1, tipo === 'vid' ? QUADRO : matPar, cx, DH, cz, cena, false);
      for (const s of [-1, 1]) caixa(horiz ? 0.08 : esp + 0.05, DH, horiz ? esp + 0.05 : 0.08, MOLDURA, horiz ? cx + s * (v.l / 2 + 0.02) : cx, 0, horiz ? cz : cz + s * (v.l / 2 + 0.02), cena, false);
      if (v.tp) criarPorta(v.tp, cx, cz, horiz, v.l, ladoPorta);
    }
    for (const [s0, s1] of segs) {
      const comp = s1 - s0; if (comp < 0.05) continue;
      const w = horiz ? comp : esp, d = horiz ? esp : comp;
      const cx = horiz ? (s0 + s1) / 2 : x0, cz = horiz ? z0 : (s0 + s1) / 2;
      const g = grupo(cx, cz); g.userData.dinamico = true;
      if (tipo === 'ext') {
        const fach = new THREE.MeshStandardMaterial({ map: rep(jan.cor, comp / 4, 1), emissiveMap: rep(jan.emi, comp / 4, 1), emissive: 0xffffff, emissiveIntensity: 1.1, roughness: 0.8 }); fach.userData.janela = true; neon.push(fach);
        const ms = [PRETO, PRETO, PRETO, PRETO, PRETO, PRETO];
        const ix = normal.x, iz = normal.y; // normal aponta para fora
        if (iz !== 0) { ms[iz > 0 ? 4 : 5] = fach; ms[iz > 0 ? 5 : 4] = matPar; } else { ms[ix > 0 ? 0 : 1] = fach; ms[ix > 0 ? 1 : 0] = matPar; }
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, ALT, d), ms); m.position.y = ALT / 2; m.castShadow = true; m.receiveShadow = true; g.add(m);
        caixa(w + 0.04, 0.1, d + 0.04, TAMPA, 0, ALT - 0.1, 0, g, false);
        caixa(horiz ? w - 0.02 : 0.04, 0.12, horiz ? 0.04 : d - 0.02, QUADRO, horiz ? 0 : -ix * (esp / 2 + 0.02), 0, horiz ? -iz * (esp / 2 + 0.02) : 0, g, false); // rodapé interno
      } else if (tipo === 'sol') {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, ALT, d), matPar); m.position.y = ALT / 2; m.castShadow = true; m.receiveShadow = true; g.add(m);
        caixa(w + 0.02, 0.14, d + 0.02, QUADRO, 0, 0, 0, g, false);
        caixa(w + 0.04, 0.1, d + 0.04, TAMPA, 0, ALT - 0.1, 0, g, false);
      } else {
        const v = new THREE.Mesh(new THREE.BoxGeometry(w, ALT - 0.14, d), vidroPers(comp)); v.position.y = (ALT - 0.14) / 2 + 0.1; g.add(v);
        caixa(w + 0.02, 0.1, d + 0.02, QUADRO, 0, 0, 0, g, false); caixa(w + 0.02, 0.07, d + 0.02, QUADRO, 0, ALT - 0.07, 0, g, false);
        const nPost = Math.max(1, Math.round(comp / 2.2));
        for (let i = 0; i <= nPost; i++) { const o = -comp / 2 + (comp * i) / nPost; caixa(horiz ? 0.07 : esp + 0.03, ALT, horiz ? esp + 0.03 : 0.07, QUADRO, horiz ? o : 0, 0, horiz ? 0 : o, g, false); }
      }
      colisor(cx, cz, w, d);
      paredes.push({ g, normal, cx, cz, escala: 1, interna: !normal });
    }
    // colisores dos batentes (a abertura fica livre)
  }
  const Nv = (x, z) => new THREE.Vector2(x, z);
  // contorno externo
  parede(X0, Z0, 3, Z0, { tipo: 'ext', normal: Nv(0, -1) });
  parede(3, Z0, X1, Z0, { tipo: 'ext', normal: Nv(0, -1), interior: 'vinho' });
  parede(X0, Z1, 3, Z1, { tipo: 'ext', normal: Nv(0, 1), gaps: [[-1, 2.4, 'correr']] });
  parede(3, Z1, X1, Z1, { tipo: 'ext', normal: Nv(0, 1), interior: 'vinho' });
  parede(X0, Z0, X0, Z1, { tipo: 'ext', normal: Nv(-1, 0) });
  parede(X1, Z0, X1, Z1, { tipo: 'ext', normal: Nv(1, 0), interior: 'vinho' });
  // fundo: cômodos
  parede(-11, -11, -11, -5, { tipo: 'sol', interior: 'vinho' }); parede(-4, -11, -4, -5, { tipo: 'sol', interior: 'vinho' });
  parede(-18, -5, 3, -5, { gaps: [[-14.5, 1.0, 'giro'], [-9.5, 1.6, 'correr'], [-0.5, 1.0, 'giro']] });   // corredor | fundo
  parede(-18, -3, 3, -3, { gaps: [[-14.5, 1.0, 'giro'], [-7.5, 1.8, 'correr'], [-0.5, 1.8, 'correr']] });  // corredor | apoio+lounge
  parede(-11, -3, -11, 3, { tipo: 'sol', gaps: [[-2.0, 1.0, 'giro']] });                                   // apoio | lounge
  parede(3, -11, 3, 11, { gaps: [[-4, 1.8, 'correr'], [0, 1.8, 'correr'], [7, 1.8, 'correr']] });         // meio | salão
  parede(-18, 3, -11, 3, { tipo: 'sol', gaps: [[-14.5, 1.8, 'correr']] });                                 // apoio | cozinha
  parede(-11, 3, 3, 3, { gaps: [[-10, 1.8, 'correr'], [-8, 0.9, 'giro'], [-6, 0.9, 'giro'], [-1, 1.8, 'correr']] }); // lounge | cozinha/banheiros/recepção
  parede(-9, 3, -9, 11, { tipo: 'sol' });                                                                  // cozinha | banheiros
  parede(-7, 3, -7, 7, { tipo: 'sol' });                                                                   // banheiro f | m
  parede(-9, 7, -5, 7, { tipo: 'sol' });                                                                   // banheiros | depósito
  parede(-5, 3, -5, 11, { tipo: 'sol', gaps: [[9.6, 0.9, 'giro']] });                                      // banheiros+depósito | recepção

  // ---------- peças genéricas ----------
  function planta(x, z, s = 1, p = cena) {
    const g = grupo(x, z, 0, 0, p);
    cil(0.22 * s, 0.17 * s, 0.4 * s, VASO_PRETO, 0, 0, 0, g, 14);
    for (let i = 0; i < 6; i++) {
      const f = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22 * s, 0), i % 2 ? VERDE_F : VERDE_F2);
      const a = i * 1.05; f.position.set(Math.cos(a) * 0.17 * s, (0.7 + (i % 3) * 0.22) * s, Math.sin(a) * 0.17 * s); f.scale.set(1, 1.4, 1); f.castShadow = true; g.add(f);
    }
    colisor(x, z, 0.5 * s, 0.5 * s);
  }
  function bananeira(x, z, s = 1) { // folhas longas e caídas (como nas salas da referência)
    const g = grupo(x, z); cil(0.2 * s, 0.16 * s, 0.35 * s, VASO, 0, 0, 0, g, 12);
    for (let i = 0; i < 7; i++) { const a = i * 0.9; const f = caixa(0.1 * s, 0.015, 0.7 * s, i % 2 ? VERDE_F : VERDE_F2, 0, 0.5 * s, 0, g, false);
      f.position.set(Math.cos(a) * 0.3 * s, 0.7 * s + (i % 3) * 0.15 * s, Math.sin(a) * 0.3 * s); f.rotation.set(0, -a + Math.PI / 2, 0); f.rotateX(-0.7); f.scale.set(1.6, 1, 1); }
    cil(0.02, 0.02, 0.6 * s, mat('#4a3a20'), 0, 0.3 * s, 0, g, 5); colisor(x, z, 0.5 * s, 0.5 * s);
  }
  function vasinho(x, y, z, p = cena) { cil(0.05, 0.04, 0.1, VASO, x, y, z, p, 10); const f = new THREE.Mesh(new THREE.IcosahedronGeometry(0.06, 0), mat('#d12b2b', 0.6)); f.position.set(x, y + 0.17, z); p.add(f); }
  function pufe(x, z, m, r = 0.42) { const me = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 1), m); me.scale.set(1, 0.8, 1); me.position.set(x, r * 0.8, z); me.castShadow = true; me.receiveShadow = true; cena.add(me); colisor(x, z, r * 1.6, r * 1.6); }
  function sofa(x, z, rot, larg, m) {
    const g = grupo(x, z, rot);
    caixaR(larg, 0.34, 0.85, m, 0, 0.1, 0, g, 0.08); caixaR(larg, 0.5, 0.2, m, 0, 0.44, -0.34, g, 0.08);
    for (const lx of [-1, 1]) caixaR(0.16, 0.46, 0.85, m, lx * (larg / 2 - 0.08), 0.1, 0, g, 0.05);
    for (let i = 0; i < Math.round(larg / 0.9); i++) caixaR(0.38, 0.34, 0.12, PRETO, -larg / 2 + 0.5 + i * 0.85, 0.5, -0.1, g, 0.04);
    colisorR(x, z, larg, 0.9, rot); return g;
  }
  function assentos(x, z, rot, larg, n) { const out = [], c = Math.cos(rot), s = Math.sin(rot); for (let i = 0; i < n; i++) { const o = (i - (n - 1) / 2) * (larg / n * 0.9); out.push({ x: x + c * o + s * 0.05, z: z - s * o + c * 0.05, rot, sentar: true }); } return out; }
  function cadeiraBranca(x, z, rot) { const g = grupo(x, z, rot); cil(0.05, 0.26, 0.05, BRANCO, 0, 0.02, 0, g, 5); cil(0.03, 0.03, 0.4, METAL, 0, 0.06, 0, g, 6); caixaR(0.5, 0.08, 0.48, BRANCO, 0, 0.46, 0, g, 0.03); caixaR(0.46, 0.5, 0.07, BRANCO, 0, 0.55, -0.25, g, 0.03); colisor(x, z, 0.55, 0.55); }
  function cadeiraEsc(x, z, rot, cor = null) { const g = grupo(x, z, rot); cil(0.05, 0.28, 0.06, PRETO, 0, 0.02, 0, g, 5); cil(0.03, 0.03, 0.4, METAL, 0, 0.08, 0, g, 8); caixaR(0.5, 0.08, 0.48, PRETO, 0, 0.46, 0, g, 0.03); caixaR(0.46, 0.5, 0.07, PRETO, 0, 0.55, -0.25, g, 0.03); caixa(0.05, 0.2, 0.28, PRETO, 0.28, 0.6, -0.05, g, false); caixa(0.05, 0.2, 0.28, PRETO, -0.28, 0.6, -0.05, g, false); if (cor) caixa(0.46, 0.05, 0.075, emissivo(cor, 0.5), 0, 0.96, -0.25, g, false); colisor(x, z, 0.55, 0.55); }
  function pendenteConico(x, z, cor = '#ffcf8a', y = 2.05, r = 0.3, mc = null) { // luminária cônica de teto
    const cup = new THREE.Mesh(new THREE.ConeGeometry(r, r * 0.8, 18, 1, true), mc || new THREE.MeshStandardMaterial({ color: '#c08a52', roughness: 0.7, side: THREE.DoubleSide, emissive: '#5a3515', emissiveIntensity: 0.6 }));
    cup.position.set(x, y - r * 0.4, z); cup.castShadow = false; cena.add(cup);
    const bulbo = new THREE.Mesh(new THREE.SphereGeometry(r * 0.35, 12, 8), emissivo(cor, 2.6)); bulbo.position.set(x, y - r * 0.55, z); cena.add(bulbo);
    pool(x, z, r * 9, 0.32);
  }
  function painelTeto(x, z, w = 0.9, d = 0.5) { pool(x, z, Math.max(2.2, w * 1.6), 0.18); } // sem teto na vista aérea: só a poça de luz
  function cortica(x, y, z, ry, w = 1.4, h = 1.0) { plano(w, h, basico(texAvisos()), x, y, z, ry); caixa(ry === 0 || ry === Math.PI ? w + 0.1 : 0.05, h + 0.1, ry === 0 || ry === Math.PI ? 0.05 : w + 0.1, MAD_ESC, x - (ry === Math.PI / 2 ? 0.02 : ry === -Math.PI / 2 ? -0.02 : 0), y - (h + 0.1) / 2, z - (ry === 0 ? 0.02 : ry === Math.PI ? -0.02 : 0), cena, false); }
  function relogio(x, y, z, ry) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.04, 20), BRANCO); c.rotation.x = Math.PI / 2; c.rotation.z = ry; c.position.set(x, y, z); cena.add(c); const m = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.02, 6, 20), PRETO); m.position.set(x, y, z); m.rotation.y = ry; cena.add(m); }
  function poster(x, y, z, ry, tex, w = 0.8, h = 1.0) { plano(w, h, basico(tex), x, y, z, ry); }
  function extintor(x, z, p = cena) { cil(0.07, 0.07, 0.4, mat('#c42323', 0.5), x, 0.2, z, p, 10); cil(0.02, 0.02, 0.12, PRETO, x, 0.6, z, p, 6); }
  function ventiladorPe(x, z) { cil(0.15, 0.15, 0.03, PRETO, x, 0, z); cil(0.02, 0.02, 1.0, METAL, x, 0.03, z); const h = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.015, 6, 20), METAL); h.position.set(x, 1.15, z); cena.add(h); const pl = new THREE.Mesh(new THREE.CircleGeometry(0.24, 16), mat('#9aa0a8', 0.6, 0.3, { transparent: true, opacity: 0.45, side: THREE.DoubleSide })); pl.position.set(x, 1.15, z); cena.add(pl); colisor(x, z, 0.4, 0.4); }
  function janela(x, y, z, ry, w = 1.6, h = 1.1) { // janela com persiana (parede externa)
    caixa(ry === 0 || ry === Math.PI ? w + 0.14 : 0.06, h + 0.14, ry === 0 || ry === Math.PI ? 0.06 : w + 0.14, QUADRO, x, y - h / 2 - 0.07, z, cena, false);
    plano(w, h, new THREE.MeshBasicMaterial({ map: rep(texPers, Math.max(1, w / 1.6), 1), transparent: true }), x + (ry === -Math.PI / 2 ? 0.04 : ry === Math.PI / 2 ? -0.04 : 0), y, z + (ry === 0 ? 0.04 : ry === Math.PI ? -0.04 : 0), ry);
  }
  function mesaSimples(x, z, w, d, rot = 0, h = 0.74, m = MAD) { const g = grupo(x, z, rot); caixaR(w, 0.05, d, m, 0, h - 0.05, 0, g, 0.02); for (const sx of [-1, 1]) for (const sz of [-1, 1]) caixa(0.05, h - 0.05, 0.05, PRETO, sx * (w / 2 - 0.07), 0, sz * (d / 2 - 0.07), g); colisorR(x, z, w, d, rot); return g; }
  function estanteCubica(x, z, rot, w = 2.4, h = 1.8, cubos = [4, 3]) { // estante branca de cubos com livros e objetos
    const g = grupo(x, z, rot); const cw = w / cubos[0], ch = h / cubos[1];
    caixa(w, h, 0.04, BRANCO, 0, 0, -0.17, g);
    for (let i = 0; i <= cubos[0]; i++) caixa(0.03, h, 0.36, BRANCO, -w / 2 + i * cw, 0, 0, g);
    for (let j = 0; j <= cubos[1]; j++) caixa(w, 0.03, 0.36, BRANCO, 0, j * ch - (j === cubos[1] ? 0.03 : 0), 0, g);
    for (let i = 0; i < cubos[0]; i++) for (let j = 0; j < cubos[1]; j++) { const nl = 2 + ((i * 3 + j * 5) % 4); for (let k = 0; k < nl; k++) caixa(0.05, 0.22 + ((k + i + j) % 3) * 0.05, 0.2, mat(['#9a2c2c', '#2d5a7a', '#c9a33a', '#3f7a5a', '#6b4a8a', '#d8d0c0'][(i + j + k) % 6], 0.8), -w / 2 + i * cw + 0.08 + k * 0.07, j * ch + 0.04, 0.0, g, false);
      if ((i + j) % 4 === 1) { cil(0.06, 0.05, 0.12, VASO, -w / 2 + i * cw + cw * 0.6, j * ch + 0.04, 0, g, 8); } }
    colisorR(x, z, w, 0.4, rot); return g;
  }
  function flipchart(x, z, rot, tex) { const fc = grupo(x, z, rot); for (const lx of [-0.4, 0.4]) cil(0.015, 0.015, 1.8, METAL, lx, 0, 0.1, fc, 5); cil(0.015, 0.015, 1.0, METAL, 0, 0, -0.1, fc, 5); caixa(0.95, 1.25, 0.04, BRANCO, 0, 0.7, 0, fc); plano(0.85, 1.1, basico(tex), 0, 1.32, 0.025, 0, fc); colisorR(x, z, 1.0, 0.7, rot); }
  function monitorTela(cor, icone) {
    return canvasTex(256, 160, (g, w, h) => {
      g.fillStyle = '#06101f'; g.fillRect(0, 0, w, h);
      if (!cor) { g.fillStyle = '#0b1320'; g.fillRect(0, 0, w, h); return; }
      g.fillStyle = cor; g.fillRect(0, 0, w, 16); g.globalAlpha = 0.55; for (let i = 0; i < 6; i++) g.fillRect(14, 30 + i * 18, 40 + ((i * 53) % 150), 6);
      g.globalAlpha = 1; g.font = '54px sans-serif'; g.textAlign = 'center'; g.fillText(icone || '•', w - 56, h / 2 + 18);
    });
  }
  const telaMat = (cor, icone) => new THREE.MeshBasicMaterial({ map: monitorTela(cor, icone), toneMapped: false });
  const telasGen = [0, 1, 2].map((v) => new THREE.MeshBasicMaterial({ map: canvasTex(256, 160, (g, w, h) => { g.fillStyle = ['#10243a', '#2a1a3a', '#12301f'][v]; g.fillRect(0, 0, w, h); g.fillStyle = ['#2d6d72', '#7a4ac8', '#c9a33a'][v]; g.fillRect(0, 0, w, 14); g.globalAlpha = 0.5; g.fillStyle = '#9bd'; for (let i = 0; i < 7; i++) g.fillRect(12, 28 + i * 16, 30 + ((i * 71 + v * 40) % 170), 5); }), toneMapped: false }));

  // baia de trabalho (agente senta em (x,z) olhando `rot`; mesa 0,8 m à frente): tampo bege, gaveteiro, divisórias verde-azuladas com moldura bege, monitores, teclado, caneca, luminária, papéis
  function baia(x, z, rot, ag, { larg = 1.6, madeira = BEGE_MESA, extraMon = false, divEsq = false, seed = 0 } = {}) {
    const g = grupo(x, z, rot), r = (n) => ((Math.sin(seed * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
    const mesa = grupo(0, 0.8, 0, 0, g);
    caixaR(larg, 0.045, 0.78, madeira, 0, 0.72, 0, mesa, 0.015);
    caixa(0.4, 0.68, 0.6, mat('#2b2724', 0.7), larg / 2 - 0.3, 0.03, 0.02, mesa); for (let i = 0; i < 3; i++) caixa(0.34, 0.01, 0.01, METAL, larg / 2 - 0.3, 0.2 + i * 0.2, -0.29, mesa, false);
    caixa(0.04, 0.7, 0.6, PRETO, -larg / 2 + 0.07, 0, 0.02, mesa);
    caixa(larg - 0.1, 0.5, 0.03, madeira, 0, 0.3, 0.37, mesa, false);
    // divisórias: lateral direita (e esquerda na 1ª coluna) — verde-azulada com moldura bege
    const div = (sx) => { caixa(0.045, 0.52, 0.72, TEAL, sx * (larg / 2 + 0.065), 0.72, 0.02, mesa); caixa(0.06, 0.04, 0.76, BEGE, sx * (larg / 2 + 0.065), 1.24, 0.02, mesa, false); caixa(0.06, 0.52, 0.04, BEGE, sx * (larg / 2 + 0.065), 0.72, 0.4, mesa, false); };
    div(1); if (divEsq) div(-1);
    const mon = (mx, mrot, mm, w = 0.82, h = 0.5) => {
      const mg = grupo(mx, 0.08, mrot, 0, mesa);
      caixa(0.05, 0.2, 0.05, METAL, 0, 0.765, 0, mg); caixa(0.3, 0.012, 0.16, METAL, 0, 0.765, 0.02, mg, false);
      caixa(w + 0.05, h + 0.05, 0.03, PRETO, 0, 0.9, 0.03, mg);
      const t = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mm); t.rotation.y = Math.PI; t.position.set(0, 0.9 + (h + 0.05) / 2, 0.012); mg.add(t);
    };
    mon(0, 0, ag ? telaMat(ag.cor, ag.icone) : telaMat(null));
    if (extraMon) { mon(-0.85, 0.35, telasGen[0], 0.7, 0.44); mon(0.85, -0.35, telasGen[1], 0.7, 0.44); }
    else if (ag && r(1) > 0.35) mon(-0.62, 0.3, telasGen[Math.floor(r(2) * 3)], 0.5, 0.34);
    caixa(0.45, 0.012, 0.15, mat('#0b0d12', 0.6), 0.02, 0.765, -0.22, mesa, false);                // teclado
    caixa(0.06, 0.02, 0.1, PRETO, 0.35, 0.765, -0.2, mesa, false);                                  // mouse
    cil(0.04, 0.04, 0.09, mat(['#e8e2d6', '#c84b3a', '#3b6ea5'][Math.floor(r(3) * 3)], 0.6), 0.6, 0.765, -0.1, mesa, 10); // caneca
    for (let i = 0; i < 2; i++) { const pp = caixa(0.2, 0.01, 0.28, mat('#ece9e0', 0.8), -0.55 + i * 0.1, 0.77 + i * 0.01, -0.1 + i * 0.04, mesa, false); pp.rotation.y = r(4 + i) * 0.8 - 0.4; }
    if (r(6) > 0.5) { const lm = grupo(-0.35, 0.77, 0.35, 0, mesa); cil(0.06, 0.06, 0.02, PRETO, 0, 0, 0, lm, 8); cil(0.01, 0.01, 0.3, METAL, 0, 0.02, 0, lm, 4); caixa(0.14, 0.04, 0.06, mat('#d8d4c8'), 0.05, 0.32, 0, lm, false); }
    if (r(7) > 0.6) caixa(0.08, 0.02, 0.08, mat('#f2b134', 0.7), 0.25, 0.77, 0.15, mesa, false); // post-it
    const cad = grupo(0, 0, 0, 0, g); cil(0.05, 0.28, 0.06, PRETO, 0, 0.02, 0, cad, 5); cil(0.03, 0.03, 0.4, METAL, 0, 0.08, 0, cad, 8);
    caixaR(0.5, 0.08, 0.48, PRETO, 0, 0.46, 0, cad, 0.03); caixaR(0.46, 0.5, 0.07, PRETO, 0, 0.55, -0.25, cad, 0.03); caixa(0.05, 0.2, 0.28, PRETO, 0.28, 0.6, -0.05, cad, false); caixa(0.05, 0.2, 0.28, PRETO, -0.28, 0.6, -0.05, cad, false);
    if (ag) caixa(0.46, 0.05, 0.075, emissivo(ag.cor, 0.5), 0, 0.96, -0.25, cad, false);
    colisorR(x + Math.sin(rot) * 0.8, z + Math.cos(rot) * 0.8, larg + 0.1, 0.8, rot);
    return g;
  }

  // ---------- redes de caminhos (os personagens andam por aqui) ----------
  const nos = [], viz = [], N = {};
  const no = (nome, x, z) => { nos.push({ x, z }); viz.push([]); N[nome] = nos.length - 1; return nos.length - 1; };
  const lig = (a, b) => { viz[N[a] ?? a].push(N[b] ?? b); viz[N[b] ?? b].push(N[a] ?? a); };
  const cadeia = (...ids) => { for (let i = 0; i < ids.length - 1; i++) lig(ids[i], ids[i + 1]); };
  // corredor
  for (const [n, x] of [['cB', -14.5], ['cC', -9.5], ['cD', -7.5], ['cE', -0.5], ['cF', 2.2]]) no(n, x, -4);
  no('sa1', 4.2, -4); cadeia('cB', 'cC', 'cD', 'cE', 'cF', 'sa1');
  // fundo
  no('dREU', -14.5, -5); no('rREU', -14.5, -6.2); cadeia('cB', 'dREU', 'rREU');
  no('dGER', -9.5, -5); no('rGER', -9.5, -6.1); no('gB', -9.6, -8.4); cadeia('cC', 'dGER', 'rGER', 'gB');
  no('dARQ', -0.5, -5); no('rARQ', -0.5, -6.2); cadeia('cE', 'dARQ', 'rARQ');
  // apoio + lounge
  no('dAP', -14.5, -3); no('aA', -14.5, -1.8); no('aC', -14.5, 1.6); cadeia('cB', 'dAP', 'aA', 'aC');
  no('dL1', -7.5, -3); no('n1', -7.5, -1.8); lig('cD', 'dL1'); lig('dL1', 'n1');
  no('dL2', -0.5, -3); no('n3', -0.5, -1.8); lig('cE', 'dL2'); lig('dL2', 'n3');
  no('n0', -9.6, -1.8); no('n2', -4.2, -1.8); no('n4', 2.3, -1.8); cadeia('n0', 'n1', 'n2', 'n3', 'n4');
  no('e1', 2.3, 0.2); no('s3', 2.3, 2.3); no('s2b', -1, 2.3); no('s2', -4, 2.3); no('s1b', -6, 2.3); no('s1', -8, 2.3); no('s0', -10, 2.3); cadeia('n4', 'e1', 's3', 's2b', 's2', 's1b', 's1', 's0');
  no('aB', -12.5, -2); no('dAPL', -11, -2); cadeia('aA', 'aB', 'dAPL', 'n0');
  no('dsl', 3, 0); no('sa2', 4.2, 0); cadeia('e1', 'dsl', 'sa2');
  // cozinha, banheiros
  no('dK1', -10, 3); no('kin1', -10, 4.3); lig('s0', 'dK1'); lig('dK1', 'kin1');
  no('dK2', -14.5, 3); no('kin2', -14.5, 4.3); cadeia('aC', 'dK2', 'kin2'); lig('kin1', 'kin2');
  no('k7', -16.2, 4.6); no('k6', -16.2, 9.4); no('k5', -13, 9.4); no('k4', -10.6, 9.4); no('k8', -10.6, 6.5); cadeia('kin2', 'k7', 'k6', 'k5', 'k4', 'k8', 'kin1');
  no('dW1', -8, 3); no('w1', -8, 4.4); lig('s1', 'dW1'); lig('dW1', 'w1');
  no('dW2', -6, 3); no('w2', -6, 4.4); lig('s1b', 'dW2'); lig('dW2', 'w2');
  // recepção
  no('dRC', -1, 3); no('r1', -1, 4.4); no('r2', -1, 6.8); no('r3', -1, 9.6); lig('s2b', 'dRC'); cadeia('dRC', 'r1', 'r2', 'r3');
  no('r5', 2.2, 7); no('dRS', 3, 7); no('sa3', 4.2, 7); cadeia('r2', 'r5', 'dRS', 'sa3');
  no('r6', -3.9, 10.0); no('dDep', -5, 9.6); no('dep', -6.6, 9.6); lig('r3', 'r6'); cadeia('r6', 'dDep', 'dep');
  // salão: ruas entre as baias
  const ZA = [-9.4, -4.5, 0.5, 5.6];
  ZA.forEach((za, i) => { no('W' + i, 4.6, za); no('E' + i, EXG, za); });
  cadeia('W0', 'W1', 'W2', 'W3'); cadeia('E0', 'E1', 'E2', 'E3');
  no('W4', 4.6, 7); no('W5', 4.6, 9.9); no('S1', 9.5, 9.9); no('E4', EXG, 9.9); cadeia('W3', 'W4', 'W5', 'S1', 'E4', 'E3');
  lig('sa1', 'W1'); lig('sa2', 'W2'); lig('sa3', 'W4');
  const seatNo = {};
  const xsAss = Array.from({ length: cols }, (_, c) => BX0 + c * PITCH);
  ZA.forEach((za, i) => { const ids = ['W' + i, 'E' + i]; for (const sx of xsAss) { no(`a${i}_${sx}`, sx + 0.9, za); ids.push(`a${i}_${sx}`); seatNo[`${i}_${sx}`] = N[`a${i}_${sx}`]; }
    ids.sort((p, q) => nos[N[p]].x - nos[N[q]].x); cadeia(...ids); });

  function caminho(de, para) {
    if (de === para) return [{ x: nos[de].x, z: nos[de].z }];
    const ant = new Map([[de, -1]]), fila = [de];
    while (fila.length) { const c = fila.shift(); if (c === para) break; for (const v of viz[c]) if (!ant.has(v)) { ant.set(v, c); fila.push(v); } }
    if (!ant.has(para)) return [{ x: nos[para].x, z: nos[para].z }];
    const r = []; for (let c = para; c !== -1; c = ant.get(c)) r.push({ x: nos[c].x, z: nos[c].z });
    return r.reverse();
  }
  const noMaisPerto = (x, z) => { let b = 0, bd = 1e9; nos.forEach((n, i) => { const d = Math.hypot(n.x - x, n.z - z); if (d < bd) { bd = d; b = i; } }); return b; };
  function rota(x, z, noOrigem, noDestino, destino) {
    const de = noOrigem == null ? noMaisPerto(x, z) : noOrigem;
    const pts = caminho(de, noDestino).map((q) => ({ x: q.x, z: q.z }));
    if (destino && destino.via) pts.push(...destino.via);
    if (destino) pts.push({ x: destino.x, z: destino.z });
    return pts;
  }

  // ---------- SALÃO ABERTO ----------
  const salas = {};
  const LADOS = [{ z: -8.2, rot: 0, za: 0 }, { z: -5.8, rot: Math.PI, za: 1 }, { z: -3.2, rot: 0, za: 1 }, { z: -0.8, rot: Math.PI, za: 2 }, { z: 1.8, rot: 0, za: 2 }, { z: 4.2, rot: Math.PI, za: 3 }];
  const mapaBaia = new Map();
  demais.forEach((ag, i) => {
    const side = LADOS[i % LADOS_N], col = Math.floor(i / LADOS_N), x = xsAss[col];
    mapaBaia.set(`${i % LADOS_N}_${col}`, ag);
    const volta = side.rot === 0 ? -0.15 : 0.15;
    salas[ag.slug] = { zona: 'salao', baia: `Baia ${i + 1}`, assento: { x, z: side.z, rot: side.rot }, lado: { x: x + 0.9, z: side.z + volta }, no: seatNo[`${side.za}_${x}`] };
    SALAS[ag.slug] = { nome: `Salão — baia ${i + 1}` };
  });
  for (let c = 0; c < cols; c++) for (let s = 0; s < LADOS_N; s++) {
    const ag = mapaBaia.get(`${s}_${c}`) || null, L = LADOS[s];
    baia(xsAss[c], L.z, L.rot, ag, { divEsq: L.rot === 0 ? c === 0 : c === cols - 1, seed: c * 7 + s });
  }
  for (const zc of [-7.0, -2.0, 3.0]) { // divisória central da bancada (verde-azulada com moldura bege)
    const len = cols * PITCH + 0.2, cx = BX0 - 0.9 + len / 2 - 0.1;
    caixa(len, 0.46, 0.05, TEAL, cx, 0.72, zc, cena); caixa(len, 0.04, 0.08, BEGE, cx, 1.18, zc, cena, false);
    for (let c = 0; c <= cols; c++) caixa(0.05, 0.46, 0.1, BEGE, BX0 - 0.9 + c * PITCH, 0.72, zc, cena, false);
  }
  { // telão "PROJECT BOARD" na parede do fundo + letreiro roxo + quadros de cortiça + 2 portas na parede
    caixa(2.8, 1.6, 0.08, PRETO, 15.6, 1.0, Z0 + 0.1, cena); plano(2.6, 1.45, basico(texRelatorio()), 15.6, 1.8, Z0 + 0.15, 0);
    caixa(1.6, 0.18, 0.04, emissivo('#7c5cff', 1.6), 15.6, 2.65, Z0 + 0.1, cena, false);
    cortica(6.0, 1.6, Z0 + 0.14, 0, 1.6, 1.0); cortica(10.2, 1.6, Z0 + 0.14, 0, 1.4, 0.9); poster(12.4, 1.6, Z0 + 0.14, 0, texQuadroGrafico(), 0.8, 1.0);
    for (const px of [4.5, 13.2]) { caixa(0.95, 2.05, 0.05, MAD_PORTA, px, 0, Z0 + 0.12, cena, false); caixa(0.12, 0.03, 0.06, PRETO, px + 0.32, 1.0, Z0 + 0.16, cena, false); }
    for (const z of [-8, -2, 5]) janela(X1 - 0.16, 1.5, z, -Math.PI / 2, 1.8, 1.1);
    // zona de apoio ao sul: copiadoras, bebedouro, arquivos, caixas, mesa redonda de reunião rápida
    const cp = grupo(17.5, 1.0, -Math.PI / 2); caixaR(4.6, 0.85, 0.7, mat('#d6cfc0', 0.7), 0, 0, 0, cp, 0.03);
    for (const px of [-1.4, 0.2]) { caixaR(0.8, 0.42, 0.6, BRANCO, px, 0.85, 0, cp, 0.04); caixa(0.5, 0.04, 0.3, mat('#e6e0d0', 0.8), px, 1.27, 0.05, cp, false); caixa(0.12, 0.04, 0.12, emissivo('#38bdf8', 1.6), px + 0.25, 1.1, 0.31, cp, false); }
    for (let i = 0; i < 3; i++) caixa(0.3, 0.06, 0.4, mat('#e8d9b4', 0.9), 1.4 + i * 0.35, 0.85 + i * 0.06, 0, cp); colisor(17.5, 1.0, 0.7, 4.6);
    { const bd = grupo(17.5, 4.0, -Math.PI / 2); caixaR(0.4, 1.0, 0.4, BRANCO, 0, 0, 0, bd, 0.03); cil(0.14, 0.14, 0.42, mat('#7fc4ee', 0.2, 0, { transparent: true, opacity: 0.7 }), 0, 1.0, 0, bd, 14); caixa(0.12, 0.02, 0.1, emissivo('#38bdf8', 1.5), 0, 0.82, 0.21, bd, false); colisor(17.5, 4.0, 0.45, 0.45); }
    estanteCubica(17.6, 7.0, -Math.PI / 2, 2.2, 1.5, [4, 2]); K('cardboardBoxOpen', 17.0, 9.8, { h: 0.5, rot: 0.3, col: true }); K('cardboardBoxClosed', 16.2, 10.2, { h: 0.55, rot: -0.2, col: true }); K('cardboardBoxClosed', 17.2, 10.4, { h: 0.45, rot: 0.6, col: true }); K('cardboardBoxClosed', 17.2, 10.4, { h: 0.45, y: 0.46, rot: 0.1 });
    // papéis espalhados e caixa aberta no chão
    for (let i = 0; i < 9; i++) { const p = caixa(0.22, 0.004, 0.3, mat('#ece9e0', 0.9), 5.5 + alea() * 12, 0.02, -9 + alea() * 18, cena, false); p.rotation.y = alea() * 3; }
    { const mx = 10.5, mz = 7.6; cil(0.9, 0.9, 0.05, MAD_CL, mx, 0.72, mz, cena, 28); cil(0.08, 0.1, 0.72, PRETO, mx, 0, mz, cena, 10); colisor(mx, mz, 1.9, 1.9); vasinho(mx + 0.2, 0.77, mz);
      for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.4; const cc = grupo(mx + Math.cos(a) * 1.25, mz + Math.sin(a) * 1.25, -a + Math.PI / 2 + Math.PI); caixaR(0.5, 0.08, 0.48, TEAL, 0, 0.46, 0, cc, 0.03); caixaR(0.46, 0.5, 0.07, TEAL, 0, 0.55, -0.25, cc, 0.03); cil(0.03, 0.03, 0.4, METAL, 0, 0.05, 0, cc, 6); colisor(mx + Math.cos(a) * 1.25, mz + Math.sin(a) * 1.25, 0.5, 0.5); }
      pendenteConico(mx, mz, '#fff0d0', 2.0, 0.4); }
    flipchart(6.9, 8.5, 0.2, texQuadroGrafico()); estanteCubica(6.0, 10.75, Math.PI, 2.4, 1.5, [4, 2]); estanteCubica(14.0, 10.75, Math.PI, 2.2, 1.5, [4, 2]); K('cardboardBoxOpen', 12.4, 10.4, { h: 0.5, rot: 0.5, col: true }); K('cardboardBoxClosed', 11.6, 10.5, { h: 0.5, rot: 0.1, col: true }); K('washerDryerStacked', 15.6, 10.3, { h: 1.3, col: true }); K('lampRoundFloor', 8.8, 10.4, { h: 1.5 }); K('trashcan', 4.6, 8.5, { h: 0.5 }); K('sideTableDrawers', 9.2, 5.9, { h: 0.7, col: true }); K('coatRackStanding', 5.0, 6.1, { h: 1.7 });
    bananeira(4.6 + 0.5, 10.3, 1.4); bananeira(X1 - 0.7, -10.2, 1.5); planta(X1 - 0.7, -5.2, 1.3); planta(FIM_BAIAS + 0.3, -10.3, 1.2); planta(FIM_BAIAS + 0.2, 6.4, 1.1); planta(4.5, -10.2, 1.2);
    K('pottedPlant', 4.2, -6.7, { h: 1.2 }); K('speaker', 17.4, -3.2, { h: 0.6 }); ventiladorPe(14.9, -6.2);
    for (const [x, z] of [[8, -9.8], [13, -9.8], [8, 8.2], [13, 4.8]]) painelTeto(x, z, 1.1, 0.5);
    for (const [x, z] of [[9, -7], [9, -2], [9, 3]]) painelTeto(x, z, 2.0, 0.5);
    pois_extra_salao();
  }
  function pois_extra_salao() {}
  const pois = [];
  pois.push({ x: 15.6, z: -9.4, rot: Math.PI, nome: 'telão', no: N.E0 }, { x: 16.2, z: -9.0, rot: Math.PI - 0.4, nome: 'telão', no: N.E0 },
    { x: 16.5, z: 0.0, rot: Math.PI / 2, nome: 'impressora', no: N.E2 }, { x: 16.5, z: 4.0, rot: Math.PI / 2, nome: 'bebedouro', no: N.E3 },
    { x: 8.3, z: 7.6, rot: -Math.PI / 2, nome: 'conversa', no: N.W4 }, { x: 12.8, z: 7.6, rot: Math.PI / 2, nome: 'conversa', no: N.E4 });

  // ---------- GERÊNCIA (x -11..-4, z -11..-5; carpete vinho) ----------
  { const gx = -7.5, gz = -9.6;
    salas[gerente.slug] = { zona: 'gerencia', baia: 'Sala da Gerência', gerente: true, assento: { x: gx, z: gz, rot: 0 }, lado: { x: -9.2, z: gz }, no: N.gB };
    SALAS[gerente.slug] = { nome: 'Sala da Gerência' };
    baia(gx, gz, 0, gerente, { larg: 2.2, madeira: mat('#6a3f22', 0.5), extraMon: true, seed: 3 });
    caixa(0.5, 0.7, 0.6, mat('#2b2018', 0.7), gx + 0.8, 0.03, gz + 0.85, cena); // gaveteiro
    { const gb = grupo(gx + 1.0, gz + 0.9, 0, 0.77); cil(0.1, 0.1, 0.04, PRETO, 0, 0, 0, gb, 12); cil(0.015, 0.015, 0.18, METAL, 0, 0.04, 0, gb, 6);
      const es = new THREE.Mesh(new THREE.SphereGeometry(0.15, 18, 12), mat('#2b6aa8', 0.6)); es.position.set(0, 0.3, 0); es.castShadow = true; gb.add(es);
      const co = new THREE.Mesh(new THREE.IcosahedronGeometry(0.152, 1), mat('#58a36c', 0.8)); co.scale.set(0.92, 0.5, 0.92); co.position.set(0, 0.32, 0); gb.add(co);
      es.userData.fixo = co.userData.fixo = true; animados.push((t) => { es.rotation.y = t * 0.3; co.rotation.y = t * 0.3; }); }
    { const tr = grupo(gx - 0.8, gz + 0.9, 0, 0.77); cil(0.07, 0.07, 0.03, PRETO, 0, 0, 0, tr, 10); cil(0.02, 0.02, 0.16, mat('#d8b13a', 0.3, 0.9), 0, 0.03, 0, tr, 6); cil(0.1, 0.04, 0.16, mat('#d8b13a', 0.3, 0.9), 0, 0.19, 0, tr, 12); }
    K('lampRoundTable', gx - 0.4, gz + 0.95, { h: 0.42, y: 0.77 });
    estanteCubica(-7.5, -10.55, 0, 2.6, 1.8, [4, 3]);                    // estante cúbica branca (parede do fundo)
    bananeira(-4.9, -10.3, 1.5);
    { const gm = grupo(-5.4, -8.6); caixa(1.3, 0.02, 1.0, mat('#2f9a52', 0.95), 0, 0, 0, gm, false); cil(0.04, 0.04, 0.02, PRETO, 0.3, 0.02, 0.1, gm, 8); cil(0.008, 0.008, 0.6, mat('#d8d4c8'), 0.3, 0.02, 0.1, gm, 4); caixa(0.14, 0.1, 0.01, mat('#e8742a'), 0.37, 0.52, 0.1, gm, false);
      for (let i = 0; i < 2; i++) { const tc = caixa(0.02, 0.9, 0.02, METAL, -0.3 + i * 0.08, 0, -0.4, gm, false); tc.rotation.z = 0.12; } }
    flipchart(-4.6, -7.6, -0.5, texQuadroGrafico());
    // mesa de reunião longa com cadeiras brancas (à frente da mesa), mesa lateral, poltrona
    { const g = grupo(-6.6, -6.7); caixaR(2.4, 0.06, 1.0, mat('#5a3a22', 0.5), 0, 0.72, 0, g, 0.02); for (const sx of [-1, 1]) caixa(0.1, 0.72, 0.8, PRETO, sx * 1.0, 0, 0, g); colisor(-6.6, -6.7, 2.4, 1.0);
      caixa(0.3, 0.01, 0.22, mat('#d8b078'), 0.1, 0.78, 0.05, g, false); caixa(0.34, 0.02, 0.24, PRETO, -0.6, 0.78, 0, g, false); cil(0.04, 0.04, 0.1, mat('#eee'), 0.8, 0.78, 0.2, g, 8); }
    cadeiraBranca(-8.5, -6.7, Math.PI / 2); cadeiraBranca(-4.8, -6.7, -Math.PI / 2); cadeiraBranca(-7.4, -7.9, Math.PI); cadeiraBranca(-5.8, -7.9, Math.PI);
    { const st = grupo(-10.4, -9.9); caixaR(0.7, 0.55, 0.5, CINZA, 0, 0, 0, st, 0.04); planta(-10.4, -9.9, 0.4, st); colisor(-10.4, -9.9, 0.7, 0.5); }
    K('loungeChair', -10.2, -7.2, { h: 0.85, rot: Math.PI / 2, col: true });
    poster(-10.9, 1.7, -10.4, Math.PI / 2, texQuadroGrafico(), 0.7, 0.9); caixa(0.45, 0.35, 0.03, MAD_ESC, -4.12, 1.5, -9.2, cena, false);
    pendenteConico(-7.5, -8.0, '#ffc77a', 2.0, 0.62, mat('#c9975a', 0.7, 0, { side: THREE.DoubleSide })); // luminária cônica grande de madeira
    painelTeto(-9.0, -6.2); painelTeto(-5.5, -6.2); janela(-7.5, 1.6, Z0 + 0.1, 0, 2.4, 1.0);
    // TV de 100" do Segundo Cérebro (parede oeste da gerência, virada para leste)
    var telaCerebro = (() => {
      const canvas = document.createElement('canvas'); canvas.width = 1280; canvas.height = 720;
      const textura = new THREE.CanvasTexture(canvas); textura.colorSpace = THREE.SRGBColorSpace; textura.anisotropy = 8;
      const W = 2.21, H = 1.245, y = 1.75;
      const g = grupo(-10.86, -7.8, Math.PI / 2);
      caixa(W + 0.1, H + 0.1, 0.07, PRETO, 0, y - (H + 0.1) / 2, 0.04, g, false);
      const tela = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshBasicMaterial({ map: textura, toneMapped: false })); tela.position.set(0, y, 0.085); g.add(tela);
      caixa(W + 0.12, 0.03, 0.09, emissivo('#a78bfa', 1.2), 0, y + H / 2 + 0.05, 0.04, g, false);
      return { canvas, textura };
    })();
  }
  // ---------- SALA DE REUNIÃO (x -18..-11, z -11..-5) ----------
  { const mx = -14.5, mz = -8.6;
    mesaSimples(mx, mz, 3.6, 1.2, 0, 0.74, mat('#5a3a22', 0.5));
    for (const px of [-1.3, 0, 1.3]) { cadeiraBranca(mx + px, mz + 1.15, Math.PI); cadeiraBranca(mx + px, mz - 1.15, 0); }
    cadeiraBranca(mx - 2.2, mz, Math.PI / 2); cadeiraBranca(mx + 2.2, mz, -Math.PI / 2);
    { const g = grupo(mx, mz, 0, 0.77); caixa(0.3, 0.12, 0.24, PRETO, -0.3, 0, 0, g); cil(0.03, 0.03, 0.2, mat('#7fc4ee', 0.3), 0.9, 0, 0.1, g, 8); caixa(0.3, 0.01, 0.22, mat('#d8b078'), 0.2, 0, -0.1, g, false); cil(0.04, 0.04, 0.09, mat('#c84b3a'), -1.0, 0, -0.2, g, 10); cil(0.04, 0.04, 0.09, mat('#e8e2d6'), 1.2, 0, 0.2, g, 10); K('laptop', 1.0, -0.15, { w: 0.34, p: g, rot: Math.PI }); }
    caixa(1.9, 1.1, 0.06, PRETO, mx, 1.0, Z0 + 0.12, cena, false); plano(1.76, 0.96, new THREE.MeshBasicMaterial({ map: canvasTex(256, 144, (g, w, h) => { g.fillStyle = '#0b2a5a'; g.fillRect(0, 0, w, h); g.fillStyle = '#2e6fd8'; g.fillRect(0, 0, w, 18); g.fillStyle = 'rgba(255,255,255,.5)'; for (let i = 0; i < 5; i++) g.fillRect(14, 34 + i * 20, 60 + ((i * 53) % 130), 7); }), toneMapped: false }), mx, 1.55, Z0 + 0.16, 0); caixa(2.0, 0.55, 0.4, MAD_ESC, mx, 0, Z0 + 0.3, cena);
    caixa(0.05, 1.1, 2.2, BRANCO, -17.9, 1.0, -8.0, cena, false); caixa(0.06, 1.2, 2.3, PRETO, -17.92, 0.95, -8.0, cena, false);
    bananeira(-17.2, -10.2, 1.3); planta(-11.6, -10.2, 1.2); K('coatRackStanding', -11.5, -5.7, { h: 1.7 });
    pendenteConico(mx - 1.0, mz, '#ffe0b0', 2.0, 0.3); pendenteConico(mx + 1.0, mz, '#ffe0b0', 2.0, 0.3); painelTeto(mx, -6.4); janela(-17.9, 1.6, -8, Math.PI / 2, 1.8, 1.0);
    poster(-17.9, 1.5, -10.0, Math.PI / 2, texQuadroGrafico(), 0.8, 1.0);
    pois.push({ x: -16.0, z: -7.45, rot: Math.PI, sentar: true, no: N.rREU, nome: 'reunião' }, { x: -13.0, z: -7.45, rot: Math.PI, sentar: true, no: N.rREU, nome: 'reunião' });
  }
  // ---------- ARQUIVO / DESCANSO (x -4..3, z -11..-5) ----------
  { estanteCubica(-1.0, -10.55, 0, 2.4, 1.6, [4, 2]); K('bookcaseOpen', 1.8, -10.4, { h: 1.9, col: true }); K('bookcaseClosedWide', -2.9, -10.4, { h: 1.6, col: true });
    sofa(1.9, -7.4, -Math.PI / 2, 2.2, mat('#d9792b', 0.85)); mesaSimples(0.9, -7.4, 0.6, 0.9, 0, 0.42, MAD); K('lampRoundFloor', 2.5, -5.6, { h: 1.5 });
    mesaSimples(-2.7, -7.2, 1.4, 0.7, 0, 0.74, MAD_CL); cadeiraEsc(-2.7, -6.45, Math.PI); K('laptop', -2.7, -7.2, { w: 0.34, y: 0.77 }); K('books', -3.2, -7.1, { w: 0.25, y: 0.77 });
    for (const [x, z, r] of [[-3.3, -9.2, 0.2], [-2.5, -9.4, -0.3], [-3.1, -8.5, 0.1]]) K('cardboardBoxClosed', x, z, { h: 0.45, rot: r, col: true });
    K('washerDryerStacked', 2.4, -10.2, { h: 1.5 }); planta(-3.4, -5.7, 1.1); K('trashcan', -0.2, -5.6, { h: 0.5 }); tapete(0.2, -8.0, 2.2, 2.6, '#d9792b', '#7a3a1a');
    janela(-0.5, 1.6, Z0 + 0.1, 0, 1.8, 1.0); poster(-3.9, 1.5, -8.5, Math.PI / 2, texQuadroGrafico(), 0.7, 0.9);
    pendenteConico(0.5, -8.0, '#ffbf7a', 2.0, 0.35); painelTeto(-1.5, -6.3);
    pois.push({ x: 1.5, z: -7.4, rot: -Math.PI / 2, sentar: true, no: N.rARQ, nome: 'descanso', via: [{ x: 0.9, z: -6.2 }] }); }
  // ---------- CORREDOR (x -18..3, z -5..-3): persiana, tapete vermelho, plantas, cortiça, extintor, piso molhado ----------
  { planta(-17.5, -3.5, 1.0); planta(2.4, -4.6, 0.9); K('pottedPlant', -11.6, -4.5, { h: 1.1 }); cortica(X0 + 0.14, 1.5, -4.0, Math.PI / 2, 1.2, 0.9); extintor(-17.6, -4.6);
    caixa(0.3, 0.45, 0.2, mat('#f0c419', 0.6), -5.0, 0, -4.5, cena); const cm = caixa(0.3, 0.1, 0.2, mat('#f0c419', 0.6), -5.0, 0.4, -4.5, cena, false); cm.rotation.z = 0.0;
    pendenteConico(-12, -4, '#ffcf8a', 2.1, 0.25); pendenteConico(-3, -4, '#ffcf8a', 2.1, 0.25); painelTeto(-7.5, -4, 1.4, 0.4);
    // carrinho de limpeza
    { const g = grupo(-16.7, -4.45); caixa(0.6, 0.5, 0.4, mat('#3a4a6a', 0.6), 0, 0.2, 0, g); caixa(0.6, 0.04, 0.4, METAL, 0, 0.9, 0, g, false); cil(0.1, 0.1, 0.25, mat('#e03a3a'), 0.15, 0.7, 0, g, 8); caixa(0.02, 0.9, 0.02, METAL, -0.28, 0, 0.18, g, false); colisor(-16.7, -4.45, 0.65, 0.45); }
    pois.push({ x: -5.5, z: -4.0, rot: 0.3, nome: 'corredor', no: N.cD }, { x: -12.0, z: -4.0, rot: 2.8, nome: 'corredor', no: N.cC }); }
  // ---------- SALA DE APOIO (x -18..-11, z -3..3) ----------
  { sofa(-17.2, 0.2, Math.PI / 2, 2.4, mat('#8a8a90', 0.85)); mesaSimples(-15.6, 0.2, 0.7, 1.1, 0, 0.42, MAD); K('books', -15.6, 0.0, { w: 0.3, y: 0.44 });
    mesaSimples(-13.2, 1.6, 1.6, 0.8, 0, 0.74, MAD_CL); cadeiraEsc(-13.2, 0.9, 0); K('laptop', -13.2, 1.6, { w: 0.36, y: 0.77, rot: Math.PI }); K('lampSquareTable', -12.4, 1.6, { h: 0.4, y: 0.77 });
    estanteCubica(-16.9, -2.75, 0, 2.2, 1.5, [4, 3]); K('plantSmall1', -12.4, -2.4, { h: 0.5 }); planta(-17.5, 2.3, 1.2); K('sideTable', -12.0, -1.0, { h: 0.55, col: true });
    K('lampRoundFloor', -17.6, -1.9, { h: 1.5 }); tapete(-15.2, 0.2, 2.6, 2.4, '#4a6aa0', '#d8c8a0'); poster(-17.9, 1.5, 0.2, Math.PI / 2, texQuadroGrafico(), 0.8, 1.0); janela(-17.9, 1.6, 0.2, Math.PI / 2, 1.6, 0.0 + 1.0);
    painelTeto(-14.5, 0.0, 1.2, 0.5); pendenteConico(-13.2, 1.6, '#ffd9a0', 1.9, 0.25);
    pois.push({ x: -16.9, z: -0.4, rot: Math.PI / 2, sentar: true, no: N.aA, nome: 'sofá', via: [{ x: -15.6, z: -1.5 }] }, { x: -16.9, z: 0.9, rot: Math.PI / 2, sentar: true, no: N.aA, nome: 'sofá', via: [{ x: -15.6, z: -1.5 }] }); }

  // ---------- LOUNGE (x -11..3, z -3..3; tábuas largas) ----------
  { const sinuca = (x, z, cor) => {
      const g = grupo(x, z);
      caixaR(2.7, 0.14, 1.5, mat('#4a2a18', 0.5), 0, 0.72, 0, g, 0.03); caixa(2.3, 0.04, 1.1, mat('#1f7a46', 0.95), 0, 0.86, 0, g, false);
      for (const [lx, lz] of [[-1.2, -0.62], [1.2, -0.62], [-1.2, 0.62], [1.2, 0.62]]) cil(0.09, 0.09, 0.72, mat('#4a2a18', 0.5), lx, 0, lz, g, 8);
      for (const [lx, lz] of [[-1.2, -0.55], [1.2, -0.55], [-1.2, 0.55], [1.2, 0.55], [0, -0.55], [0, 0.55]]) cil(0.06, 0.06, 0.02, PRETO, lx, 0.88, lz, g, 10);
      ['#f5f5f5', '#d2252b', '#2b4bd0', '#f0c020', '#222', '#e0702a', '#7a2a8a'].forEach((c, i) => { const bl = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), mat(c, 0.3)); bl.position.set(0.3 + (i % 3) * 0.08 + Math.floor(i / 3) * 0.05, 0.915, (i - 3) * 0.06); g.add(bl); });
      caixa(1.5, 0.015, 0.015, mat('#c9a066', 0.5), -0.3, 0.9, 0.35, g, false);
      tapete(x, z, 4.0, 2.5, cor[0], cor[1]); pendenteConico(x - 0.5, z, '#ffd9a0', 1.9, 0.25); pendenteConico(x + 0.5, z, '#ffd9a0', 1.9, 0.25); colisor(x, z, 2.7, 1.5); };
    sinuca(-6.3, 0.6, ['#d9921f', '#8a5a14']); sinuca(-2.0, 0.6, ['#1f5a78', '#8ab0c0']);
    { const pb = grupo(0.9, 0.6); caixaR(1.4, 0.16, 0.75, mat('#a8703f', 0.6), 0, 0.72, 0, pb, 0.03); caixa(1.3, 0.03, 0.65, mat('#2a8a4a', 0.9), 0, 0.88, 0, pb, false);
      for (const lx of [-0.45, -0.15, 0.15, 0.45]) { caixa(0.025, 0.025, 0.95, METAL, lx, 0.98, 0, pb, false); for (const lz of [-0.18, 0, 0.18]) caixa(0.05, 0.12, 0.05, lx < 0 ? mat('#d2252b') : mat('#f0c020'), lx, 0.9, lz, pb, false); }
      for (const [lx, lz] of [[-0.62, -0.3], [0.62, -0.3], [-0.62, 0.3], [0.62, 0.3]]) caixa(0.07, 0.72, 0.07, PRETO, lx, 0, lz, pb); colisor(0.9, 0.6, 1.4, 0.75); }
    // nicho de sofá: tapete vermelho, sofá cinza com almofadas pretas, mesa de centro com revistas/laptop, pufes vermelho/azul/laranja, abajur
    tapete(-9.2, 0.3, 2.8, 4.0, '#9c2a2a', '#e0a060'); sofa(-10.4, 0.2, Math.PI / 2, 2.4, mat('#8d8f96', 0.85));
    K('tableCoffee', -9.0, 0.3, { w: 0.9, rot: Math.PI / 2, col: true }); K('laptop', -9.0, 0.1, { w: 0.3, y: 0.42, rot: Math.PI / 2 }); K('books', -9.0, 0.55, { w: 0.25, y: 0.42, rot: 0.4 });
    pufe(-8.9, -1.0, VERMELHO, 0.42); pufe(-9.2, 1.75, AZUL, 0.4); pufe(-7.9, 1.6, LARANJA, 0.36);
    K('lampRoundFloor', -10.5, -1.9, { h: 1.5 }); K('sideTable', -10.5, 2.2, { h: 0.55 }); K('lampSquareTable', -10.5, 2.2, { h: 0.35, y: 0.55 });
    cortica(-10.88, 1.6, -1.3, Math.PI / 2, 1.5, 1.0); poster(-10.9, 1.7, 2.4, Math.PI / 2, texQuadroGrafico(), 0.6, 0.8);
    ventiladorPe(1.8, -0.6); bananeira(-10.4, -2.3, 1.4); K('plantSmall2', 2.3, -2.5, { h: 0.5 });
    // placa "piso molhado" amarela, prateleira preta com vasinho, relógio
    { const pm = grupo(-1.0, -2.2, 0.3); const a = caixa(0.4, 0.55, 0.02, mat('#f0c419', 0.6), 0, 0, -0.12, pm, false); a.rotation.x = 0.28; const b = caixa(0.4, 0.55, 0.02, mat('#f0c419', 0.6), 0, 0, 0.12, pm, false); b.rotation.x = -0.28; }
    caixa(0.5, 0.04, 0.2, PRETO, -10.85, 1.5, 2.6, cena, false); relogio(-10.9, 2.3, -2.0, Math.PI / 2);
    // portas dos banheiros: ícones (mulher/homem) e acessibilidade
    plano(0.2, 0.2, basico(texIcone('f')), -8, 2.35, 2.88, Math.PI); plano(0.2, 0.2, basico(texIcone('m')), -6, 2.35, 2.88, Math.PI); plano(0.2, 0.2, basico(texIcone('acess')), -7, 1.7, 2.88, Math.PI);
    for (const x of [-8.5, -4.5, 0.5]) painelTeto(x, -1.2, 1.4, 0.45); painelTeto(-4.1, 2.2, 1.6, 0.45);
    pois.push({ x: -6.3, z: -0.9, rot: 0, nome: 'sinuca', no: N.n1 }, { x: -6.3, z: 1.95, rot: Math.PI, nome: 'sinuca', no: N.s1b }, { x: -2.0, z: -0.9, rot: 0, nome: 'sinuca', no: N.n2 }, { x: -2.0, z: 1.95, rot: Math.PI, nome: 'sinuca', no: N.s2 },
      { x: 0.9, z: -0.3, rot: 0, nome: 'pebolim', no: N.n3 }, { x: 0.9, z: 1.5, rot: Math.PI, nome: 'pebolim', no: N.s2b });
    for (const s of assentos(-10.4, 0.2, Math.PI / 2, 2.4, 2)) pois.push({ ...s, no: N.n0, via: [{ x: -9.9, z: -1.3 }], nome: 'sofá' });
    pois.push({ x: -8.9, z: -1.0, rot: 0.6, sentar: true, no: N.n0, nome: 'pufe' }, { x: -9.2, z: 1.75, rot: 2.4, sentar: true, no: N.s0, nome: 'pufe' }); }

  // ---------- COZINHA (x -18..-9, z 3..11; ladrilho) ----------
  { // bancada baixa + geladeira vermelha na parede oeste; lixeira; bebedouro; máquina de lanches; relógio; ilha com muitos itens
    for (let i = 0; i < 4; i++) K(i === 1 ? 'kitchenSink' : i === 3 ? 'kitchenStove' : 'kitchenCabinetDrawer', -17.55, 4.4 + i * 0.85, { h: 0.9, rot: Math.PI / 2, col: true });
    for (let i = 0; i < 3; i++) K('kitchenCabinetUpper', -17.7, 4.5 + i * 0.9, { h: 0.8, y: 1.45, rot: Math.PI / 2 });
    caixaR(0.9, 2.0, 0.8, mat('#8a1c22', 0.35, 0.3), -17.5, 0, 8.6, cena, 0.05); cil(0.02, 0.02, 0.6, METAL, -17.0, 1.3, 8.4, cena, 6); colisor(-17.5, 8.6, 0.9, 0.8);
    K('kitchenCoffeeMachine', -17.55, 5.25, { h: 0.4, y: 0.9, rot: Math.PI / 2 }); K('kitchenMicrowave', -17.55, 4.4, { h: 0.3, y: 0.9, rot: Math.PI / 2 }); K('toaster', -17.55, 6.1, { h: 0.2, y: 0.9, rot: Math.PI / 2 }); K('kitchenBlender', -17.55, 6.5, { h: 0.35, y: 0.9, rot: Math.PI / 2 });
    cil(0.2, 0.17, 0.5, mat('#222', 0.6), -17.4, 0, 9.9, cena, 14); colisor(-17.4, 9.9, 0.4, 0.4);
    { const bd = grupo(-12.0, 10.5, Math.PI); caixaR(0.4, 1.0, 0.4, BRANCO, 0, 0, 0, bd, 0.03); cil(0.14, 0.14, 0.42, mat('#7fc4ee', 0.2, 0, { transparent: true, opacity: 0.7 }), 0, 1.0, 0, bd, 14); colisor(-12.0, 10.5, 0.45, 0.45); }
    { const vm = grupo(-9.55, 9.5, -Math.PI / 2); caixaR(0.9, 1.9, 0.7, mat('#15161a', 0.5, 0.3), 0, 0, 0, vm, 0.04); plano(0.6, 1.1, basico(canvasTex(128, 192, (g, w, h) => { g.fillStyle = '#10141c'; g.fillRect(0, 0, w, h); const cs = ['#e8742a', '#d2252b', '#f0c020', '#2b8a4a', '#2b5aa8']; for (let r = 0; r < 5; r++) for (let c = 0; c < 4; c++) { g.fillStyle = cs[(r * 4 + c) % 5]; g.fillRect(8 + c * 28, 10 + r * 34, 22, 26); } })), 0, 1.25, 0.36, 0, vm); colisor(-9.55, 9.5, 0.7, 0.9); }
    relogio(-13.0, 2.2, 3.12, 0); cortica(-9.12, 1.6, 6.0, -Math.PI / 2, 1.3, 0.9);
    // ilha escura com bandeja, torradeira, pratos, tigelas, frutas, caixa de biscoitos e copos
    { const il = grupo(-13.2, 7.0); caixaR(3.0, 0.9, 1.2, mat('#3d3f45', 0.5), 0, 0, 0, il, 0.04); caixaR(3.1, 0.05, 1.3, mat('#2a2c31', 0.4), 0, 0.9, 0, il, 0.02);
      for (let i = 0; i < 4; i++) cil(0.14, 0.14, 0.02, BRANCO, -1.1 + i * 0.35, 0.95, 0.4, il, 14);
      cil(0.16, 0.14, 0.1, mat('#c9a066', 0.6), 0.1, 0.95, -0.2, il, 14); for (let i = 0; i < 3; i++) { const f = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), mat(['#e0402a', '#f0c020', '#6ab04c'][i], 0.6)); f.position.set(0.05 + i * 0.06, 1.1, -0.2 + (i % 2) * 0.05); il.add(f); }
      caixa(0.3, 0.07, 0.2, mat('#d8a860'), 0.7, 0.95, 0.1, il); caixa(0.4, 0.03, 0.3, mat('#d8d0c0'), -0.2, 0.95, -0.2, il, false); K('toaster', 1.0, -0.2, { h: 0.2, y: 0.95, p: il });
      for (let i = 0; i < 3; i++) cil(0.035, 0.03, 0.09, mat('#cfe3ee', 0.2), -1.3 + i * 0.1, 0.95, -0.3, il, 8); vasinho(1.3, 0.95, 0.3, il); colisor(-13.2, 7.0, 3.1, 1.3); }
    for (const bx of [-14.4, -13.2, -12.0]) { K('stoolBar', bx, 8.1, { h: 0.62, col: true }); }
    planta(-17.4, 3.45, 0.9); planta(-17.3, 10.4, 1.2); pendenteConico(-14.3, 7.0, '#ffd9a0', 2.0, 0.3); pendenteConico(-13.2, 7.0, '#ffd9a0', 2.0, 0.3); pendenteConico(-12.1, 7.0, '#ffd9a0', 2.0, 0.3);
    painelTeto(-14.0, 4.8, 1.4, 0.5); painelTeto(-12.5, 9.6, 1.4, 0.5);
    pois.push({ x: -16.4, z: 5.3, rot: -Math.PI / 2, nome: 'café', no: N.k7 }, { x: -16.4, z: 8.6, rot: -Math.PI / 2, nome: 'geladeira', no: N.k6 },
      { x: -13.2, z: 5.8, rot: 0, nome: 'ilha', no: N.kin2 }, { x: -10.7, z: 9.5, rot: Math.PI / 2, nome: 'lanches', no: N.k4 },
      { x: -13.2, z: 8.1, rot: Math.PI, sentar: true, no: N.k5, nome: 'banco' }); }

  // ---------- BANHEIROS (x -9..-5, z 3..7) e DEPÓSITO (z 7..11) ----------
  for (const [cx, tp] of [[-8, 'toilet'], [-6, 'toilet']]) { K('toilet', cx + 0.5, 6.4, { h: 0.75, rot: Math.PI }); K('bathroomSink', cx - 0.5, 4.2, { h: 0.9, rot: Math.PI / 2 }); K('bathroomMirror', cx - 0.88, 4.2, { h: 0.7, y: 1.2, rot: Math.PI / 2 }); painelTeto(cx, 5, 0.6, 0.4); }
  { K('washerDryerStacked', -8.0, 10.4, { h: 1.5, col: true }); K('cardboardBoxClosed', -6.0, 10.4, { h: 0.5, col: true }); K('trashcan', -8.4, 8.0, { h: 0.5 }); K('bookcaseOpen', -5.35, 8.4, { h: 1.7, rot: -Math.PI / 2, col: true }); painelTeto(-7, 9, 0.8, 0.4); }
  pois.push({ x: -8.0, z: 5.3, rot: Math.PI, nome: 'banheiro', no: N.w1 }, { x: -6.0, z: 5.3, rot: Math.PI, nome: 'banheiro', no: N.w2 });

  // ---------- RECEPÇÃO (x -5..3, z 3..11; espinha de madeira) ----------
  { // parede de ripas escuras com a placa grande AGÊNCIA IA DREAM (face leste da parede x=-5)
    const rp = new THREE.Mesh(new THREE.PlaneGeometry(5.0, 2.4), new THREE.MeshStandardMaterial({ map: rep(texRipas(), 5, 1.2), roughness: 0.8 })); rp.position.set(-4.9, 1.4, 5.6); rp.rotation.y = Math.PI / 2; cena.add(rp);
    caixa(0.06, 2.5, 5.1, MAD_ESC, -4.93, 0.1, 5.6, cena, false);
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 0.9), new THREE.MeshBasicMaterial({ map: texPlaca('AGÊNCIA IA DREAM', 'EQUIPE DE IA · SEMPRE LIGADA'), toneMapped: false })); pl.position.set(-4.84, 1.7, 5.6); pl.rotation.y = Math.PI / 2; cena.add(pl);
    // balcão em L com tampo claro, monitor, vasinho, plaquinha RECEPCIONISTA
    const b = grupo(-3.5, 6.2, Math.PI / 2); caixaR(3.2, 1.05, 0.8, mat('#4a2f1d', 0.6), 0, 0, 0, b, 0.05); caixaR(3.4, 0.06, 1.0, MAD_CL, 0, 1.05, 0, b, 0.02); caixaR(0.8, 1.05, 1.6, mat('#4a2f1d', 0.6), 1.2, 0, -1.2, b, 0.05); caixaR(1.0, 0.06, 1.8, MAD_CL, 1.2, 1.05, -1.2, b, 0.02);
    plano(1.5, 0.28, new THREE.MeshBasicMaterial({ map: texPlaca('RECEPCIONISTA', ''), toneMapped: false }), -0.6, 0.62, 0.41, 0, b);
    caixa(0.7, 0.04, 0.4, PRETO, -0.5, 1.11, -0.05, b); caixa(0.04, 0.26, 0.04, METAL, -0.5, 1.15, -0.05, b); plano(0.56, 0.34, telasGen[0], -0.5, 1.55, -0.02, Math.PI, b); caixa(0.62, 0.38, 0.03, PRETO, -0.5, 1.38, -0.04, b);
    vasinho(0.7, 1.11, 0.0, b); vasinho(1.2, 1.11, -1.8, b); K('lampRoundTable', 1.0, -1.0, { h: 0.4, y: 1.11, p: b }); K('laptop', 0.1, 0.0, { w: 0.34, y: 1.11, p: b, rot: Math.PI });
    colisorR(-3.5, 6.2, 3.4, 1.0, Math.PI / 2); colisor(-4.0, 4.8, 1.0, 1.9);
    for (const pz of [5.0, 8.4]) { const g = grupo(1.4, pz, -Math.PI / 2); caixaR(0.7, 0.35, 0.7, mat('#7a1f2a', 0.8), 0, 0.12, 0, g, 0.1); caixaR(0.7, 0.5, 0.18, mat('#7a1f2a', 0.8), 0, 0.4, -0.3, g, 0.08); colisor(1.4, pz, 0.8, 0.8); }
    mesaSimples(1.9, 6.7, 0.5, 0.6, 0, 0.5, MAD); K('books', 1.9, 6.7, { w: 0.25, y: 0.52 });
    { const sc = grupo(1.9, 3.9); cil(0.28, 0.28, 0.1, PRETO, 0, 0, 0, sc, 14); cil(0.22, 0.22, 1.0, mat('#b3262c', 0.5), 0, 0.1, 0, sc, 16); colisor(1.9, 3.9, 0.6, 0.6); } // saco de pancada vermelho
    K('lampRoundFloor', -3.8, 10.4, { h: 1.5 }); planta(-4.0, 3.5, 1.4); bananeira(2.5, 10.4, 1.5); planta(2.5, 3.5, 1.2); K('coatRackStanding', -1.0, 10.6, { h: 1.7 });
    tapete(-0.6, 7.4, 3.4, 3.0, '#d9c4a0', '#7a1f2a'); cortica(2.88, 1.6, 9.3, -Math.PI / 2, 1.1, 0.8); relogio(2.9, 2.3, 5.4, -Math.PI / 2);
    pendenteConico(-3.5, 6.2, '#ffc77a', 2.0, 0.3); pendenteConico(-3.5, 7.5, '#ffc77a', 2.0, 0.3); painelTeto(0, 5.0, 1.6, 0.5); painelTeto(0, 9.4, 1.6, 0.5);
    janela(-3.0, 1.6, Z1 - 0.16, Math.PI, 1.6, 1.0); janela(1.6, 1.6, Z1 - 0.16, Math.PI, 1.2, 1.0);
    pois.push({ x: -2.3, z: 6.8, rot: Math.PI / 2 + Math.PI, nome: 'recepção', no: N.r2 }, { x: 1.4, z: 5.0, rot: -Math.PI / 2, sentar: true, no: N.r2, nome: 'espera', via: [{ x: 0.6, z: 5.0 }] }, { x: 1.4, z: 8.4, rot: -Math.PI / 2, sentar: true, no: N.r3, nome: 'espera', via: [{ x: 0.6, z: 8.4 }] },
      { x: -1.0, z: 9.4, rot: 0, nome: 'entrada', no: N.r3 }); }
  // marquise de entrada
  { const mq = grupo(-1, Z1 + 1.6);
    caixa(5.4, 0.1, 3.4, mat('#9fb4c2', 0.2, 0.2, { transparent: true, opacity: 0.28, depthWrite: false }), 0, 2.85, 0, mq, false);
    for (const sz of [-1.7, 1.7]) caixa(5.5, 0.08, 0.1, QUADRO, 0, 2.85, sz, mq, false); for (const sx of [-2.7, 2.7]) caixa(0.08, 0.08, 3.4, QUADRO, sx, 2.85, 0, mq, false);
    for (const lx of [-2.6, 2.6]) cil(0.09, 0.09, 2.85, PRETO, lx, 0, 1.5, mq, 8);
    plano(2.4, 0.4, new THREE.MeshBasicMaterial({ map: texPlaca('AGÊNCIA IA DREAM', ''), toneMapped: false }), 0, 3.15, 1.75, 0, mq); pool(-1, Z1 + 2.0, 5, 0.6); }

  // ---------- luzes (poucas, por zona) ----------
  const hemi = new THREE.HemisphereLight(0xcdb28e, 0x4a3020, 0.8); cena.add(hemi);
  const sol = new THREE.DirectionalLight(0xffdcb0, 1.3);
  sol.position.set(-6, 40, 14); sol.target.position.set(0, 0, 0); cena.add(sol.target);
  sol.castShadow = true; sol.shadow.mapSize.set(2048, 2048);
  Object.assign(sol.shadow.camera, { left: -24, right: 24, top: 16, bottom: -16, near: 5, far: 80 });
  sol.shadow.bias = -0.0005; sol.shadow.normalBias = 0.03; sol.shadow.radius = 4; cena.add(sol);
  const pontos = [[-7.5, -8, 26], [-14.5, -8, 22], [0, -8, 24], [-7.5, -0.5, 28], [-14.5, 0, 20], [-13.2, 7, 28], [-1, 7, 30], [10, -5, 34], [10, 2, 34], [10, 8, 30]];
  for (const [x, z, k] of pontos) { const l = new THREE.PointLight(0xffb468, k, 11, 2); l.position.set(x, 2.5, z); l.userData.k = k; cena.add(l); luzesPonto.push(l); }

  function definirNoite(noite) {
    cena.background.copy(noite ? ceuNoite : ceuDia); cena.fog.color.copy(noite ? ceuNoite : ceuDia);
    hemi.intensity = noite ? 0.75 : 1.2; hemi.color.set(noite ? 0xcdb28e : 0xdbe9ff);
    sol.intensity = noite ? 1.3 : 2.4; sol.color.set(noite ? 0xffdcb0 : 0xffffff);
    gramaM.color.set(noite ? '#ffffff' : '#9fc58a');
    for (const m of neon) { if (m.userData._k == null) m.userData._k = m.emissiveIntensity; m.emissiveIntensity = m.userData.janela ? (noite ? 1.2 : 0.2) : (noite ? m.userData._k : m.userData._k * 0.5); }
    for (const l of luzesPonto) l.intensity = noite ? l.userData.k : l.userData.k * 0.35;
    for (const p of pools) p.material.opacity = noite ? p.userData.op : 0;
  }
  definirNoite(true);

  // ---------- desempenho: funde as peças fixas que usam o mesmo material ----------
  function fundirEstaticos() {
    cena.updateMatrixWorld(true);
    const dinamicos = new Set(); cena.traverse((o) => { if (o.userData.dinamico) dinamicos.add(o); });
    const porChave = new Map(), antigos = [];
    cena.traverse((o) => {
      if (!o.isMesh || o.isInstancedMesh || o.userData.fixo || o.material.transparent || (o.material.isMeshBasicMaterial && o.material.map === GLOW)) return;
      for (let p = o.parent; p && p !== cena; p = p.parent) if (dinamicos.has(p)) return;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      if (Array.isArray(o.material)) return;
      const chave = o.material.uuid + (o.castShadow ? 'c' : 'n');
      if (!porChave.has(chave)) porChave.set(chave, { material: o.material, cast: o.castShadow, geos: [] });
      let g = o.geometry.clone(); if (g.index) g = g.toNonIndexed();
      g.applyMatrix4(o.matrixWorld);
      for (const nome of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(nome)) g.deleteAttribute(nome);
      if (!g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
      porChave.get(chave).geos.push(g); antigos.push(o);
    });
    for (const o of antigos) { o.parent.remove(o); o.geometry.dispose(); }
    for (const { material, cast, geos } of porChave.values()) {
      const me = new THREE.Mesh(mergeGeometries(geos, false), material);
      me.castShadow = cast; me.receiveShadow = true; me.matrixAutoUpdate = false; cena.add(me); geos.forEach((g) => g.dispose());
    }
  }
  fundirEstaticos();

  // ---------- zonas (câmera) ----------
  const zonas = {
    geral: { nome: 'Visão Geral', alvo: [0, 0, 0], dist: 44, orbita: true },
    gerencia: { nome: 'Gerência', alvo: [-7.5, 0.3, -8], dist: 11 },
    salao: { nome: 'Salão', alvo: [11, 0.3, 0], dist: 24 },
    lounge: { nome: 'Lounge', alvo: [-4, 0.3, 0], dist: 14 },
    cozinha: { nome: 'Cozinha', alvo: [-13.5, 0.3, 7], dist: 11 },
    recepcao: { nome: 'Recepção', alvo: [-1, 0.3, 7], dist: 12 },
    reuniao: { nome: 'Reunião', alvo: [-14.5, 0.3, -8], dist: 11 },
  };
  const rects = { gerencia: [-11, -4, -11, -5], salao: [3, 18, -11, 11], lounge: [-11, 3, -3, 3], cozinha: [-18, -9, 3, 11], recepcao: [-5, 3, 3, 11], reuniao: [-18, -11, -11, -5] };
  for (const [k, z] of Object.entries(zonas)) { const r = rects[k] || [0, 0, 0, 0]; SALAS[k] = { nome: z.nome, x0: r[0], x1: r[1], z0: r[2], z1: r[3] }; }

  // ---------- por quadro: paredes que abaixam + portas que abrem quando alguém chega perto ----------
  function atualizar(camera, dt, t, pessoas = []) {
    const k = Math.min(1, dt * 7), aerea = camera.position.y > 7;
    for (const p of paredes) {
      let alvo;
      if (p.interna) alvo = aerea ? 0.55 : 1;
      else alvo = ((camera.position.x - p.cx) * p.normal.x + (camera.position.z - p.cz) * p.normal.y > 0.3) ? 0.16 : 1;
      p.escala += (alvo - p.escala) * k; p.g.scale.y = p.escala;
    }
    for (const P of portas) {
      let perto = false;
      for (const q of pessoas) if (Math.hypot(q.x - P.cx, q.z - P.cz) < 1.35) { perto = true; break; }
      const alvo = perto ? 1 : 0, kk = Math.min(1, dt * (perto ? 6 : 3.2));
      P.k += (alvo - P.k) * kk; if (Math.abs(alvo - P.k) < 0.002) P.k = alvo;
      const e = P.k * P.k * (3 - 2 * P.k); // ease
      if (P.tipo === 'correr') for (const pt of P.partes) pt.p.position.x = pt.x0 + pt.s * e * (P.larg / 2 - 0.05);
      else P.partes[0].p.rotation.y = -e * (Math.PI / 2) * 0.96 * P.lado;
    }
    for (const f of animados) f(t);
  }

  return { cena, colisores, salas, pois, zonas, rota, atualizar, definirNoite, telaCerebro, limites, centro, portas, grafo: { nos, viz, N } };
}
