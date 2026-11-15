// Página de teste dos personagens (roupas + movimento). Abrir em /teste-personagens.html
// Controles na barra; parâmetros úteis na URL: ?pose=andando&vel=1.4&foco=gerente-geral
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { carregarModelos, criarPersonagem, posar, VISUAL, ARQUETIPOS } from './bonecos.js';

const par = new URLSearchParams(location.search);
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(2, devicePixelRatio));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);
const cena = new THREE.Scene();
cena.background = new THREE.Color('#aab4c2');
const cam = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.05, 100);
cam.position.set(0, 1.6, 6);
const ctl = new OrbitControls(cam, renderer.domElement);
ctl.target.set(0, 1.0, 0);
cena.add(new THREE.HemisphereLight('#ffffff', '#6a6f78', 1.1));
const sol = new THREE.DirectionalLight('#fff4e0', 2.2);
sol.position.set(3, 6, 5);
sol.castShadow = true;
sol.shadow.mapSize.set(2048, 2048);
Object.assign(sol.shadow.camera, { left: -12, right: 12, top: 4, bottom: -4, near: 1, far: 20 });
cena.add(sol);
const piso = new THREE.Mesh(new THREE.PlaneGeometry(60, 20), new THREE.MeshStandardMaterial({ color: '#8d93a0', roughness: 0.9 }));
piso.rotation.x = -Math.PI / 2; piso.receiveShadow = true; cena.add(piso);

await carregarModelos();
const slugs = par.has('todos') ? Object.keys(VISUAL).filter((k) => !k.startsWith('arq-')) : Object.keys(ARQUETIPOS);
const lista = [];
slugs.forEach((slug, i) => {
  const p = criarPersonagem(slug);
  const g = new THREE.Group();
  g.add(p.raiz);
  g.position.set((i - (slugs.length - 1) / 2) * 1.1, 0, 0);
  g.userData.x0 = g.position.x;
  cena.add(g);
  lista.push({ slug, p, g, fase: i * 1.7 });
  if (par.has('so') && par.get('so') !== slug) g.visible = false; // ?so=<slug> mostra só um personagem
});

let pose = par.get('pose') || 'trabalhando', vel = parseFloat(par.get('vel') || '1.4'), circulo = false;
const barra = document.getElementById('barra');
const poses = ['parado', 'trabalhando', 'concluido', 'em_pe', 'conversando', 'apontando', 'olhando_janela', 'andando'];
const botoes = {};
function btn(rot, fn, id) { const b = document.createElement('button'); b.textContent = rot; b.onclick = () => fn(b); barra.appendChild(b); if (id) botoes[id] = b; return b; }
for (const ps of poses) btn(ps, () => { pose = ps; marca(); }, ps);
btn('vel 1.4', () => { vel = 1.4; marca(); }, 'v1');
btn('vel 2.5', () => { vel = 2.5; marca(); }, 'v2');
btn('corrida 4.4', () => { vel = 4.4; marca(); }, 'v3');
btn('círculo', (b) => { circulo = !circulo; marca(); }, 'circ');
function marca() {
  for (const k of poses) botoes[k].classList.toggle('on', k === pose);
  botoes.v1.classList.toggle('on', vel === 1.4); botoes.v2.classList.toggle('on', vel === 2.5); botoes.v3.classList.toggle('on', vel === 4.4);
  botoes.circ.classList.toggle('on', circulo);
}
marca();
// enquadramento por URL: foco=<slug>&alvo=rosto|peito|pernas|corpo&ang=graus
function enquadrar() {
  const f = par.get('foco'); if (!f) return;
  const it = lista.find((l) => l.slug === f); if (!it) return;
  const alvo = par.get('alvo') || 'corpo', ang = (parseFloat(par.get('ang') || '20')) * Math.PI / 180;
  const sentado = ['parado', 'trabalhando', 'concluido'].includes(pose);
  const base = { rosto: [1.62, 0.8], peito: [1.35, 1.1], pernas: [0.5, 1.6], corpo: [0.95, 3.2], pes: [0.12, 0.8] }[alvo];
  const dy = sentado ? -0.35 : 0;
  ctl.target.set(it.g.position.x, base[0] + dy, 0);
  cam.position.set(it.g.position.x + Math.sin(ang) * base[1], base[0] + dy + 0.1, Math.cos(ang) * base[1]);
}
if (par.has('x')) { // câmera livre: ?x=<centro>&d=<distância>&h=<altura>&ang=<graus>
  const x = parseFloat(par.get('x')), d = parseFloat(par.get('d') || '5'), h = parseFloat(par.get('h') || '1'), a = parseFloat(par.get('ang') || '0') * Math.PI / 180;
  ctl.target.set(x, h, 0); cam.position.set(x + Math.sin(a) * d, h + 0.3, Math.cos(a) * d);
}
enquadrar();
window.__t = { lista, cena, cam, ctl, THREE, setPose: (p, v) => { pose = p; if (v) vel = v; marca(); }, enquadrar, par };
addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); });

let quadro = 0;
const relogio = new THREE.Clock(); let t = 0, congelar = par.has('congelar');
const info = document.getElementById('info');
function loop() {
  quadro++;
  const dt = Math.min(0.05, relogio.getDelta()); if (!congelar) t += dt; else if (par.get('t')) t = parseFloat(par.get('t'));
  lista.forEach((l, i) => {
    const andando = pose === 'andando';
    l.p.vel = vel;
    if (andando) l.p.ciclo += (congelar ? 0 : dt) * vel * 6.2;
    if (congelar && andando && par.has('fase') && quadro === 3) { // fixa a fase do passo (radianos) para tirar fotos
      const L = vel <= 2 ? 1.05 * vel : 2.1 + (vel - 2) * 0.45; l.p.ciclo += parseFloat(par.get('fase')) * 6.2 * L / (Math.PI * 2);
    }
    if (circulo && andando) { // anda em círculo ao redor do ponto de origem
      const w = vel / 1.2, a = t * w + i;
      l.g.position.set(l.g.userData.x0 + Math.sin(a) * 1.2, 0, -1.5 + Math.cos(a) * 1.2);
      l.g.rotation.y = Math.atan2(Math.cos(a), -Math.sin(a));
    } else { l.g.position.set(l.g.userData.x0, 0, 0); l.g.rotation.y = 0; }
    posar(l.p, pose, t, l.fase, congelar && par.get('t') ? 1 : dt);
  });
  ctl.update();
  renderer.render(cena, cam);
  info.textContent = `pose ${pose} · vel ${vel}`;
  requestAnimationFrame(loop);
}
loop();
