// BONECOS "ESCRITÓRIO DE REFERÊNCIA" (Fase 2, 13/11/2026): low-poly facetado (flat shading), proporção quase realista (~7 cabeças),
// rosto de poucos planos com olhos pequenos escuros, mãos de luva, roupas de escritório (colete, gravata, camisa xadrez, crachá, fone no pescoço).
// Gerador paramétrico: sexo (corpo 'm'|'f') · idade ('jovem'|'adulto'|'velho') · pele · cabelo · roupa · acessórios. Ver ANALISE-BONECOS.md.
// Base: rig por articulações do personagem.js anterior (backup em antigo/personagem-antes-bonecos-ref.js). Sem TRELLIS aqui: ?bonecos=trellis volta ao personagem.js.
//
// (texto antigo) Personagens 3D CARTOON (estilo animação 3D/Pixar), 100% procedurais — sem modelos externos.
//
// Rig por articulações (hierarquia de THREE.Group): pelve → coluna → peito → pescoço → cabeça; ombro → cotovelo → pulso (×2);
// quadril → joelho → tornozelo (×2). Cada articulação carrega UMA malha com vertex colors (corpo + roupas + acessórios
// daquela parte juntos, material compartilhado entre os 15 personagens) — poucas chamadas de desenho.
// Formas gorduchas e suaves: cápsulas, esferas achatadas, caixas arredondadas, lathe. Cabeça grande (~1/4 da altura).
// Rosto: olhos grandes (esclera, íris, pupila, brilho), sobrancelhas, nariz, boca (sorriso/neutro/falando), orelhas,
// cílios e lábios na versão feminina, piscar, olhar ao redor. 14 penteados, barbas, óculos, fone, boné, gorro, etc.
//
// API (não mudou): carregarModelos() · criarPersonagem(slug) → { raiz, corpo, partes, ciclo, ... } · posar(p, pose, t, fase, dt) · VISUAL.
//   raiz  : Group a adicionar na cena (personagem voltado para +z; pés em y=0 em pé).
//   corpo : Group filho de raiz; corpo.position.y sobe/desce entre sentado (quadril a 0,58 m) e em pé.
//   partes: malhas clicáveis (cápsula invisível).
// POSES: 'parado' | 'trabalhando' | 'concluido' (sentado) · 'em_pe' | 'andando' (usa p.ciclo e p.vel) ·
//   novas em pé: 'conversando' (gesticula e fala), 'apontando' (braço direito aponta), 'olhando_janela' (olha para o lado).
// p.ciclo : avança com a distância andada (como antes: += dt*vel*6.2); a fase do passo é integrada por dentro.
// p.vel   : velocidade em m/s (opcional; padrão 1,4; se não vier é estimada por p.ciclo). ~1,4 caminhada · 2,5 rápido · 3,5+ corrida.
// p.fala  : (opcional, 0..1) abre a boca; em 'conversando' a boca mexe sozinha.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// ---------- quem é quem ----------
// corpo 'm'|'f' · pele · olhos · cabelo (estilo) + corCabelo · barba ('cavanhaque'|'barba'|'rala') + bigode ·
// casaco {tipo: moletom|zip|bomber|cardiga|blazer|casaca, cor, capuz, ribana} · capuzCor (só o capuz, sob outro casaco) ·
// camiseta (cor) · camisa/colete/laco (gerente) · vestido (cor) · baixo {tipo: reta|jeans|cargo|jogger|legging|short|saia, cor, listras, detalhe, cinto} ·
// meia {cor} (3/4) · sapato {tipo: tenis|tenisAlto|bota|social, cor, sola, detalhe, cadarco} ·
// acess {oculos: redondo|quadrado|escuros, corArmacao, fone, bone, gorro, brinco, relogio, corrente, cachecol, mochila}
// Penteados: lado, undercut, franja, cacheado, topete, raspado, coque, rabo, liso_longo, cachos_longos, dois_coques, afro, tranca, bob.
// ---- 6 ARQUÉTIPOS (padrão do vídeo: roupa de escritório, cores terrosas, crachá, fone no pescoço) ----
const SAPATO_PRETO = { tipo: 'social', cor: '#141416' };
export const ARQUETIPOS = {
  // homem jovem: camiseta com </>, camisa xadrez aberta, óculos, gorro, fone no pescoço, crachá (desenvolvedor do vídeo)
  'arq-homem-jovem':  { corpo: 'm', idade: 'jovem', pele: '#e1a57a', olhos: '#3a2414', cabelo: 'undercut', corCabelo: '#6a4a2a',
                        camiseta: '#d8c9a8', estampa: '</>', casaco: { tipo: 'cardiga', cor: '#9a4a25', ribana: '#6e2f18' },
                        baixo: { tipo: 'reta', cor: '#1b1b1f' }, sapato: { tipo: 'tenis', cor: '#2a2a2e', sola: '#e9e9e7', detalhe: '#2a2a2e', cadarco: '#d0d0d0' },
                        acess: { oculos: 'quadrado', corArmacao: '#111114', gorro: '#8a6a3a', fonePescoco: '#4b4a32', cracha: true } },
  // homem adulto: barba ruiva, colete vinho, camisa azul-acinzentada, gravata, calça preta (colega da sinuca)
  'arq-homem-adulto': { corpo: 'm', idade: 'adulto', pele: '#e8b890', olhos: '#4a2a18', cabelo: 'lado', corCabelo: '#a8431c', barba: 'barba',
                        camisa: '#9fb3c8', colete: '#4a1a22', gravata: '#17161a', baixo: { tipo: 'reta', cor: '#17171a' }, sapato: SAPATO_PRETO, acess: { cracha: true } },
  // homem mais velho: careca com laterais brancas, bigode, terno preto e camisa branca (senhor da cozinha)
  'arq-homem-velho':  { corpo: 'm', idade: 'velho', pele: '#e6b894', olhos: '#4a3a2a', cabelo: 'calvo', corCabelo: '#e4e4e2', bigode: true,
                        casaco: { tipo: 'blazer', cor: '#1b1b1f' }, camisa: '#f2f2ee', baixo: { tipo: 'reta', cor: '#17171a' }, sapato: SAPATO_PRETO, acess: { cracha: true } },
  // mulher jovem: camiseta mostarda, cabelo preso, sem acessórios pesados (moça da sinuca)
  'arq-mulher-jovem': { corpo: 'f', idade: 'jovem', pele: '#e9b48a', olhos: '#3a2414', cabelo: 'rabo', corCabelo: '#3a2416',
                        camiseta: '#d9a02a', baixo: { tipo: 'reta', cor: '#17171a' }, sapato: { tipo: 'tenis', cor: '#2a2a2e', sola: '#e9e9e7', detalhe: '#2a2a2e' },
                        acess: { brinco: '#d4af37', cracha: true } },
  // mulher adulta: cabelo loiro em bob, colete escuro sobre camisa clara (gerente do vídeo)
  'arq-mulher-adulta':{ corpo: 'f', idade: 'adulto', pele: '#f0cfae', olhos: '#4a6a8a', cabelo: 'bob', corCabelo: '#d9c08a',
                        camisa: '#e9e6dc', colete: '#2f2f35', baixo: { tipo: 'reta', cor: '#26262c' }, sapato: SAPATO_PRETO, acess: { cracha: true } },
  // mulher mais velha: coque grisalho, óculos, cardigã e colar (arquétipo da senhora de óculos do vídeo, versão madura)
  'arq-mulher-velha': { corpo: 'f', idade: 'velho', pele: '#ecc7a4', olhos: '#4a5a6a', cabelo: 'coque', corCabelo: '#d4d4d2',
                        camiseta: '#f2f0ea', casaco: { tipo: 'cardiga', cor: '#b02a2a', ribana: '#7e1c1c' }, baixo: { tipo: 'reta', cor: '#2a2a30' }, sapato: SAPATO_PRETO,
                        acess: { oculos: 'redondo', corArmacao: '#111114', corrente: true, cracha: true } },
};
const A = (arq, o) => ({ ...ARQUETIPOS[arq], ...o });
const TENIS = (cor, det) => ({ tipo: 'tenis', cor, sola: '#e9e9e7', detalhe: det || cor, cadarco: '#d0d0d0' });
// ---- agentes: arquétipo + variações (cor da roupa, cabelo, pele, acessórios). O crachá leva a cor do agente (PERFIL). ----
export const VISUAL = {
  ...ARQUETIPOS,
  // gerente: homem adulto de colete grafite, camisa branca e gravata vinho (mantém o espírito da referência img1)
  'gerente-geral':          A('arq-homem-adulto', { pele: '#e3ac84', olhos: '#5a3a22', corCabelo: '#4a3426', barba: undefined, camisa: '#f4f3ef', colete: '#2a2a30', gravata: '#8a1f2b' }),
  desenvolvedor:            A('arq-homem-jovem'),
  'especialista-ganchos':   A('arq-homem-jovem', { pele: '#a8714a', olhos: '#2e1c10', cabelo: 'cacheado', corCabelo: '#1a120d', camiseta: '#e8e2d2', estampa: undefined, barba: 'rala',
                              casaco: { tipo: 'zip', cor: '#6b1f2e', curta: true, friso: '#e8e2d2' }, baixo: { tipo: 'jeans', cor: '#3a5a8a' }, sapato: TENIS('#f1f1ee', '#6b1f2e'),
                              acess: { fonePescoco: '#2a2a30', cracha: true } }),
  'editor-de-video':        A('arq-homem-jovem', { pele: '#c9895e', olhos: '#5a3418', cabelo: 'topete', corCabelo: '#1a1410', mechas: '#d946ef', camiseta: '#c43fb8', estampa: undefined, barba: 'rala',
                              casaco: { tipo: 'zip', cor: '#2c2c31', curta: true, friso: '#d946ef' }, baixo: { tipo: 'jogger', cor: '#1d1d21' }, sapato: TENIS('#2c2c31', '#d946ef'),
                              acess: { fonePescoco: '#1c1c20', cracha: true } }),
  'especialista-frases':    A('arq-homem-adulto', { pele: '#d49a70', olhos: '#5a3418', cabelo: 'topete', corCabelo: '#17110d', barba: 'rala', camisa: undefined, colete: undefined, gravata: undefined,
                              camiseta: '#2a8f86', baixo: { tipo: 'reta', cor: '#2a2e36' }, sapato: TENIS('#d8d3c4', '#8c8672') }),
  'editor-viral-podcast':   A('arq-homem-adulto', { gravata: '#17161a' }),
  'dev-seguranca':          A('arq-homem-adulto', { pele: '#7a4a2e', olhos: '#1d120b', cabelo: 'raspado', corCabelo: '#0f0f0f', barba: 'cavanhaque', bigode: true,
                              camisa: undefined, colete: undefined, gravata: undefined, camiseta: '#aab4c2', emblema: 'SEC',
                              baixo: { tipo: 'cargo', cor: '#15171c' }, sapato: { tipo: 'bota', cor: '#111113', sola: '#1b1b1d' }, acess: { bone: '#15171c', cracha: true } }),
  vendedor:                 A('arq-homem-adulto', { pele: '#6a4026', olhos: '#2c1a10', cabelo: 'raspado', corCabelo: '#0f0c0a', camisa: '#e87a2a', colete: undefined, gravata: '#1b1b1f',
                              baixo: { tipo: 'reta', cor: '#23252b' }, acess: { relogio: true, cracha: true } }),
  'editor-de-palestras':    A('arq-homem-velho', { pele: '#d9a98a', corCabelo: '#d8d8d6', bigode: undefined, barba: 'rala' }),
  oraculo:                  A('arq-homem-velho', { pele: '#c68a60', olhos: '#3a2414', cabelo: 'curto_grisalho', corCabelo: '#d8d8d8', bigode: undefined, barba: 'barba',
                              casaco: { tipo: 'cardiga', cor: '#4b2f7a', ribana: '#34205a' }, camisa: undefined, camiseta: '#d9d3e8', acess: { oculos: 'redondo', corArmacao: '#2a2a2e', cracha: true } }),
  contador:                 A('arq-homem-velho', { pele: '#f0c9a0', olhos: '#5a7a9a', corCabelo: '#9a9a9a', bigode: undefined, barba: 'rala', casaco: { tipo: 'cardiga', cor: '#7b8088', ribana: '#5d6168' },
                              camisa: '#a9c1d9', gravata: '#3b4a6b', baixo: { tipo: 'reta', cor: '#3a3d44' }, acess: { oculos: 'quadrado', corArmacao: '#2a2a2e', cracha: true } }),
  'web-designer':           A('arq-mulher-jovem', { pele: '#f6d3b5', olhos: '#3a6a9a', corCabelo: '#a8432c', camiseta: '#f07a2a', baixo: { tipo: 'jeans', cor: '#3a5a8a' }, sapato: TENIS('#f5f5f4', '#e9e9e7') }),
  'especialista-instagram': A('arq-mulher-jovem', { cabelo: 'bob', corCabelo: '#17110f', ondulado: true }),
  'social-media':           A('arq-mulher-jovem', { pele: '#e7ae86', olhos: '#4a2a18', cabelo: 'franja', corCabelo: '#6a4328', repicado: true, camiseta: '#f2f2f0',
                              casaco: { tipo: 'cardiga', cor: '#b02a2a', ribana: '#7e1c1c' }, acess: { oculos: 'redondo', corArmacao: '#111114', brinco: '#d4af37', cracha: true } }),
  copywriter:               A('arq-mulher-adulta'),
  'gestor-de-trafego':      A('arq-mulher-adulta', { pele: '#7a4a2e', olhos: '#1d120b', cabelo: 'cachos_longos', corCabelo: '#1a100a', camisa: undefined, colete: undefined,
                              camiseta: '#e6e6e0', casaco: { tipo: 'blazer', cor: '#12a4a4' }, baixo: { tipo: 'reta', cor: '#2a2d33' }, acess: { oculos: 'quadrado', corArmacao: '#12a4a4', cracha: true } }),
  analista:                 A('arq-mulher-adulta', { pele: '#b07548', olhos: '#2c1a10', cabelo: 'coque', corCabelo: '#3b2314', camisa: undefined, colete: undefined, camiseta: '#e9e4ee',
                              casaco: { tipo: 'cardiga', cor: '#a82a2a', ribana: '#7a1d1d' }, acess: { oculos: 'redondo', corArmacao: '#111114', corrente: true, cracha: true } }),
  atendente:                A('arq-mulher-velha', { casaco: { tipo: 'cardiga', cor: '#3f7a52', ribana: '#2f5e3f' }, baixo: { tipo: 'saia', cor: '#35435a' } }),
};
const PADRAO = { corpo: 'm', pele: '#d9a273', olhos: '#4a2a18', cabelo: 'lado', corCabelo: '#3b2314', camiseta: '#f5f5f4',
  baixo: { tipo: 'reta', cor: '#374151' }, sapato: { tipo: 'tenis', cor: '#f5f5f4' } };
// (estilos de cabelo usados: lado, topete (×2), cacheado, afro, raspado... veja penteado(); 'bob' e 'coque' também em versão feminina)

// ---------- medidas (metros) ----------
const H0 = 0.78;                   // altura do quadril em pé
const COXA = 0.35, CANELA = 0.35, TORN = 0.08; // H0 = COXA + CANELA + TORN
const CAB = { rx: 0.17, ry: 0.21, rz: 0.185, cy: 0.19 }; // cabeça (centro a 0,19 m do pivô)
const lerp = (a, b, k) => a + (b - a) * k;
const grampo = (x, a, b) => Math.min(b, Math.max(a, x));
const suave = (a, b, x) => { const t = grampo((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

// Agentes com boneco 3D "de verdade" (gerado de graça pelo TRELLIS a partir da imagem do CEO + esqueleto por código).
// Para adicionar um: gerar o GLB, pôr em modelos/ e listar aqui slug -> arquivo.
export async function carregarModelos() { /* nada a baixar: tudo é gerado por código */ }

// ---------- formas básicas ----------
const esf = (rx, ry = rx, rz = rx, seg = 14) => new THREE.SphereGeometry(1, Math.max(5, Math.round(seg * 0.42)), Math.max(4, Math.round(seg * 0.3))).scale(rx, ry, rz); // low-poly
const caixa = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const anel = (R, r, seg = 22) => new THREE.TorusGeometry(R, r, 4, Math.max(8, Math.round(seg * 0.4))).rotateX(Math.PI / 2);
const cil = (rt, rb, h, seg = 16) => new THREE.CylinderGeometry(rt, rb, h, Math.max(6, Math.round(seg * 0.4)));
function lathe(pts, zs = 1, seg = 24, p0 = 0, p1 = Math.PI * 2) {
  const n = Math.max(6, Math.round(seg * 0.27));
  if (p0 === 0 && p1 === Math.PI * 2) p0 = Math.PI / n;   // faceta plana (não aresta) na frente
  return new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), n, p0, p1).scale(1, 1, zs);
}
// cápsula cônica vertical: topo (esfera r0) no y=0, desce `len` até a esfera r1
function caps(len, r0, r1, seg = 28) {
  const p = [];
  for (let k = 0; k <= 2; k++) { const a = k / 2 * Math.PI / 2; p.push([r1 * Math.sin(a), -len - r1 * Math.cos(a)]); }
  for (let k = 1; k <= 1; k++) { const t = k / 2; p.push([lerp(r1, r0, t), -len * (1 - t)]); }
  for (let k = 0; k <= 2; k++) { const a = k / 2 * Math.PI / 2; p.push([r0 * Math.cos(a), r0 * Math.sin(a)]); }
  return lathe(p, 1, seg);
}
const MT = (p = [0, 0, 0], r = [0, 0, 0], s = [1, 1, 1]) => new THREE.Matrix4().compose(new THREE.Vector3(...p), new THREE.Quaternion().setFromEuler(new THREE.Euler(...r)), new THREE.Vector3(...s));

// acumula peças (geometria + cor) por articulação; no fim vira uma malha única por articulação
class Montador {
  constructor() { this.por = {}; }
  add(junta, geo, cor, m) {
    const g = geo.index ? geo.toNonIndexed() : geo.clone();
    if (m) g.applyMatrix4(m);
    const n = g.attributes.position.count, col = new Float32Array(n * 3), c = new THREE.Color(cor);
    for (let i = 0; i < n; i++) { col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'color'].includes(k)) g.deleteAttribute(k);
    (this.por[junta] = this.por[junta] || []).push(g);
  }
  malha(junta, mat) {
    const l = this.por[junta]; if (!l || !l.length) return null;
    const m = new THREE.Mesh(mergeGeometries(l), mat);
    m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false;
    return m;
  }
}
const matCorpo = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.88, metalness: 0, flatShading: true, side: THREE.DoubleSide });
const escurece = (hex, f) => '#' + new THREE.Color(hex).multiplyScalar(f).getHexString();
const clareia = (hex, f) => '#' + new THREE.Color(hex).lerp(new THREE.Color('#ffffff'), f).getHexString();

// ---------- corpo e roupas ----------
// perfil do tronco (raio, altura relativa ao pivô do peito); `grow` engorda para casacos
function perfilTronco(m, grow, yMin = -0.17) {
  const base = m ? [[0.150, -0.17], [0.150, -0.10], [0.168, 0], [0.190, 0.10], [0.200, 0.17], [0.165, 0.225], [0.07, 0.255], [0, 0.262]]
    : [[0.135, -0.17], [0.112, -0.09], [0.14, 0], [0.165, 0.10], [0.172, 0.17], [0.14, 0.225], [0.06, 0.255], [0, 0.262]];
  const p = base.filter(([, y]) => y >= yMin).map(([r, y]) => [r > 0 ? r + grow : 0, y]);
  if (yMin > -0.17) { const i = base.findIndex(([, y]) => y >= yMin); const [r0, y0] = base[i - 1], [r1, y1] = base[i]; p.unshift([lerp(r0, r1, (yMin - y0) / (y1 - y0)) + grow, yMin]); }
  return p;
}
const ZT = 0.72; // achatamento (profundidade/largura) do tronco

// abas/saias: dois painéis, um preso a cada quadril, para acompanharem as coxas (fendas na frente e atrás)
function abas(M, cor, comp, rTopo, rFim, fg, bg, k = 1) {
  const pts = [[rFim, -comp], [lerp(rFim, rTopo, 0.5), -comp * 0.5], [rTopo, 0.03]];
  for (const s of [1, -1]) {
    const geo = s > 0 ? lathe(pts, 0.78, 22, fg, Math.PI - fg - bg) : lathe(pts, 0.78, 22, Math.PI + bg, Math.PI - fg - bg);
    M.add(s > 0 ? 'quadrilL' : 'quadrilR', geo, cor, MT([-s * 0.085, 0, 0]));
  }
}

function perna(len, r0, r1, rFim) { // tubo aberto embaixo (barra da calça)
  return lathe([[rFim, -len], [lerp(rFim, r1, 0.5), -len * 0.8], [r1, -len * 0.45], [r0, 0], [r0 * 0.9, 0.035]], 1, 26);
}

function montarCorpo(v) {
  const M = new Montador(), m = v.corpo === 'm', k = m ? 1 : 0.86, kf = v.forte ? 1.2 : 1;
  const cas = v.casaco, bx = v.vestido ? { tipo: 'vestido', cor: v.vestido } : v.baixo, pele = v.pele;
  const corCamisa = v.vestido || v.camisa || v.camiseta;
  const ombroX = m ? 0.19 : 0.165;
  // ----- pelve (cor do que cobre o quadril) -----
  const corPelve = bx.cor;
  M.add('pelve', lathe([[0.01, -0.105], [0.13, -0.10], [0.17, -0.05], [0.175 + (m ? 0 : 0.012), 0.03], [0.15, 0.10], [0.01, 0.105]], 0.78, 26), corPelve);
  // ----- tronco interno: camiseta / camisa / vestido -----
  M.add('peito', lathe(perfilTronco(m, 0.004), ZT, 36), corCamisa);
  // pescoço e cabeça (a cabeça é montada à parte)
  M.add('pescoco', cil(0.05 * k, 0.056 * k, 0.11), pele, MT([0, 0.015, 0]));
  // ----- casaco -----
  const gap = { zip: 0.34, bomber: 0.34, cardiga: 0.55, blazer: 0.42, casaca: 0.5 };
  if (cas) {
    const t = cas.tipo, cor = cas.cor, rib = cas.ribana || escurece(cor, 0.78), fechado = t === 'moletom';
    const grow = t === 'bomber' ? 0.036 : (t === 'moletom' || t === 'zip' ? 0.03 : 0.02);
    const yMin = t === 'bomber' ? -0.12 : (cas.curto ? -0.10 : -0.17);
    M.add('peito', lathe(perfilTronco(m, grow, yMin), ZT, 40, fechado ? 0 : gap[t], fechado ? Math.PI * 2 : Math.PI * 2 - 2 * gap[t]), cor);
    // barra em ribana
    if (cas.ribana || t === 'bomber' || t === 'moletom') {
      const rb = perfilTronco(m, grow * 0.85, yMin)[0][0];
      M.add('peito', anel(rb, 0.026).scale(1, 1, ZT), rib, MT([0, yMin + 0.012, 0]));
    }
    if (!fechado && t !== 'blazer' && t !== 'casaca') { // bordas do casaco aberto: friso/zíper
      const cf = cas.friso || (t === 'cardiga' ? rib : '#b9bdc4');
      for (const s of [1, -1]) for (let y = -0.15; y < 0.23; y += 0.034) {
        if (y < yMin) continue;
        const pf = perfilTronco(m, grow); let r = pf[pf.length - 1][0];
        for (let i = 0; i < pf.length - 1; i++) if (y >= pf[i][1] && y <= pf[i + 1][1]) r = lerp(pf[i][0], pf[i + 1][0], (y - pf[i][1]) / (pf[i + 1][1] - pf[i][1]));
        M.add('peito', esf(0.0095, 0.0125, 0.0095, 8), cf, MT([s * r * Math.sin(gap[t]), y, r * Math.cos(gap[t]) * ZT]));
      }
    }
    // mangas
    for (const s of [1, -1]) {
      const O = s > 0 ? 'ombroL' : 'ombroR', C = s > 0 ? 'cotoveloL' : 'cotoveloR';
      const pf = (t === 'bomber' ? 1.1 : 1) * k * kf, curta = cas.curta;
      M.add(O, caps(curta ? 0.12 : 0.28, 0.078 * pf, curta ? 0.07 * pf : 0.066 * pf), cor);
      if (!curta) {
        M.add(C, perna(v.camisa ? 0.21 : 0.245, 0.068 * pf, 0.06 * pf, 0.052 * pf), cor);
        if (!v.camisa) M.add(C, anel(0.05 * k * kf, 0.021).scale(1, 1, 1), rib, MT([0, -0.235, 0]));
      }
    }
    // capuz caído + cordões + bolso canguru
    if (cas.capuz) {
      M.add('peito', anel(0.092 * k + 0.01, 0.036).scale(1, 1, 0.9), cor, MT([0, 0.222, -0.012]));
      M.add('peito', esf(0.135 * k + 0.02, 0.09, 0.085), cor, MT([0, 0.205, -0.12], [0.5, 0, 0]));
      M.add('peito', esf(0.09, 0.05, 0.05), escurece(cor, 0.35), MT([0, 0.228, -0.045]));
      const cc = cas.cordao || '#f4f4f2';
      for (const s of [1, -1]) {
        const x = (fechado ? 0.045 : gap[t] * 0.2 + 0.075) * s, y0 = 0.18;
        M.add('peito', caps(0.2, 0.0065, 0.0065, 8), cc, MT([x, y0, 0.158], [0.12, 0, 0]));
        M.add('peito', esf(0.0095, 0.02, 0.0095, 8), cc, MT([x, y0 - 0.215, 0.168]));
      }
    }
    if (t === 'moletom') {
      M.add('peito', caixa(0.25 * k + 0.02, 0.12, 0.034, 0.02), clareia(cor, 0.05), MT([0, -0.04, 0.138 + (m ? 0 : -0.01)]));
      for (const s of [1, -1]) M.add('peito', caixa(0.012, 0.085, 0.014, 0.005), escurece(cor, 0.72), MT([s * 0.13 * k, -0.02, 0.152], [0, 0, -s * 0.42]));
    }
    if (t === 'blazer' || t === 'casaca') { // lapelas
      for (const s of [1, -1]) {
        const sh = new THREE.Shape();
        sh.moveTo(0.032, 0.235); sh.lineTo(0.125, 0.2); sh.lineTo(0.098, 0.115); sh.lineTo(0.062, 0.11); sh.lineTo(0.045, -0.05); sh.lineTo(0.028, -0.05); sh.lineTo(0.026, 0.2);
        const g = new THREE.ExtrudeGeometry(sh, { depth: 0.014, bevelEnabled: true, bevelSize: 0.005, bevelThickness: 0.005, bevelSegments: 1 });
        M.add('peito', g, clareia(cor, 0.04), MT([0, 0, 0.138], [0, -s * 0.28, 0], [s, 1, 1]));
      }
      M.add('peito', anel(0.1, 0.03).scale(1, 1, 0.85), cor, MT([0, 0.228, -0.012]));
    }
    if (t === 'blazer' || t === 'cardiga') abas(M, cor, 0.17, 0.19, 0.2, t === 'cardiga' ? 0.3 : 0.2, 0.2);
    if (t === 'casaca') { // aba longa até o joelho com fenda atrás
      abas(M, cor, 0.5, 0.185, 0.25, 0.26, 0.13);
      M.add('peito', caixa(0.36, 0.028, 0.012, 0.005), '#6b1f2a', MT([0, -0.07, -0.142]));
      M.add('peito', caixa(0.035, 0.032, 0.016, 0.004), '#b08d3c', MT([0, -0.07, -0.15]));
    }
    if (t === 'bomber' && v.capuzCor) {
      M.add('peito', anel(0.092 * k + 0.012, 0.036).scale(1, 1, 0.9), v.capuzCor, MT([0, 0.222, -0.012]));
      M.add('peito', esf(0.135 * k + 0.02, 0.09, 0.085), v.capuzCor, MT([0, 0.205, -0.115], [0.5, 0, 0]));
    }
    if (t === 'zip' && !cas.capuz) M.add('peito', anel(0.092 * k + 0.008, 0.026).scale(1, 1, 0.9), cor, MT([0, 0.23, -0.012]));
  } else {
    // sem casaco: mangas curtas da camiseta/vestido
    for (const s of [1, -1]) M.add(s > 0 ? 'ombroL' : 'ombroR', caps(0.12, 0.074 * k * kf, 0.068 * k * kf), corCamisa);
    M.add('peito', anel(0.085 * k, 0.022).scale(1, 1, 0.85), escurece(corCamisa, 0.92), MT([0, 0.222, -0.005]));
  }
  // camisa social (gerente): mangas longas, punhos, gola alta, colete e laço
  if (v.camisa) {
    for (const s of [1, -1]) {
      const O = s > 0 ? 'ombroL' : 'ombroR', C = s > 0 ? 'cotoveloL' : 'cotoveloR';
      M.add(O, caps(0.28, 0.066 * k, 0.057 * k), v.camisa);
      M.add(C, perna(0.245, 0.058 * k, 0.05 * k, 0.045 * k), v.camisa);
      M.add(C, anel(0.048 * k, 0.017), clareia(v.camisa, 0.04), MT([0, -0.238, 0]));
    }
    M.add('peito', cil(0.07, 0.078, 0.06, 20).scale(1, 1, 0.9), v.camisa, MT([0, 0.245, -0.005]));
    if (v.colete) {
      M.add('peito', lathe(perfilTronco(m, 0.016, -0.12).filter(([, y]) => y < 0.2).concat([[0.075, 0.2]]), ZT, 28, 0.2, Math.PI * 2 - 0.4), v.colete);
      for (let y = 0.15; y > -0.1; y -= 0.05) M.add('peito', esf(0.0085, 0.0085, 0.006, 8), '#0b0b0d', MT([0, y, 0.2 * ZT * 1.0 + 0.005 + (y > 0.1 ? -0.005 : 0)]));
    }
    if (v.laco) {
      M.add('peito', esf(0.011, 0.01, 0.009), v.laco, MT([0, 0.222, 0.082]));
      for (const s of [1, -1]) M.add('peito', esf(0.03, 0.014, 0.008), v.laco, MT([s * 0.03, 0.222, 0.082], [0, 0, s * 0.2]));
    }
  }
  // ----- braços de pele (por baixo das mangas), mãos de luva -----
  for (const s of [1, -1]) {
    const O = s > 0 ? 'ombroL' : 'ombroR', C = s > 0 ? 'cotoveloL' : 'cotoveloR', P = s > 0 ? 'pulsoL' : 'pulsoR';
    M.add(O, caps(0.28, 0.056 * k * kf, 0.048 * k * kf), pele);
    M.add(C, caps(0.25, 0.048 * k * kf, 0.038 * k * kf), pele);
    M.add(P, esf(0.05 * k + 0.004, 0.058, 0.048), pele, MT([0, -0.06, 0.004]));            // mão fechada
    M.add(P, esf(0.02 * k + 0.003, 0.032, 0.03), pele, MT([-s * 0.024, -0.052, 0.046]));    // polegar
    M.add(P, esf(0.044 * k + 0.003, 0.016, 0.03), escurece(pele, 0.93), MT([0, -0.108, 0.01])); // dedos dobrados
    if (v.acess && v.acess.relogio && s > 0) {
      M.add(C, anel(0.04, 0.012), '#1a1a1e', MT([0, -0.215, 0]));
      M.add(P, caixa(0.04, 0.012, 0.04, 0.006), '#18181c', MT([0, 0.015, 0.0]));
      M.add(P, caixa(0.032, 0.004, 0.032, 0.002), '#4a5566', MT([0, 0.022, 0.0]));
    }
  }
  pernas(M, v, k, bx);
  return M;
}

function pernas(M, v, k, bx) {
  const t = bx.tipo, cor = bx.cor, pele = v.pele;
  const P = { reta: [0.088, 0.078, 0.074, 0.066, 0.07], jeans: [0.09, 0.08, 0.076, 0.066, 0.07], cargo: [0.105, 0.097, 0.095, 0.088, 0.088], jogger: [0.105, 0.092, 0.092, 0.075, 0.062],
    legging: [0.083, 0.072, 0.066, 0.052, 0.046], short: [0.108, 0.1, 0, 0, 0] }[t];
  const corPerna = v.legging ? v.legging.cor : pele;
  for (const s of [1, -1]) {
    const Q = s > 0 ? 'quadrilL' : 'quadrilR', J = s > 0 ? 'joelhoL' : 'joelhoR';
    M.add(Q, caps(COXA, 0.068 * k, 0.056 * k), corPerna);
    M.add(J, caps(CANELA, 0.056 * k, 0.04 * k), corPerna);
    if (v.legging && v.legging.camuflada) { // manchas de camuflagem
      for (let i = 0; i < 9; i++) {
        const a = i * 2.4, y = -((i * 0.137) % 0.3) - 0.03, jt = i % 2 ? Q : J;
        const r = (jt === Q ? 0.07 : 0.052) * k;
        M.add(jt, esf(0.05, 0.065, 0.02, 8), escurece(v.legging.cor, 0.55), MT([Math.sin(a) * r * 0.97, y, Math.cos(a) * r * 0.97], [0, a, 0]));
      }
    }
    if (P && t !== 'short') {
      M.add(Q, caps(COXA, P[0] * k, P[1] * k), cor);
      M.add(J, perna(CANELA - 0.005, P[2] * k, P[3] * k, P[4] * k), cor);
      if (t === 'jogger') { // bolsa na canela + punho de ribana (dobrado se `dobra`)
        M.add(J, esf(P[2] * k, 0.1, P[2] * k), cor, MT([0, -0.2, 0]));
        M.add(J, anel(0.058 * k, 0.026), bx.ribana || escurece(cor, 0.82), MT([0, -CANELA + 0.045, 0]));
        if (bx.dobra) M.add(J, anel(0.066 * k, 0.022), clareia(cor, 0.1), MT([0, -CANELA + 0.07, 0]));
      }
      if (t === 'jeans' || t === 'reta') M.add(J, anel(P[4] * k, 0.012), escurece(cor, 0.8), MT([0, -CANELA + 0.012, 0]));
      if (t === 'cargo') {
        M.add(Q, caixa(0.036, 0.13, 0.11, 0.012), escurece(cor, 0.92), MT([s * (P[0] * k + 0.01), -0.17, 0]));
        M.add(Q, caixa(0.04, 0.04, 0.114, 0.01), escurece(cor, 0.85), MT([s * (P[0] * k + 0.012), -0.1, 0]));
        if (bx.detalhe) M.add(Q, caixa(0.044, 0.01, 0.116, 0.004), bx.detalhe, MT([s * (P[0] * k + 0.012), -0.122, 0]));
      }
    }
    if (t === 'short') { // short com barra dobrada, meia 3/4 opcional
      const c0 = bx.dobra ? 0.26 : 0.27;
      M.add(Q, caps(c0, P[0] * k, P[1] * k), cor);
      M.add(Q, anel(P[1] * k + 0.002, 0.02), clareia(cor, bx.dobra ? 0.1 : 0.0), MT([0, -c0 - 0.0, 0]));
      if (bx.bolso) M.add(Q, caixa(0.036, 0.13, 0.11, 0.012), escurece(cor, 0.9), MT([s * (P[0] * k + 0.01), -0.12, 0]));
      if (v.meia) M.add(J, caps(0.24, 0.053 * k, 0.05 * k), v.meia.cor, MT([0, -0.12, 0]));
    }
    if (bx.listras) { // duas listras finas na lateral da perna
      const ls = bx.listras, al = t === 'short' ? 0.21 : COXA;
      for (const z of [-0.011, 0.011]) {
        M.add(Q, caixa(0.0055, al - 0.02, 0.008, 0.003), ls, MT([s * ((P ? P[1] : 0.075) * k * 0.98 + 0.004), -al / 2 - 0.005, z], [0, 0, -s * 0.03]));
        if (t !== 'short') M.add(J, caixa(0.0055, CANELA - 0.03, 0.008, 0.003), ls, MT([s * ((P ? P[3] : 0.06) * k * 1.0 + 0.004), -CANELA / 2 - 0.0, z], [0, 0, -s * 0.03]));
      }
    }
    if (t === 'saia' || t === 'vestido') {
      // saia/vestido feitos como abas no fim; aqui nada
    }
    sapato(M, v, s, k);
  }
  if (t === 'saia') abas(M, cor, 0.3, 0.17, 0.2, 0.03, 0.03);
  if (t === 'vestido') { abas(M, cor, 0.33, 0.17, 0.235, 0.03, 0.03); }
}

// ---------- sapatos ----------
function sapato(M, v, s, k) {
  const sp = v.sapato || PADRAO.sapato, T = s > 0 ? 'tornozeloL' : 'tornozeloR', cor = sp.cor, sola = sp.sola || '#f4f4f2', det = sp.detalhe || sola, cad = sp.cadarco || '#f4f4f2';
  const tipo = sp.tipo, w = 0.05 * (k > 0.9 ? 1 : 0.92);
  if (tipo === 'social') {
    M.add(T, esf(w + 0.002, 0.045, 0.14), cor, MT([0, -0.04, 0.045]));
    M.add(T, caixa(w * 2 + 0.004, 0.02, 0.27, 0.008), '#0a0a0b', MT([0, -0.072, 0.045]));
    M.add(T, caixa(0.06, 0.03, 0.05, 0.008), '#0a0a0b', MT([0, -0.066, -0.06]));
    return;
  }
  const alto = tipo === 'tenisAlto' || tipo === 'bota';
  M.add(T, esf(w + 0.012, 0.058, 0.152), cor, MT([0, -0.03, 0.05]));                      // corpo do tênis
  M.add(T, caixa(w * 2 + 0.018, 0.03, 0.3, 0.014), sola, MT([0, -0.065, 0.05]));         // sola grossa
  if (tipo !== 'bota') {
    M.add(T, esf(w + 0.002, 0.042, 0.06), det, MT([0, -0.038, 0.16]));                      // bico
    M.add(T, esf(w - 0.002, 0.045, 0.04), det, MT([0, -0.025, -0.07]));                      // calcanhar
    for (let i = 0; i < 4; i++) M.add(T, caixa(0.056, 0.006, 0.011, 0.003), cad, MT([0, 0.003 - i * 0.002 + 0.0, 0.085 - i * 0.027], [0.35, 0, 0]));
  }
  if (alto) M.add(T, cil(0.052, 0.056, tipo === 'bota' ? 0.2 : 0.1, 16), cor, MT([0, tipo === 'bota' ? 0.07 : 0.02, -0.01]));
  if (tipo === 'bota') { M.add(T, anel(0.058, 0.014), escurece(cor, 0.85), MT([0, 0.17, -0.01])); M.add(T, caixa(0.1, 0.03, 0.06, 0.01), escurece(sola, 0.9), MT([0, -0.062, -0.07])); }
  if (tipo === 'tenisAlto') M.add(T, esf(0.03, 0.03, 0.01), det, MT([s * 0.05, 0.02, -0.01]));
}

// ---------- cabeça: forma, rosto, cabelo, barba, acessórios ----------
function cabecaGeo(grow, th = Math.PI, seg = 10) {
  const geo = new THREE.SphereGeometry(1, seg, 7, 0, Math.PI * 2, 0, th), p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const ux = p.getX(i), uy = p.getY(i), uz = p.getZ(i), t = Math.max(0, -uy);
    const fx = 1 - 0.20 * Math.pow(t, 1.3), fz = 1 - 0.08 * t - (uy > 0 ? 0.05 * uy : 0);
    p.setXYZ(i, ux * (CAB.rx + grow) * fx, uy * (CAB.ry + grow), uz * (CAB.rz + grow) * fz);
  }
  geo.computeVertexNormals();
  return geo;
}
// z da superfície do rosto (na frente) em (x, y) relativos ao centro da cabeça
function zSup(x, y) {
  const uy = y / CAB.ry, t = Math.max(0, -uy), fx = 1 - 0.20 * Math.pow(t, 1.3), fz = 1 - 0.08 * t - (uy > 0 ? 0.05 * uy : 0);
  const ux = x / (CAB.rx * fx);
  return CAB.rz * fz * Math.sqrt(Math.max(0, 1 - ux * ux - uy * uy));
}
const HC = (x, y, z) => [x, y + CAB.cy, z];

// barba: copia só os triângulos da região da cabeça (com furo da boca)
function barbaGeo(tipo) {
  const g = cabecaGeo(0.009).toNonIndexed(), p = g.attributes.position, n = g.attributes.normal, P = [], N = [];
  for (let i = 0; i < p.count; i += 3) {
    let cx = 0, cy = 0, cz = 0;
    for (let k = 0; k < 3; k++) { cx += p.getX(i + k); cy += p.getY(i + k); cz += p.getZ(i + k); }
    const ux = cx / 3 / CAB.rx, uy = cy / 3 / CAB.ry, uz = cz / 3 / CAB.rz, ax = Math.abs(ux);
    let ok;
    const boca = uy > -0.64 && uy < -0.36 && ax < 0.42 && uz > 0.3;
    if (tipo === 'cavanhaque') ok = uy < -0.62 && ax < 0.5 && uz > 0.05;
    else ok = (uy < -0.58 || (uy < -0.08 && ax > 0.62 && uz > -0.25)) && !boca && !(uy > -0.45 && uz > 0.5 && ax < 0.3);
    if (!ok) continue;
    for (let k = 0; k < 3; k++) { P.push(p.getX(i + k), p.getY(i + k), p.getZ(i + k)); N.push(n.getX(i + k), n.getY(i + k), n.getZ(i + k)); }
  }
  const o = new THREE.BufferGeometry();
  o.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); o.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
  return o;
}

function rng(seed) { let s = seed; return () => ((s = (s * 16807) % 2147483647) / 2147483647); }

// penteados: blocos arredondados e macios (nada de fios). Coordenadas relativas ao centro da cabeça.
function penteado(M, v) {
  const est = v.cabelo, cor = v.corCabelo, mecha = v.mechas;
  const cap = (grow, th, tilt, c = cor) => M.add('cabeca', cabecaGeo(grow, th - 0.4), c, MT([0, CAB.cy, 0], [tilt, 0, 0])); // testa livre para as sobrancelhas
  const b = (x, y, z, rx, ry, rz, rot, c = cor, seg = 10) => M.add('cabeca', esf(rx, ry, rz, seg), c, MT(HC(x, y, z), rot || [0, 0, 0]));
  const f = v.corpo === 'f';
  switch (est) {
    case 'topete': // topete esculpido: mechas macias varridas para cima e para trás, laterais baixas
      cap(0.016, 1.8, -0.5);
      b(0, 0.215, 0.06, 0.12, 0.06, 0.15, [-0.5, 0, 0]); b(0, 0.245, -0.03, 0.1, 0.07, 0.14, [-0.25, 0, 0]);
      b(0.06, 0.235, 0.09, 0.05, 0.04, 0.11, [-0.6, 0.15, -0.35]); b(-0.055, 0.235, 0.09, 0.05, 0.04, 0.11, [-0.6, -0.15, 0.35]);
      b(0.0, 0.215, 0.165, 0.07, 0.045, 0.06, [-0.7, 0, 0]); b(0, 0.2, -0.13, 0.15, 0.1, 0.08);
      b(0.1, 0.22, 0.0, 0.045, 0.04, 0.12, [-0.2, 0, -0.5]); b(-0.1, 0.22, 0.0, 0.045, 0.04, 0.12, [-0.2, 0, 0.5]);
      b(0.0, 0.275, -0.07, 0.07, 0.05, 0.12, [-0.6, 0, 0]);
      if (mecha) { b(0.05, 0.265, 0.04, 0.035, 0.028, 0.1, [-0.65, 0.15, -0.2], mecha); b(-0.045, 0.262, 0.0, 0.03, 0.026, 0.09, [-0.55, -0.15, 0.2], mecha); b(0.0, 0.29, -0.09, 0.03, 0.026, 0.09, [-0.7, 0, 0], mecha); }
      break;
    case 'undercut':
      cap(0.008, 1.5, -0.45); b(0, 0.235, 0.03, 0.13, 0.08, 0.16, [-0.15, 0, 0]); b(0, 0.25, 0.115, 0.1, 0.05, 0.07, [-0.3, 0, 0]);
      break;
    case 'franja': // curto repicado com franja
      cap(0.016, 1.9, -0.55); b(0, 0.14, 0.16, 0.16, 0.05, 0.045, [0.2, 0, 0]); b(0.09, 0.135, 0.15, 0.075, 0.05, 0.05, [0.2, 0, 0.35]);
      b(-0.09, 0.14, 0.15, 0.075, 0.05, 0.05, [0.2, 0, -0.35]); b(0.16, 0.04, 0.0, 0.045, 0.1, 0.12); b(-0.16, 0.04, 0, 0.045, 0.1, 0.12);
      b(0, 0.2, -0.13, 0.16, 0.12, 0.08);
      if (v.repicado) for (const s of [1, -1]) { b(s * 0.14, -0.04, 0.06, 0.04, 0.05, 0.05); b(s * 0.15, -0.06, -0.04, 0.035, 0.05, 0.05); }
      break;
    case 'cacheado': { // volume de cachos
      cap(0.014, 1.85, -0.5);
      const r = rng(7);
      for (let i = 0, n = 0; n < 30 && i < 300; i++) {
        const d = new THREE.Vector3(r() * 2 - 1, r() * 1.1 - 0.1, r() * 2 - 1).normalize();
        if (d.z > 0.35 && d.y < 0.6) continue; if (d.y < -0.05) continue;
        b(d.x * 0.19, d.y * 0.235, d.z * 0.21, 0.05 + r() * 0.025, 0.05 + r() * 0.02, 0.05 + r() * 0.025); n++;
      }
      b(0, 0.25, 0.12, 0.09, 0.06, 0.07, [-0.4, 0, 0]);
      break; }
    case 'afro': cap(0.014, 1.85, -0.5); b(0, 0.12, -0.07, 0.255, 0.245, 0.225, null, cor, 16); break;
    case 'coque': cap(0.014, 1.85, -0.5); b(0, 0.18, -0.13, 0.14, 0.1, 0.08); b(0, 0.29, -0.06, 0.08, 0.08, 0.08); M.add('cabeca', anel(0.07, 0.01), escurece(cor, 0.5), MT(HC(0, 0.24, -0.075))); break;
    case 'dois_coques': cap(0.014, 1.85, -0.5); b(0, 0.18, -0.13, 0.14, 0.1, 0.08); for (const s of [1, -1]) b(s * 0.12, 0.255, -0.03, 0.08, 0.08, 0.08); break;
    case 'rabo': cap(0.014, 1.9, -0.55); b(0, 0.17, -0.14, 0.15, 0.11, 0.08); b(0, 0.0, -0.12, 0.05, 0.03, 0.05, null, escurece(cor, 0.6));
      M.add('rabo', caps(0.26, 0.05, 0.03), cor); M.add('rabo', esf(0.045, 0.03, 0.045), escurece(cor, 0.6), MT([0, 0.0, 0])); break;
    case 'tranca': cap(0.014, 1.9, -0.6); b(0, 0.17, -0.14, 0.15, 0.11, 0.08);
      for (let i = 0; i < 7; i++) M.add('tranca', esf(0.04 - i * 0.002, 0.045, 0.04 - i * 0.002), cor, MT([0, -i * 0.058, i * 0.006])); M.add('tranca', esf(0.03, 0.02, 0.03), '#d9a441', MT([0, -0.43, 0.03])); break;
    case 'bob': {
      cap(0.014, 2.0, -0.5);
      const pts = [[0.2, 0.08], [0.215, 0.0], [0.215, -0.1], [0.19, -0.16], [0.15, -0.165]];
      M.add('cabeca', lathe(pts.map(([r, y]) => [r, y + CAB.cy]), 0.93, 26, 0.95, Math.PI * 2 - 1.9), cor);
      b(0, 0.15, 0.16, 0.165, 0.055, 0.05, [0.2, 0, 0]);
      if (v.ondulado) for (const s of [1, -1]) { b(s * 0.2, -0.12, 0.05, 0.05, 0.05, 0.06); b(s * 0.2, -0.17, -0.04, 0.05, 0.05, 0.06); b(s * 0.17, -0.19, 0.07, 0.045, 0.045, 0.05); b(0, -0.16, -0.19, 0.06, 0.05, 0.05); }
      break; }
    case 'liso_longo': {
      cap(0.014, 1.9, -0.55);
      M.add('cabeca', lathe([[0.2, 0.05], [0.215, -0.1], [0.2, -0.3], [0.17, -0.55], [0.12, -0.6]].map(([r, y]) => [r, y + CAB.cy]), 0.78, 26, 0.9, Math.PI * 2 - 1.8), cor);
      b(0, 0.15, 0.16, 0.16, 0.05, 0.045, [0.2, 0, 0]); break; }
    case 'cachos_longos': {
      cap(0.014, 1.9, -0.55); b(0, 0.15, 0.16, 0.16, 0.05, 0.045, [0.2, 0, 0]);
      const r = rng(11);
      for (const s of [1, -1, 0]) for (let i = 0; i < 6; i++) {
        const y = -0.02 - i * 0.065, x = s === 0 ? (i % 2 ? 0.07 : -0.07) : s * (0.18 + (i % 2) * 0.03), z = s === 0 ? -0.2 : 0.0 - i * 0.012;
        b(x, y, z, 0.055 + r() * 0.015, 0.06, 0.06);
      }
      break; }
    case 'raspado': cap(0.004, 1.75, -0.5); break;
    case 'calvo': // careca no topo, coroa de cabelo nas laterais e atrás (homem mais velho do vídeo)
      for (const s of [1, -1]) { b(s * 0.15, 0.0, -0.02, 0.03, 0.05, 0.1, [0, 0, -s * 0.15]); b(s * 0.12, 0.06, -0.07, 0.03, 0.04, 0.09); }
      b(0, 0.0, -0.15, 0.13, 0.07, 0.05); b(0, 0.08, -0.14, 0.11, 0.05, 0.05); break;
    case 'curto_grisalho': cap(0.01, 1.6, -0.45); b(0, 0.22, 0.05, 0.12, 0.05, 0.13, [-0.3, 0, 0]); break;
    case 'lado': // penteado de lado, castanho curto
    default:
      cap(0.014, 1.85, -0.55); b(0.05, 0.205, 0.11, 0.14, 0.05, 0.12, [-0.5, 0, -0.3]); b(-0.08, 0.19, 0.13, 0.09, 0.045, 0.07, [-0.2, 0, 0.55]);
      b(0.12, 0.2, 0.0, 0.055, 0.05, 0.14); b(-0.12, 0.19, 0.0, 0.05, 0.05, 0.13); b(0, 0.2, -0.13, 0.15, 0.1, 0.08); break;
  }
}

function barra(a, b, t) { // caixa fina entre dois pontos → [geometria, matriz]
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A), len = d.length();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), d.clone().normalize());
  return [caixa(t, t, len, t * 0.4), new THREE.Matrix4().compose(A.clone().add(B).multiplyScalar(0.5), q, new THREE.Vector3(1, 1, 1))];
}

function acessoriosCabeca(M, v) {
  const ac = v.acess || {}, fem = v.corpo === 'f', gorro = ac.gorro, bone = ac.bone;
  if (ac.oculos) {
    const tipo = ac.oculos, cor = ac.corArmacao || (tipo === 'escuros' ? '#141418' : '#1c1c20'), z = zSup(0.078, -0.005) + 0.05;
    for (const s of [1, -1]) {
      const x = s * 0.078, y = -0.005;
      if (tipo === 'redondo') M.add('cabeca', new THREE.TorusGeometry(0.052, 0.0058, 8, 26), cor, MT(HC(x, y, z)));
      else {
        const rr = (w, h, r) => { const sh = new THREE.Shape(); sh.moveTo(-w / 2 + r, -h / 2); sh.lineTo(w / 2 - r, -h / 2); sh.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r); sh.lineTo(w / 2, h / 2 - r); sh.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2); sh.lineTo(-w / 2 + r, h / 2); sh.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r); sh.lineTo(-w / 2, -h / 2 + r); sh.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2); return sh; };
        const sh = rr(0.11, 0.085, 0.022);
        if (tipo === 'quadrado') { const hole = rr(0.094, 0.069, 0.016); sh.holes.push(new THREE.Path(hole.getPoints())); }
        M.add('cabeca', new THREE.ExtrudeGeometry(sh, { depth: 0.009, bevelEnabled: false }), cor, MT(HC(x, y, z - 0.004)));
      }
      if (tipo === 'escuros') M.add('cabeca', new THREE.CircleGeometry(0.052, 24), '#2a2432', MT(HC(x, y, z + 0.006)));
      const [g, m] = barra(HC(s * 0.13, y, z), HC(s * 0.172, y + 0.005, -0.015), 0.009); M.add('cabeca', g, cor, m);
    }
    M.add('cabeca', caixa(0.034, 0.009, 0.009, 0.004), cor, MT(HC(0, 0.012, z)));
  }
  if (ac.fone) {
    const xr = gorro ? 0.235 : 0.205, topo = gorro ? 0.31 : 0.275;
    M.add('cabeca', new THREE.TorusGeometry(1, 0.05, 8, 30, Math.PI).scale(xr, topo, 0.24), ac.fone, MT(HC(0, -0.015, 0)));
    for (const s of [1, -1]) {
      M.add('cabeca', cil(0.064, 0.064, 0.044, 20), ac.fone, MT(HC(s * (xr + 0.003), -0.015, 0), [0, 0, Math.PI / 2]));
      M.add('cabeca', cil(0.056, 0.056, 0.018, 18), '#3a3a42', MT(HC(s * (xr - 0.026), -0.015, 0), [0, 0, Math.PI / 2]));
    }
  }
  if (gorro) { M.add('cabeca', cabecaGeo(0.036, 1.95), gorro, MT([0, CAB.cy, 0], [-0.3, 0, 0])); M.add('cabeca', anel(0.205, 0.027).scale(1, 1.0, 1.08), escurece(gorro, 0.9), MT(HC(0, 0.075, 0.0), [0.05, 0, 0])); }
  if (bone) {
    M.add('cabeca', cabecaGeo(0.03, 1.75), bone, MT([0, CAB.cy + 0.01, 0], [-0.25, 0, 0]));
    M.add('cabeca', new THREE.CylinderGeometry(1, 1, 0.012, 26, 1, false, -1.05, 2.1).scale(0.19, 1, 0.23), escurece(bone, 0.9), MT(HC(0, 0.085, 0.03), [0.12, 0, 0]));
  }
  if (ac.brinco) for (const s of [1, -1]) { M.add('cabeca', esf(0.014), ac.brinco, MT(HC(s * 0.172, -0.07, 0.0))); M.add('cabeca', esf(0.011, 0.018, 0.011), ac.brinco, MT(HC(s * 0.172, -0.1, 0.0))); }
}

function acessoriosCorpo(M, v) {
  const ac = v.acess || {}, k = v.corpo === 'm' ? 1 : 0.86;
  if (v.gravata) { // nó + lâmina da gravata
    M.add('peito', caixa(0.04, 0.032, 0.026), v.gravata, MT([0, 0.205, 0.128]));
    M.add('peito', caixa(0.048, 0.27, 0.012), v.gravata, MT([0, 0.05, 0.148 - 0.014], [-0.06, 0, 0]));
    M.add('peito', caixa(0.05, 0.03, 0.012), escurece(v.gravata, 0.8), MT([0, -0.09, 0.144 - 0.014]));
  }
  if (ac.cracha) { // cordão + crachá no peito esquerdo da imagem (como no vídeo), faixa na cor do agente
    const cx = -0.08 * k;
    for (const [x0, x1] of [[-0.06, cx + 0.012], [0.04, cx - 0.012]]) { const [g, m] = barra([x0, 0.23, 0.06], [x1, 0.085, 0.15], 0.011); M.add('peito', g, '#2a2d33', m); }
    M.add('peito', caixa(0.075, 0.105, 0.012), '#f4f4f0', MT([cx, 0.03, 0.152 - 0.012]));
    M.add('peito', caixa(0.075, 0.03, 0.014), ac.cracha, MT([cx, 0.065, 0.152 - 0.012]));
    M.add('peito', caixa(0.045, 0.01, 0.014), '#6b6f78', MT([cx, 0.0, 0.152 - 0.012]));
  }
  if (ac.fonePescoco) { // fone de ouvido pendurado no pescoço (como o desenvolvedor do vídeo)
    M.add('peito', anel(0.1 * k, 0.017).scale(1, 1, 0.9), ac.fonePescoco, MT([0, 0.235, 0.0]));
    for (const s of [1, -1]) M.add('peito', caixa(0.05, 0.075, 0.05), ac.fonePescoco, MT([s * 0.108 * k, 0.185, 0.1], [0.35, 0, -s * 0.15]));
  }
  if (ac.cachecol) { M.add('peito', anel(0.105 * k, 0.05).scale(1, 1, 0.9), ac.cachecol, MT([0, 0.212, 0])); M.add('peito', caixa(0.1, 0.3, 0.04, 0.02), ac.cachecol, MT([0.06, 0.04, 0.15], [0.05, 0, 0.1])); M.add('peito', esf(0.06, 0.05, 0.055), ac.cachecol, MT([-0.04, 0.2, 0.1])); }
  if (ac.corrente) { M.add('peito', anel(0.105 * k, 0.0045).scale(1, 1, 0.95), '#c9ccd2', MT([0, 0.17, 0.01], [0.55, 0, 0])); M.add('peito', esf(0.015, 0.022, 0.008), '#d4af37', MT([0, 0.06, 0.16])); }
  if (ac.mochila) {
    M.add('peito', caixa(0.28, 0.36, 0.14, 0.04), ac.mochila, MT([0, 0.05, -0.2]));
    for (const s of [1, -1]) { M.add('peito', caixa(0.04, 0.34, 0.014, 0.006), ac.mochila, MT([s * 0.085, 0.075, 0.153], [0, 0, s * 0.06])); M.add('peito', caixa(0.04, 0.014, 0.28, 0.006), ac.mochila, MT([s * 0.1, 0.236, -0.03])); }
  }
}

// ---------- montagem do personagem ----------
const matEsclera = new THREE.MeshStandardMaterial({ color: '#fbfbfb', roughness: 0.2 });
const matPupila = new THREE.MeshStandardMaterial({ color: '#0d0907', roughness: 0.15 });
const matBrilho = new THREE.MeshBasicMaterial({ color: '#ffffff' });
const _irisMats = {};
const matOlho = new THREE.MeshStandardMaterial({ color: '#15100d', roughness: 0.9, flatShading: true });
const matIris = (c) => (_irisMats[c] = _irisMats[c] || new THREE.MeshStandardMaterial({ color: c, roughness: 0.2 }));

export function criarPersonagem(slug, _i, corAgente) {
  const v = { ...PADRAO, ...(VISUAL[slug] || {}) };
  if (v.acess && v.acess.cracha) v.acess = { ...v.acess, cracha: corAgente || '#f59e0b' };
  const fem = v.corpo === 'f', k = fem ? 0.86 : 1;
  // proporção do vídeo: ~7 cabeças. Idade muda altura, tamanho relativo da cabeça e postura.
  const ID = { jovem: { sc: 0.97, hs: 0.72, curva: -0.01 }, adulto: { sc: 1.0, hs: 0.68, curva: 0 }, velho: { sc: 0.96, hs: 0.66, curva: 0.13 } }[v.idade || 'adulto'];
  const SC = (fem ? 1.07 : 1.13) * ID.sc * (v.altura || 1), HS = ID.hs;
  const raiz = new THREE.Group(), corpo = new THREE.Group();
  raiz.scale.setScalar(SC);
  raiz.add(corpo);
  const J = {};
  const junta = (nome, pai, x, y, z) => { const o = new THREE.Group(); o.name = nome; o.position.set(x, y, z); pai.add(o); J[nome] = o; return o; };
  junta('pelve', corpo, 0, H0, 0); junta('coluna', J.pelve, 0, 0.06, 0); junta('peito', J.coluna, 0, 0.14, 0);
  junta('pescoco', J.peito, 0, 0.22, 0); junta('cabeca', J.pescoco, 0, 0.05, 0); J.cabeca.scale.setScalar(HS);
  const ox = fem ? 0.165 : 0.19, qx = fem ? 0.08 : 0.085;
  for (const [s, L] of [[1, 'L'], [-1, 'R']]) {
    junta('ombro' + L, J.peito, s * ox, 0.2, 0); junta('cotovelo' + L, J['ombro' + L], 0, -0.28, 0); junta('pulso' + L, J['cotovelo' + L], 0, -0.25, 0);
    junta('quadril' + L, J.pelve, s * qx, -0.02, 0); junta('joelho' + L, J['quadril' + L], 0, -COXA, 0); junta('tornozelo' + L, J['joelho' + L], 0, -CANELA, 0);
  }
  if (v.cabelo === 'rabo') junta('rabo', J.cabeca, 0, CAB.cy + 0.1, -0.17);
  if (v.cabelo === 'tranca') junta('tranca', J.cabeca, 0.07, CAB.cy - 0.02, -0.15);
  // ----- peças fixas (corpo, roupa, cabelo, acessórios) -----
  const M = montarCorpo(v);
  // cabeça (pele): crânio, orelhas, nariz, bochechas
  const pele = v.pele, peleEsc = escurece(pele, 0.9);
  M.add('cabeca', cabecaGeo(0), pele, MT([0, CAB.cy, 0]));
  for (const s of [1, -1]) {
    M.add('cabeca', esf(0.027, 0.047, 0.032), pele, MT(HC(s * 0.168, -0.015, -0.005)));
    M.add('cabeca', esf(0.013, 0.03, 0.013), escurece(pele, 0.82), MT(HC(s * 0.188, -0.015, 0.0)));
    M.add('cabeca', esf(0.03, 0.018, 0.01), clareiaRosa(pele), MT(HC(s * 0.1, -0.062, zSup(0.1, -0.062) - 0.004), [0, -s * 0.5, 0]));
  }
  M.add('cabeca', esf(fem ? 0.021 : 0.026, 0.022, 0.027), pele, MT(HC(0, -0.047, zSup(0, -0.047) + 0.012)));
  if (v.barba) {
    const g = barbaGeo(v.barba);
    if (v.barba === 'rala') { /* separada: mais transparente */ }
    else M.add('cabeca', g, v.corCabelo, MT([0, CAB.cy, 0]));
  }
  if (v.bigode || (v.barba && v.barba !== 'rala' && v.barba !== 'cavanhaque') || v.barba === 'cavanhaque') {
    for (const s of [1, -1]) M.add('cabeca', esf(0.034, 0.013, 0.015), v.corCabelo, MT(HC(s * 0.03, -0.083, zSup(0.03, -0.083) + 0.002), [0, 0, -s * 0.18]));
  }
  if (v.barba === 'cavanhaque' || v.barba === 'barba') M.add('cabeca', esf(0.028, 0.03, 0.02), v.corCabelo, MT(HC(0, -0.142, zSup(0, -0.142) + 0.0)));
  penteado(M, v);
  if (v.idade === 'velho') { // rugas simples: linhas na testa, pés de galinha e sulcos do nariz à boca
    const rg = escurece(pele, 0.78);
    for (let i = 0; i < 3; i++) M.add('cabeca', caixa(0.13 - i * 0.025, 0.006, 0.008), rg, MT(HC(0, 0.085 + i * 0.024, zSup(0, 0.085 + i * 0.024) - 0.004), [-0.25, 0, 0]));
    for (const s of [1, -1]) {
      M.add('cabeca', caixa(0.012, 0.075, 0.01), rg, MT(HC(s * 0.062, -0.085, zSup(0.062, -0.085) + 0.003), [0, 0, s * 0.35]));
      M.add('cabeca', caixa(0.05, 0.008, 0.01), rg, MT(HC(s * 0.075, -0.04, zSup(0.075, -0.04) + 0.002), [0, 0, -s * 0.1]));
      M.add('cabeca', caixa(0.03, 0.006, 0.008), rg, MT(HC(s * 0.152, -0.02, zSup(0.152, -0.02) + 0.001), [0, s * 0.9, s * 0.3]));
    }
  } else if (v.idade !== 'jovem') {
    const rg = escurece(pele, 0.88);
    for (const s of [1, -1]) M.add('cabeca', caixa(0.01, 0.06, 0.008), rg, MT(HC(s * 0.058, -0.085, zSup(0.058, -0.085) + 0.002), [0, 0, s * 0.35]));
  }
  acessoriosCabeca(M, v);
  acessoriosCorpo(M, v);
  // (sem cílios: rosto de poucos planos, como no vídeo)
  for (const nome of Object.keys(M.por)) { const mm = M.malha(nome, matCorpo); if (mm) J[nome].add(mm); }
  // decalques de texto (estampa </> na camiseta, emblema SEC do uniforme)
  const decal = (txt, cor, w, h, y, z, bg) => {
    const cv = document.createElement('canvas'); cv.width = 256; cv.height = Math.round(256 * h / w); const c = cv.getContext('2d');
    if (bg) { c.fillStyle = bg; c.fillRect(0, 0, cv.width, cv.height); }
    c.fillStyle = cor; c.font = `bold ${Math.round(cv.height * 0.8)}px ui-monospace, Menlo, monospace`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, cv.width / 2, cv.height / 2 + 4);
    const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 4;
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tx, transparent: !bg, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    pl.position.set(0, y, z); J.peito.add(pl); return pl;
  };
  if (v.estampa) decal(v.estampa, v.estampaCor || '#17171a', 0.16, 0.07, 0.0, 0.1325, null).position.x = 0.03;
  if (v.emblema) { const e = decal(v.emblema, '#e9ecf0', 0.07, 0.034, 0.115, 0.131, '#1b2430'); e.position.x = -0.07; }
  // barba rala: camada translúcida
  if (v.barba === 'rala') {
    const mm = new THREE.Mesh(barbaGeo('barba'), new THREE.MeshStandardMaterial({ color: v.corCabelo, roughness: 0.9, transparent: true, opacity: 0.26, side: THREE.DoubleSide }));
    mm.position.y = CAB.cy; J.cabeca.add(mm);
  }
  // ----- rosto animável -----
  const cara = new THREE.Group(); cara.position.y = CAB.cy; J.cabeca.add(cara);
  const rosto = { olho: [], fech: [], sobr: [], iris: [] };
  const sobrCor = v.corCabelo === '#9a9a9a' ? '#7a7a7a' : v.corCabelo;
  for (const s of [1, -1]) {
    const x = s * 0.075, y = -0.005, z = zSup(Math.abs(x), y) + 0.0;
    const olho = new THREE.Group(); olho.position.set(x, y, z); cara.add(olho);
    // olho do vídeo: fenda escura pequena e plana (sem esclera/íris)
    const sc = new THREE.Mesh(caixa(fem ? 0.04 : 0.046, fem ? 0.016 : 0.022, 0.02), matOlho); sc.position.z = 0.004; olho.add(sc);
    const ir = new THREE.Group(); olho.add(ir);
    rosto.olho.push(olho); rosto.iris.push(ir);
    const fe = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.0055, 6, 14, Math.PI).rotateZ(Math.PI), new THREE.MeshStandardMaterial({ color: fem ? '#1a1210' : escurece(pele, 0.45), roughness: 0.8 }));
    fe.position.set(x, y + 0.012, z + 0.022); fe.visible = false; cara.add(fe); rosto.fech.push(fe);
    const br = new THREE.Group(); br.position.set(x * 1.02, 0.07, zSup(Math.abs(x), 0.07) + 0.005); br.rotation.set(0, s * -0.32, s * 0.2); cara.add(br);
    br.add(new THREE.Mesh(caixa(fem ? 0.08 : 0.092, fem ? 0.014 : 0.024, 0.018), new THREE.MeshStandardMaterial({ color: sobrCor, roughness: 0.8 })));
    rosto.sobr.push(br); br.userData.y0 = br.position.y; br.userData.rz = br.rotation.z;
  }
  // boca: sorriso levemente torto + interior que abre ao falar
  const boca = new THREE.Group(); boca.position.set(0, -0.105, zSup(0, -0.105) + 0.003); boca.rotation.z = fem ? 0 : 0.05; cara.add(boca);
  const corLabio = fem ? '#9a4a48' : escurece(pele, 0.55);
  const arco = new THREE.Mesh(new THREE.TorusGeometry(0.052, fem ? 0.0085 : 0.0075, 3, 7, 1.9).rotateZ(Math.PI + (Math.PI - 1.9) / 2), new THREE.MeshStandardMaterial({ color: corLabio, roughness: 0.5 }));
  arco.position.y = 0.035; boca.add(arco);
  const aberta = new THREE.Mesh(esf(0.034, 0.024, 0.01, 12), new THREE.MeshStandardMaterial({ color: '#35100f', roughness: 0.6 })); aberta.position.set(0, 0.0, -0.004); aberta.scale.y = 0.001; boca.add(aberta);
  rosto.boca = boca; rosto.arco = arco; rosto.aberta = aberta;
  // área de clique invisível
  const alvo = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 0.9, 4, 8), new THREE.MeshBasicMaterial());
  alvo.position.y = 0.9; alvo.visible = false; raiz.add(alvo);
  corpo.position.y = 0.58 / SC - H0; // começa sentado (como o escritório espera)
  return { raiz, corpo, partes: [alvo], ciclo: 0, J, rosto, v, fem, k, esc: SC, curva: ID.curva, altura: (1.25 + (CAB.cy + CAB.ry) * HS) * SC };
}
const clareiaRosa = (pele) => '#' + new THREE.Color(pele).lerp(new THREE.Color('#e5645e'), 0.06).getHexString();

// ---------- poses e movimento ----------
const SENTADO = new Set(['parado', 'trabalhando', 'concluido']);
const MODOS_BRACO = ['solto', 'gesto', 'juntas', 'bolso', 'bolsoc', 'cruzados', 'cintura', 'aponta', 'andar', 'digitar', 'descanso', 'queixo', 'comemora'];
const rnd = (a, b) => a + Math.random() * (b - a);
const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const rn = (x, seed = 0) => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return (hash(i + seed * 17.3) * 2 - 1) * (1 - u) + (hash(i + 1 + seed * 17.3) * 2 - 1) * u; };
// mola criticamente amortecida: aproxima do alvo sem pancada nem ultrapassar
function mola(A, nome, alvo, w, dt) {
  let s = A.m[nome];
  if (!s) { A.m[nome] = [alvo, 0]; return alvo; }
  const n = Math.max(1, Math.ceil(dt / 0.016)), h = dt / n;
  for (let i = 0; i < n; i++) { s[1] += (w * w * (alvo - s[0]) - 2 * w * s[1]) * h; s[0] += s[1] * h; }
  return s[0];
}
// ponta do pé (+ = para baixo) no passo: calcanhar toca → pé assenta → calcanhar sobe → ponta empurra
function pePasso(ph) {
  const x = ((ph + Math.PI / 2) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI / 2;
  if (x < Math.PI / 2) return 0.15 - 0.45 * Math.sin(x);
  const u = x - Math.PI / 2;
  return -0.3 * (1 - suave(0, 0.85, u)) + 0.6 * suave(2.0, Math.PI, u);
}
const DOWN = new THREE.Vector3(0, -1, 0), EX = new THREE.Vector3(1, 0, 0), EY = new THREE.Vector3(0, 1, 0);
const qEixo = (ax, a) => new THREE.Quaternion().setFromAxisAngle(ax, a);
const qDir = (d) => new THREE.Quaternion().setFromUnitVectors(DOWN, d.clone().normalize());

export function posar(p, pose, t, fase, dt) {
  const J = p.J;
  dt = Math.min(Math.max(dt || 0.016, 0.001), 0.1);
  let A = p.anim;
  const novo = !A;
  if (novo) {
    const maos = (p.v.casaco && p.v.casaco.maos) || p.v.maos || null;
    A = p.anim = { m: {}, ultCiclo: p.ciclo || 0, fp: 0, velEst: 1.4, tOlhar: 0, olhar: [0, 0], tApoio: 0, apoio: 1, tModo: 0, modoPe: 'solto', bolso2: true,
      tSit: 0, modoSit: 'normal', poseAnt: pose, sinal: hash(fase * 3.1) < 0.5 ? -1 : 1, pref: Math.floor(hash(fase * 7.1) * 4), maos, tPiscar: t + rnd(1, 4), pisc0: -9 };
    for (const n of ['pelve', 'coluna', 'peito', 'pescoco', 'cabeca']) J[n].rotation.order = 'YXZ';
  }
  if (A.poseAnt !== pose) { A.tOlhar = 0; A.tModo = 0; A.tSit = 0; A.poseAnt = pose; }
  const sentado = SENTADO.has(pose), andando = pose === 'andando';

  // ---- parâmetros suavizados ----
  const S = mola(A, 'S', sentado ? 1 : 0, 4.2, dt);        // 1 = sentado, 0 = em pé
  const Wk = mola(A, 'W', andando ? 1 : 0, 8, dt);          // peso do andar
  const dC = Math.max(0, (p.ciclo || 0) - A.ultCiclo); A.ultCiclo = p.ciclo || 0;
  let velAlvo = 1.4;
  if (p.vel > 0) velAlvo = p.vel;
  else { A.velEst += (dC / (6.2 * dt) - A.velEst) * Math.min(1, dt * 8); if (andando && A.velEst > 0.3) velAlvo = A.velEst; }
  const vel = mola(A, 'vel', velAlvo, 6, dt);
  const u = grampo(vel / 1.4, 0.5, 2), corre = suave(2.6, 3.6, vel);
  const compPasso = (vel <= 2 ? 1.05 * vel : 2.1 + (vel - 2) * 0.45) * (p.esc || 1);   // metros por ciclo completo (2 passos)
  A.fp += dC / 6.2 * Math.PI * 2 / Math.max(0.6, compPasso);          // fase do passo integrada pela distância andada
  const fp = A.fp;

  // sorteios em intervalos irregulares (olhar, apoio, gestos)
  if (t > A.tApoio) { A.apoio = -A.apoio; A.tApoio = t + rnd(3.5, 8); }
  if (t > A.tModo) {
    const lista = ['solto', 'gesto', 'juntas', 'bolso'];
    if (A.maos && Math.random() < 0.75) A.modoPe = A.maos === 'bolso' ? 'bolsoc' : A.maos;
    else A.modoPe = Math.random() < 0.4 ? lista[A.pref] : lista[Math.floor(Math.random() * 4)];
    A.bolso2 = Math.random() < 0.6; A.tModo = t + rnd(3.5, 9);
  }
  if (t > A.tSit) { const r = Math.random(); A.modoSit = r < 0.55 ? 'normal' : (r < 0.8 ? 'recosta' : 'queixo'); A.tSit = t + rnd(5, 14); }
  if (t > A.tOlhar) {
    A.tOlhar = t + rnd(1.2, 4.5);
    const r = Math.random(), lado = () => rnd(-0.9, 0.9);
    if (pose === 'trabalhando') { A.olhar = r < 0.78 ? [rnd(-0.1, 0.1), 0.2 + rnd(-0.03, 0.05)] : [lado() * 0.9, rnd(-0.05, 0.12)]; if (r < 0.78) A.tOlhar = t + rnd(2, 6); }
    else if (pose === 'parado') A.olhar = r < 0.4 ? [0, 0.12] : [lado(), rnd(-0.1, 0.15)];
    else if (pose === 'concluido') A.olhar = [rnd(-0.3, 0.3), -0.2];
    else if (pose === 'conversando') A.olhar = [rnd(-0.25, 0.25), rnd(-0.05, 0.1)];
    else if (pose === 'apontando') A.olhar = [-0.25, 0];
    else if (pose === 'olhando_janela') A.olhar = [A.sinal * rnd(0.8, 1.0), rnd(-0.03, 0.06)];
    else if (andando) A.olhar = [rnd(-0.1, 0.1), 0];
    else A.olhar = r < 0.4 ? [rnd(-0.15, 0.15), 0] : [lado(), rnd(-0.1, 0.1)];
  }
  const gy = mola(A, 'gy', A.olhar[0], 9, dt), gp0 = mola(A, 'gp', A.olhar[1], 9, dt);

  // modo dos braços: pesos suavizados de cada gesto/pose
  let alvoModo = 'solto';
  if (andando) alvoModo = 'andar';
  else if (pose === 'em_pe') alvoModo = A.modoPe;
  else if (pose === 'conversando') alvoModo = 'gesto';
  else if (pose === 'apontando') alvoModo = 'aponta';
  else if (pose === 'olhando_janela') alvoModo = A.modoPe === 'gesto' ? 'juntas' : A.modoPe;
  else if (pose === 'trabalhando') alvoModo = 'digitar';
  else if (pose === 'parado') alvoModo = A.modoSit === 'queixo' ? 'queixo' : 'descanso';
  else if (pose === 'concluido') alvoModo = 'comemora';
  const mw = {};
  for (const m of MODOS_BRACO) mw[m] = Math.max(0, mola(A, 'm_' + m, m === alvoModo ? 1 : 0, 5.5, dt));
  const conv = mw.gesto, concW = mw.comemora;

  // ---- tronco e quadril ----
  const apoioV = mola(A, 'apoio', A.apoio, 3.2, dt);
  const resp = Math.sin(t * 1.6 + fase) * 0.012;
  const lenBase = grampo(0.02 + 0.055 * (vel - 1.2), 0.01, 0.26);   // tronco mais em pé ao andar (referência)
  const sitAlvo = pose === 'trabalhando' ? 0.10 + 0.03 * rn(t * 0.4 + fase) : (pose === 'concluido' ? -0.12 : (A.modoSit === 'recosta' ? -0.12 : (A.modoSit === 'queixo' ? 0.15 : 0.03)));
  const leanSit = mola(A, 'leanSit', sitAlvo, 3.5, dt);
  const leanPe = Wk * lenBase + (1 - Wk) * (0.01 * rn(t * 0.3 + fase));
  const transLean = 0.45 * Math.sin(Math.PI * Math.pow(grampo(1 - S, 0, 1), 0.6));  // inclina à frente ao levantar/sentar
  const lean = lerp(leanPe, leanSit, S) + transLean + resp;
  const Ay = (0.10 + 0.08 * corre) * (0.7 + 0.3 * u);
  const yawP = -Ay * Math.sin(fp) * Wk + 0.03 * rn(t * 0.3 + fase) * (1 - Wk);
  const yawC = 0.9 * Ay * Math.sin(fp) * Wk + 0.2 * gy + S * 0.05 * rn(t * 0.35 + fase);
  const rollP = Wk * 0.08 * -Math.cos(fp) + (1 - Wk) * (1 - S) * 0.045 * apoioV;
  const rollC = -0.6 * rollP + concW * 0.07 * Math.sin(t * 3.5 + fase) + 0.015 * rn(t * 0.4 + fase * 2);
  const pitchP = 0.2 * lean * (1 - S) + 0.05 * lean * S;
  J.pelve.rotation.set(pitchP, yawP, rollP);
  J.coluna.rotation.set((lean - pitchP) * 0.45, (yawC - yawP) * 0.5, (rollC - rollP) * 0.5);
  J.peito.rotation.set((lean - pitchP) * 0.55, (yawC - yawP) * 0.5, (rollC - rollP) * 0.5);
  if (p.curva) { J.coluna.rotation.x += p.curva * 0.5; J.peito.rotation.x += p.curva * 0.5; }   // ombros curvados (mais velho)
  // cabeça: olhar absoluto (estável mesmo com o corpo balançando)
  const gp = gp0 + conv * 0.07 * Math.sin(t * 2.6 + fase) + 0.015 * rn(t * 0.9 + fase * 3);
  const gyaw = gy + 0.02 * rn(t * 0.8 + fase * 5);
  const incl = 0.04 * rn(t * 0.5 + fase) + (alvoModo === 'queixo' ? 0.12 : 0) + concW * -0.05;
  J.pescoco.rotation.set(0.4 * (gp - lean) - (p.curva || 0) * 0.5, 0.4 * (gyaw - yawC), 0.4 * (incl - rollC));
  J.cabeca.rotation.set(0.6 * (gp - lean), 0.6 * (gyaw - yawC), 0.6 * (incl - rollC));

  // ---- braços (direções no referencial do peito) ----
  const Sw = lerp(0.50 * (0.6 + 0.4 * u), 0.95, corre), bb = lerp(0.34, 1.25, corre), bv = lerp(0.25, 0.3, corre);   // braços: balanço e cotovelo dobrado como no vídeo de referência do Meshy
  const ph = (lado) => fp + (lado > 0 ? 0 : Math.PI);
  const vec = (a, lado) => new THREE.Vector3(a[0] * lado, a[1], a[2]).normalize();
  for (const [lado, s] of [[1, 'L'], [-1, 'R']]) {
    const up = [0, 0, 0], lo = [0, 0, 0];
    const add = (w, uu, ll) => { if (w < 1e-3) return; for (let i = 0; i < 3; i++) { up[i] += w * uu[i]; lo[i] += w * ll[i]; } };
    const solto = [[0.16 + 0.01 * Math.sin(t * 1.6 + fase), -0.97, 0.02], [0.0, -0.9, 0.3]];
    const descanso = [[0.14, -0.95, 0.2], [-0.25, -0.5, 0.85]];
    add(mw.solto, ...solto);
    if (mw.gesto > 1e-3) {
      const amp = lado < 0 ? 1 : 0.55, phg = t * 2.1 + fase + (lado < 0 ? 0 : 1.6), env = grampo(0.55 + 0.7 * rn(t * 0.45 + fase + lado), 0, 1);
      add(mw.gesto, [0.22 + 0.1 * env, -0.8 + 0.25 * env, 0.45 + 0.12 * env],
        [-0.4 + 0.3 * Math.sin(phg) * amp * env, -0.55 + 0.75 * env + 0.25 * Math.sin(phg * 0.7 + 1) * amp * env, 0.8]);
    }
    add(mw.juntas, [0.12, -0.88, 0.32], [-0.80, -0.12 + 0.03 * Math.sin(t * 1.6 + fase), 0.62]);
    if (lado > 0 || A.bolso2) add(mw.bolso, [0.15, -0.98, -0.1], [-0.2, -0.9, 0.40]); else add(mw.bolso, ...solto);
    add(mw.bolsoc, [0.2, -0.92, -0.05], [-0.5, -0.55, 0.65]);                               // mãos no bolso canguru
    add(mw.cruzados, [0.05, -0.85, 0.3], [-0.95, lado > 0 ? 0.12 : -0.02, 0.4]);            // braços cruzados
    add(mw.cintura, [0.5, -0.75, -0.1], [-0.5, -0.78, 0.3]);                                // mãos na cintura
    if (lado < 0) add(mw.aponta, [0.35, -0.12, 0.95], [0.33, 0.04 + 0.02 * Math.sin(t * 3), 0.95]); else add(mw.aponta, ...solto);
    if (mw.andar > 1e-3) {
      const al = -Sw * Math.sin(ph(lado)) + 0.05, be = bb + bv * (0.5 + 0.5 * al / Sw);
      add(mw.andar, [0.16 + 0.05 * corre, -Math.cos(al), Math.sin(al)], [0.0 - 0.15 * corre, -Math.cos(al + be), Math.sin(al + be)]);
    }
    if (mw.digitar > 1e-3) {
      const e1 = grampo(1.4 * rn(t * 0.5 + fase * 1.3 + lado * 5) + 0.25, 0, 1), e2 = grampo(1.4 * rn(t * 0.43 + fase + lado * 9 + 3) + 0.2, 0, 1);
      const wob = Math.sin(t * 15 + fase + lado * 1.9) * 0.06 * e1 + Math.sin(t * 9.3 + lado) * 0.03 * e2;
      add(mw.digitar, [0.18, -0.72 + 0.02 * rn(t * 0.6 + lado), 0.6], [-0.32 + 0.05 * rn(t * 0.7 + lado) + (lado < 0 ? 0.1 * Math.sin(t * 0.9 + fase) * (1 - e1) : 0), -0.12 + wob, 0.95]);
    }
    add(mw.descanso, ...descanso);
    if (lado < 0) add(mw.queixo, [0.06, -0.62, 0.74], [-0.30, 0.88, 0.28]); else add(mw.queixo, ...descanso);
    add(mw.comemora, [0.6, 0.78, 0.05], [-0.2 + 0.5 * Math.sin(t * 7.5 + lado * 1.7), 0.9, 0.0]);
    const qU = qDir(vec(up, lado)), qF = qDir(vec(lo, lado));
    J['ombro' + s].quaternion.copy(qU);
    J['cotovelo' + s].quaternion.copy(qU.clone().invert().multiply(qF));
  }

  // ---- pernas (ângulos absolutos; seguem a guinada do quadril, não a inclinação) ----
  const Aw = lerp(0.30 + 0.12 * u, 0.85, corre), Kw = lerp(1.0, 1.9, corre);
  const Qyaw = qEixo(EY, yawP), Qp = J.pelve.quaternion.clone();
  const Qc = Qp.clone().invert().multiply(Qyaw);
  const cadeia = [];
  const vx = (lat, ang) => new THREE.Vector3(lat, -Math.cos(ang), Math.sin(ang)).normalize();
  for (const [lado, s] of [[1, 'L'], [-1, 'R']]) {
    const phi = ph(lado);
    const thW = Aw * Math.sin(phi), knW = 0.04 + Kw * Math.pow(Math.max(0, Math.cos(phi + 0.35)), 1.3) + 0.16 * Math.max(0, -Math.cos(phi));
    const carga = (apoioV * lado + 1) / 2;
    const thI = 0.10 * (1 - carga), knI = 0.16 * (1 - carga), latI = 0.05 + 0.08 * (1 - carga);
    const thSt = lerp(thI, thW, Wk), knSt = lerp(knI, knW, Wk), latSt = lerp(latI, 0.05, Wk);
    cadeia.push(COXA * Math.cos(thSt) + CANELA * Math.cos(thSt - knSt));
    const thSit = 1.2 + 0.04 * rn(t * 0.2 + lado * 3 + fase), latSit = 0.07 + 0.05 * (1 + rn(t * 0.17 + lado + fase)), calfSit = 0.1 + 0.03 * rn(t * 0.23 + lado + fase);
    const th = lerp(thSt, thSit, S), calf = lerp(thSt - knSt, calfSit, S), lat = lerp(latSt, latSit, S);
    const d1 = vx(lat * lado, th), d2 = vx(lat * 0.4 * lado, calf);
    const qT = qDir(d1), qC = qDir(d2);
    J['quadril' + s].quaternion.copy(Qc.clone().multiply(qT));
    J['joelho' + s].quaternion.copy(qT.clone().invert().multiply(qC));
    // pé: acompanha o chão (absoluto); sentado bate o pé de vez em quando
    const toque = lado < 0 ? Math.max(0, rn(t * 0.25 + fase) - 0.2) * -0.3 * Math.abs(Math.sin(t * 7)) : 0;
    const pitchPe = lerp(Wk * pePasso(phi) * (0.7 + 0.3 * corre), toque, S);
    const qFoot = qEixo(EX, pitchPe).multiply(qEixo(EY, 0.1 * lado));
    J['tornozelo' + s].quaternion.copy(Qyaw.clone().multiply(qC).invert().multiply(qFoot));
  }
  // altura do corpo: o pé de apoio fica no chão (sobe e desce ao andar); sentado = quadril no assento
  const yPe = (Math.max(cadeia[0], cadeia[1]) - (COXA + CANELA)) * lerp(1, 0.8, Wk) + Wk * (0.012 + corre * 0.03) * Math.abs(Math.sin(fp));   // leve sobe-e-desce da caminhada
  const ySent = 0.58 / (p.esc || 1) - H0 + concW * 0.012 * Math.abs(Math.sin(t * 6));
  p.corpo.position.y = lerp(yPe, ySent, S);
  p.corpo.position.x = (1 - Wk) * (1 - S) * 0.022 * apoioV + Wk * 0.018 * -Math.cos(fp); // desloca o quadril sobre a perna de apoio

  // ---- rabo/trança balançam ----
  const bal = Math.sin(fp * 2 + 1) * 0.25 * Wk * (0.5 + corre) + 0.05 * rn(t * 1.3 + fase) + (gp - lean) * 0.5;
  if (J.rabo) J.rabo.rotation.set(-0.3 + bal * 0.6, 0, 0.1 * Math.sin(fp + 0.5) * Wk + 0.05 * rn(t * 0.9 + fase));
  if (J.tranca) J.tranca.rotation.set(bal * 0.5, 0, 0.08 * Math.sin(fp + 0.5) * Wk);

  // ---- rosto: piscar, olhos, sobrancelhas, boca ----
  const R = p.rosto;
  if (t > A.tPiscar) { A.pisc0 = t; A.tPiscar = t + rnd(2.2, 5.5); }
  const b = t - A.pisc0 < 0.16 ? Math.sin(Math.PI * (t - A.pisc0) / 0.16) : 0;
  for (let i = 0; i < 2; i++) {
    R.olho[i].scale.y = 1 - 0.93 * b; R.olho[i].visible = b < 0.6; R.fech[i].visible = b >= 0.6;
    R.iris[i].position.set(0.006 * rn(t * 0.7 + fase + i * 0.1), 0.004 * rn(t * 0.9 + fase * 2), 0);
    const br = R.sobr[i];
    br.position.y = br.userData.y0 + 0.007 * conv * Math.max(0, rn(t * 1.1 + fase)) + 0.012 * concW + 0.004 * b;
    br.rotation.z = br.userData.rz * (1 + 0.2 * Math.sin(t * 0.6 + fase)) + (i ? -1 : 1) * 0.12 * concW;
  }
  let fala = p.fala || 0;
  if (pose === 'conversando') fala = Math.max(fala, grampo(0.55 + 0.9 * rn(t * 1.3 + fase), 0, 1));
  const abre = fala * (0.35 + 0.65 * Math.abs(Math.sin(t * 10 + fase * 3)));
  const sorriso = pose === 'concluido' ? 1.2 : (pose === 'trabalhando' ? 0.3 : 0.5);   // rosto quase neutro, como no vídeo
  R.arco.scale.set(1 + 0.12 * (sorriso - 1), sorriso, 1); R.arco.position.y = 0.035 - abre * 0.012;
  R.aberta.scale.y = 0.001 + abre + (pose === 'concluido' ? 0.5 : 0);
}
