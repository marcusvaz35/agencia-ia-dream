// Boneco 3D gerado de graça (TRELLIS) + ESQUELETO FEITO POR CÓDIGO (sem Meshy, sem pagar).
// Carrega o GLB, tira a placa do chão, cria ossos e calcula os pesos da pele pela distância aos ossos.
// API: carregarBonecoTrellis(url, opcoes) -> Promise<{ raiz, ossos, animar(pose, t, vel), esqueleto }>
// Poses: 'parado' | 'andando' | 'trabalhando' (sentado digitando). O corpo fica com os pés em y = 0 e ~1,75 m de altura.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Junções no espaço original do modelo (altura de -0,49 a 0,50, olhando para +z). x positivo = lado esquerdo do boneco.
const JBASE = {
  quadril: [0, -0.015, 0], peito: [0, 0.16, 0.0], pescoco: [0, 0.335, 0.005], topo: [0, 0.50, 0.0],
  ombro: [0.135, 0.30, 0], cotovelo: [0.195, 0.115, 0], punho: [0.205, -0.045, 0.0], dedos: [0.205, -0.115, 0.01],
  coxa: [0.065, -0.03, 0], joelho: [0.075, -0.27, 0.0], tornozelo: [0.075, -0.455, -0.005], ponta: [0.078, -0.485, 0.11],
};
const V = (a, s = 1) => new THREE.Vector3(a[0] * s, a[1], a[2]);

export function prepararBonecoTrellis(url) {
  return new Promise((resolve, reject) => new GLTFLoader().load(url, (g) => resolve((op = {}) => montarBoneco(g, op)), undefined, reject));
}
export function carregarBonecoTrellis(url, op = {}) {
  return prepararBonecoTrellis(url).then((cria) => cria(op));
}
function montarBoneco(g, op) {
  const J = { ...JBASE, ...(op.J || {}) };   // cada modelo pode ajustar as juntas (proporções diferentes)
  const altura = op.altura || 1.75;
  {
    {
      let malha = null; g.scene.traverse(o => { if (o.isMesh && !malha) malha = o; });
      const geo = malha.geometry.clone();
      // 0) normaliza modelos de outros geradores (ex.: SF3D): aplica transformações do nó, gira, escala p/ altura 1, pés em y = -0,5, centraliza
      if (op.norm) {
        malha.updateWorldMatrix(true, false); geo.applyMatrix4(malha.matrixWorld);
        if (op.norm.rotY) geo.rotateY(op.norm.rotY);
        geo.computeBoundingBox(); const bb = geo.boundingBox, c = bb.getCenter(new THREE.Vector3()), k = 1 / (bb.max.y - bb.min.y);
        geo.translate(-c.x, -bb.min.y, -c.z); geo.scale(k, k, k); geo.translate(0, -0.5, 0);
      }
      // 1) tira a placa embaixo dos pés (triângulos com todos os pontos abaixo de y = -0,488)
      const pos = geo.attributes.position, idx = geo.index.array, keep = [];
      for (let i = 0; i < idx.length; i += 3) {
        const a = idx[i], b = idx[i + 1], c = idx[i + 2];
        const lim = op.placa !== undefined ? op.placa : -0.488;
        if (pos.getY(a) < lim && pos.getY(b) < lim && pos.getY(c) < lim) continue;
        keep.push(a, b, c);
      }
      // 1b) tira pedacinhos soltos (ilhas): mantém só o maior pedaço conectado
      if (op.ilhas !== false) {
        const sold = new Map(), soldi = new Int32Array(pos.count);   // solda vértices na mesma posição (costuras de textura)
        for (let i = 0; i < pos.count; i++) { const k = Math.round(pos.getX(i) * 2e4) + ',' + Math.round(pos.getY(i) * 2e4) + ',' + Math.round(pos.getZ(i) * 2e4); if (!sold.has(k)) sold.set(k, i); soldi[i] = sold.get(k); }
        const pai = new Int32Array(pos.count).map((_, i) => i), raizDe = (x) => { while (pai[x] !== x) { pai[x] = pai[pai[x]]; x = pai[x]; } return x; };
        for (let i = 0; i < keep.length; i += 3) { const r0 = raizDe(soldi[keep[i]]); for (const k of [1, 2]) { const r1 = raizDe(soldi[keep[i + k]]); if (r1 !== r0) pai[r1] = r0; } }
        const cont = new Map(); for (let i = 0; i < keep.length; i += 3) { const r = raizDe(soldi[keep[i]]); cont.set(r, (cont.get(r) || 0) + 1); }
        let mr = -1, mc = 0; for (const [r, c] of cont) if (c > mc) { mc = c; mr = r; }
        const k2 = []; for (let i = 0; i < keep.length; i += 3) if (raizDe(soldi[keep[i]]) === mr) k2.push(keep[i], keep[i + 1], keep[i + 2]);
        keep.length = 0; for (const x of k2) keep.push(x);
      }
      geo.setIndex(keep); geo.computeVertexNormals();

      // 2) segmentos dos ossos (para os pesos) — cada osso: [ponta A, ponta B, lado (0 = centro, 1 = esq., -1 = dir.), raio de influência]
      const seg = [];
      const add = (nome, a, b, lado, sig) => seg.push({ nome, a: V(a, lado || 1), b: V(b, lado || 1), lado: lado || 0, sig });
      add('quadril', J.quadril, J.peito, 0, 0.085); add('peito', J.peito, J.pescoco, 0, 0.09);
      add('cabeca', J.pescoco, J.topo, 0, 0.085);
      for (const L of [1, -1]) {
        add('braco' + L, J.ombro, J.cotovelo, L, 0.045); add('antebraco' + L, J.cotovelo, J.punho, L, 0.04); add('mao' + L, J.punho, J.dedos, L, 0.04);
        add('coxa' + L, J.coxa, J.joelho, L, 0.06); add('canela' + L, J.joelho, J.tornozelo, L, 0.05); add('pe' + L, J.tornozelo, J.ponta, L, 0.045);
      }
      const nomes = seg.map(s => s.nome);
      const idxOsso = {}; nomes.forEach((n, i) => idxOsso[n] = i);
      const distSeg = (p, s) => { const ab = s.b.clone().sub(s.a); const t = THREE.MathUtils.clamp(p.clone().sub(s.a).dot(ab) / ab.lengthSq(), 0, 1); return p.distanceTo(s.a.clone().addScaledVector(ab, t)); };
      const n = pos.count, skinIdx = new Uint16Array(n * 4), skinW = new Float32Array(n * 4), p = new THREE.Vector3();
      for (let v = 0; v < n; v++) {
        p.fromBufferAttribute(pos, v);
        const lado = p.x >= 0 ? 1 : -1, ax = Math.abs(p.x);
        const pesos = [];
        for (let k = 0; k < seg.length; k++) {
          const s = seg[k];
          // lado: ossos do lado oposto não pegam (pernas e braços); tronco/cabeça não têm lado
          if (s.lado && s.lado !== lado) continue;
          // braços não pegam o tronco: só quem está longe do centro (ax) ou acima do ombro
          if (s.nome.startsWith('braco') && (ax < 0.105 && p.y < 0.28)) continue;
          if ((s.nome.startsWith('antebraco') || s.nome.startsWith('mao')) && ax < 0.12) continue;
          // pernas só abaixo do quadril
          if ((s.nome.startsWith('coxa') || s.nome.startsWith('canela') || s.nome.startsWith('pe')) && p.y > 0.02) continue;
          // tronco/quadril não pega as pernas distantes nem os braços
          if (s.nome === 'quadril' && p.y < -0.30) continue;
          const d = distSeg(p, s); pesos.push([k, Math.exp(-(op.dureza || 1) * Math.pow(d / s.sig, 2))]);
        }
        pesos.sort((a, b) => b[1] - a[1]);
        let top = pesos.slice(0, 4); let soma = top.reduce((a, b) => a + b[1], 0);
        if (soma < 1e-6) { // fallback: osso mais próximo
          let melhor = 0, md = 9; seg.forEach((s, k) => { if (s.lado && s.lado !== lado) return; const d = distSeg(p, s); if (d < md) { md = d; melhor = k; } });
          top = [[melhor, 1]]; soma = 1;
        }
        for (let m = 0; m < 4; m++) { skinIdx[v * 4 + m] = top[m] ? top[m][0] : 0; skinW[v * 4 + m] = top[m] ? top[m][1] / soma : 0; }
      }
      geo.setAttribute('skinIndex', new THREE.BufferAttribute(skinIdx, 4)); geo.setAttribute('skinWeight', new THREE.BufferAttribute(skinW, 4));

      // 3) ossos (hierarquia em posição de repouso)
      const ossos = {};
      const mk = (nome, ponto, pai, sinal = 1) => {
        const b = new THREE.Bone(); b.name = nome; const w = V(ponto, sinal);
        b.position.copy(pai ? w.clone().sub(pai.userData.mundo) : w); b.userData.mundo = w; if (pai) pai.add(b); ossos[nome] = b; return b;
      };
      const raizOsso = mk('quadril', J.quadril, null); mk('peito', J.peito, raizOsso); mk('cabeca', J.pescoco, ossos.peito);
      for (const L of [1, -1]) {
        mk('braco' + L, J.ombro, ossos.peito, L); mk('antebraco' + L, J.cotovelo, ossos['braco' + L], L); mk('mao' + L, J.punho, ossos['antebraco' + L], L);
        mk('coxa' + L, J.coxa, raizOsso, L); mk('canela' + L, J.joelho, ossos['coxa' + L], L); mk('pe' + L, J.tornozelo, ossos['canela' + L], L);
      }
      const lista = nomes.map(nm => ossos[nm]);
      const esq = new THREE.Skeleton(lista);
      const mat = new THREE.MeshStandardMaterial({ map: malha.material.map, roughness: 0.9, metalness: 0, side: THREE.DoubleSide });
      if (mat.map) mat.map.colorSpace = THREE.SRGBColorSpace;
      if (op.claro) mat.color.setScalar(op.claro);
      if (op.cor && mat.map) mat.map = corrigirTextura(mat.map, op.cor);   // brilho/saturação/contraste da textura (ex.: Noah escuro demais)
      const sk = new THREE.SkinnedMesh(geo, mat); sk.frustumCulled = false;
      sk.add(raizOsso); sk.bind(esq);
      const raiz = new THREE.Group(), corpo = new THREE.Group();
      const escala = altura / (op.hMod || 0.988); corpo.scale.setScalar(escala); corpo.position.y = (op.base || 0.49) * escala; corpo.add(sk); raiz.add(corpo);
      const help = op.esqueleto ? new THREE.SkeletonHelper(sk) : null;

      // 4) animação por código
      const Q = (x, y, z) => new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z, 'YXZ'));
      const repouso = {}; for (const nm of nomes) repouso[nm] = ossos[nm].quaternion.clone();
      const S = { fase: 0, w: 0, s: 0 };
      function animar(pose, t, vel = 1.4, dt = 0.016, dFase = null) {
        const acen = pose === 'acenando', gest = pose === 'gesticulando', andando = pose === 'andando', sentado = pose === 'trabalhando' || pose === 'parado_sentado';
        if (S.init === undefined) { S.init = 1; S.s = sentado ? 1 : 0; S.w = andando ? 1 : 0; S.a = 0; S.g = 0; }
        S.a += ((acen ? 1 : 0) - S.a) * Math.min(1, dt * 6); S.g += ((gest ? 1 : 0) - S.g) * Math.min(1, dt * 6);
        S.w += ((andando ? 1 : 0) - S.w) * Math.min(1, dt * 8); S.s += ((sentado ? 1 : 0) - S.s) * Math.min(1, dt * 4);
        if (andando) S.fase += dFase !== null ? dFase : dt * (2.2 + 1.2 * vel) * 1.1;
        const f = S.fase, w = S.w, s = S.s, ac = S.a, ge = S.g, sin = Math.sin, cos = Math.cos;
        const set = (nm, x, y = 0, z = 0) => ossos[nm].quaternion.copy(repouso[nm]).multiply(Q(x, y, z));
        const resp = sin(t * 1.6) * 0.01;
        ossos.quadril.position.y = ossos.quadril.userData.mundo.y + (-0.0 * w) + Math.abs(sin(f)) * 0.012 * w - s * 0.136;
        ossos.quadril.position.z = ossos.quadril.userData.mundo.z;
        ossos.quadril.position.x = ossos.quadril.userData.mundo.x + cos(f) * 0.012 * w;
        ossos.quadril.quaternion.copy(repouso.quadril).multiply(Q(0.03 * w + s * 0.0, -0.10 * sin(f) * w, 0.04 * cos(f) * w));
        set('peito', resp + 0.02 * w + s * 0.10, 0.12 * sin(f) * w, -0.03 * cos(f) * w);
        set('cabeca', -0.02 * w - s * 0.05, -0.05 * sin(f) * w + 0.05 * sin(t * 0.5) * (1 - w), 0);
        for (const L of [1, -1]) {
          const ph = f + (L > 0 ? 0 : Math.PI), at = sin(ph), at2 = Math.max(0, -cos(ph + 0.4));
          // pernas: andar (balanço + dobra do joelho) / sentado (coxa para frente, canela para baixo)
          set('coxa' + L, (-0.55 * at) * w + (-1.0) * s + 0.0 * (1 - w - s), 0, (L > 0 ? 0.03 : -0.03) * (1 - w));
          set('canela' + L, (0.15 + 0.85 * at2 + 0.25 * Math.max(0, at)) * w + 1.0 * s, 0, 0);
          set('pe' + L, (-0.25 * at2 + 0.1 * at) * w - 0.05 * s, 0, 0);
          // braços: balanço oposto às pernas / digitando (antebraço à frente)
          const dig = 0.06 * sin(t * 14 + L) * (pose === 'trabalhando' ? 1 : 0);
          set('braco' + L, (0.32 * at) * w + ((pose === 'trabalhando' ? -0.55 : -0.25) + 0.02 * sin(t * 2 + L)) * s - (L < 0 ? 0.12 * ac : 0), 0, (-L) * (0.10 * (1 - s) + 0.0) + L * ((L < 0 ? 1.45 * ac : 0) + ge * (0.45 + 0.2 * sin(t * 2.6 + L * 1.3))));
          set('antebraco' + L, (-0.2 - 0.15 * Math.max(0, at)) * w + ((pose === 'trabalhando' ? -1.15 : -0.95) + dig) * s - 0.06 * (1 - w - s) - 0.9 * ge - 0, 0, L * ((L < 0 ? ac * (1.7 + 0.4 * sin(t * 9)) : 0) + ge * (0.35 + 0.35 * sin(t * 4.3 + L * 1.7))));
          set('mao' + L, 0.0 + 0.08 * sin(t * 15 + L * 2) * s, 0, 0);
        }
      }
      // pés no chão ao andar/ficar em pé (o corpo sobe/desce para o pé mais baixo tocar y = 0)
      raiz.updateMatrixWorld(true);
      const pv = new THREE.Vector3(); const tornozeloRep = () => Math.min(...[1, -1].map(L => ossos['pe' + L].getWorldPosition(pv).y));
      const baseY = corpo.position.y, tornozelo0 = tornozeloRep();
      const animarChao = (pose, t, vel, dt) => {
        animar(pose, t, vel, dt); corpo.position.y = baseY; raiz.updateMatrixWorld(true);
        if (pose !== 'trabalhando' && pose !== 'parado_sentado') corpo.position.y = baseY + (tornozelo0 - tornozeloRep());
      };
      return { raiz, ossos, animar: animarChao, esqueleto: help, malha: sk, escala };
    }
  }
}

// ajusta brilho/saturação/contraste de uma textura (canvas) preservando os detalhes. cor = { brilho: 1, sat: 1, contraste: 1 }
function corrigirTextura(tex, cor) {
  const im = tex.image, w = im.width, h = im.height, cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const cx = cv.getContext('2d'); cx.drawImage(im, 0, 0);
  const d = cx.getImageData(0, 0, w, h), a = d.data, B = cor.brilho ?? 1, S = cor.sat ?? 1, C = cor.contraste ?? 1;
  for (let i = 0; i < a.length; i += 4) {
    let r = a[i], g = a[i + 1], b = a[i + 2]; const l = 0.299 * r + 0.587 * g + 0.114 * b;
    r = l + (r - l) * S; g = l + (g - l) * S; b = l + (b - l) * S;
    r = (r - 128) * C + 128; g = (g - 128) * C + 128; b = (b - 128) * C + 128;
    a[i] = Math.max(0, Math.min(255, r * B)); a[i + 1] = Math.max(0, Math.min(255, g * B)); a[i + 2] = Math.max(0, Math.min(255, b * B));
  }
  cx.putImageData(d, 0, 0);
  const t2 = new THREE.CanvasTexture(cv); t2.flipY = tex.flipY; t2.wrapS = tex.wrapS; t2.wrapT = tex.wrapT; t2.anisotropy = 8; t2.colorSpace = THREE.SRGBColorSpace; return t2;
}
