#!/usr/bin/env node
// Avisa o CEO que um vídeo ficou pronto para aprovação.
// Uso: node ferramentas/video-pronto.mjs "<caminho do vídeo>" "<cliente>" "<horário/tipo>" "<descrição curta>"
// Ex.: node ferramentas/video-pronto.mjs "/.../final.mp4" "<cliente>" "<horário>-video-falado" "<tema>"
//
// O que faz:
// 1. COPIA o vídeo (nunca move) para VIDEOS-PRONTOS/AAAA-MM-DD/<cliente>_<horario>_<descricao>.mp4
// 2. Acrescenta uma linha em VIDEOS-PRONTOS/AAAA-MM-DD/PARA-APROVAR.md
// 3. Mostra uma notificação no macOS
// 4. Registra o evento no feed do escritório 3D (escritorio/eventos.jsonl)
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [origem, cliente = 'sem-cliente', horario = 'video', descricao = ''] = process.argv.slice(2);
if (!origem || !fs.existsSync(origem)) {
  console.error('Vídeo não encontrado: ' + origem);
  process.exit(1);
}

const agora = new Date();
const dia = agora.toLocaleDateString('sv-SE'); // AAAA-MM-DD no fuso local
const hora = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
const limpa = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase().slice(0, 50);

const pasta = path.join(RAIZ, 'VIDEOS-PRONTOS', dia);
fs.mkdirSync(pasta, { recursive: true });
const ext = path.extname(origem) || '.mp4';
let nome = `${limpa(cliente)}_${limpa(horario)}${descricao ? '_' + limpa(descricao) : ''}${ext}`;
let n = 2;
while (fs.existsSync(path.join(pasta, nome))) nome = nome.replace(new RegExp(`(_v\\d+)?\\${ext}$`), `_v${n++}${ext}`);
const destino = path.join(pasta, nome);
fs.copyFileSync(origem, destino);

const lista = path.join(pasta, 'PARA-APROVAR.md');
if (!fs.existsSync(lista)) {
  fs.writeFileSync(lista, `# Vídeos para aprovar — ${dia}\n\nMarque [x] quando aprovar. Nada vai ao ar sem o seu OK.\n\n| ok | hora | cliente | horário/tipo | descrição | arquivo |\n|---|---|---|---|---|---|\n`);
}
fs.appendFileSync(lista, `| [ ] | ${hora} | ${cliente} | ${horario} | ${descricao} | [${nome}](./${encodeURI(nome)}) |\n`);

try {
  const msg = `${cliente} · ${horario}${descricao ? ' · ' + descricao : ''}`.replace(/"/g, "'");
  execFileSync('osascript', ['-e', `display notification "${msg}" with title "🎬 Vídeo pronto para aprovar" sound name "Glass"`]);
} catch { /* sem notificação: segue */ }

try {
  fs.appendFileSync(path.join(RAIZ, 'escritorio', 'eventos.jsonl'),
    JSON.stringify({ t: Date.now(), ev: 'VideoPronto', agente: 'editor-de-video', desc: `${cliente} · ${horario}${descricao ? ' · ' + descricao : ''}`, arquivo: path.relative(RAIZ, destino) }) + '\n');
} catch { /* sem escritório: segue */ }

console.log(`Pronto para aprovar: ${path.relative(RAIZ, destino)}`);
