#!/usr/bin/env node
// Gera a narração com a voz do cliente no ElevenLabs (só com autorização dele) — SÓ do roteiro final já aprovado.
// Uso: node ferramentas/voz-elevenlabs.mjs "<arquivo-de-roteiro.txt>" "<saida.mp3>" [--confirmar]
// A chave fica em ~/.maquina-4h/segredos.env (ELEVENLABS_API_KEY e ELEVENLABS_VOICE_ID). Nunca é impressa nem salva no projeto.
// Proteção de custo: sem --confirmar só mostra quantos caracteres vai gastar; acima de LIMITE caracteres recusa.
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';

const LIMITE = 1500;                                   // ~1 min de fala; aumente só se o CEO pedir
const arq = process.argv[2], saida = process.argv[3], confirmar = process.argv.includes('--confirmar');
if (!arq || !saida) { console.error('Uso: node ferramentas/voz-elevenlabs.mjs roteiro.txt saida.mp3 [--confirmar]'); process.exit(1); }

function lerSegredos() {
  const p = path.join(os.homedir(), '.maquina-4h', 'segredos.env'); const o = {};
  if (!fs.existsSync(p)) { console.error('Falta o arquivo ' + p + ' (veja entregas/projetos/maquina-4h/CONFIGURAR-VOZ-E-WHATSAPP.md).'); process.exit(2); }
  for (const l of fs.readFileSync(p, 'utf8').split('\n')) { const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/); if (m) o[m[1]] = m[2].replace(/^["']|["']$/g, ''); }
  return o;
}
const texto = fs.readFileSync(arq, 'utf8').replace(/\s+/g, ' ').trim();
console.log(`Roteiro: ${texto.length} caracteres (limite de segurança ${LIMITE}).`);
if (texto.length > LIMITE) { console.error('Roteiro maior que o limite: encurte ou peça OK do CEO para aumentar.'); process.exit(3); }
if (!confirmar) { console.log('Nada foi gasto. Rode de novo com --confirmar para gerar a voz (consome créditos do ElevenLabs).'); process.exit(0); }

const S = lerSegredos();
if (!S.ELEVENLABS_API_KEY || !S.ELEVENLABS_VOICE_ID) { console.error('Faltam ELEVENLABS_API_KEY e/ou ELEVENLABS_VOICE_ID no segredos.env.'); process.exit(2); }
const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${S.ELEVENLABS_VOICE_ID}?output_format=mp3_44100_128`, {
  method: 'POST', headers: { 'xi-api-key': S.ELEVENLABS_API_KEY, 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: texto, model_id: S.ELEVENLABS_MODEL || 'eleven_multilingual_v2', voice_settings: { stability: 0.5, similarity_boost: 0.85 } }),
});
if (!r.ok) { console.error('ElevenLabs recusou (' + r.status + '): ' + (await r.text()).slice(0, 300)); process.exit(4); }
fs.mkdirSync(path.dirname(path.resolve(saida)), { recursive: true });
fs.writeFileSync(saida, Buffer.from(await r.arrayBuffer()));
fs.appendFileSync(path.join(os.homedir(), '.maquina-4h', 'uso-voz.log'), `${new Date().toISOString()} ${texto.length} caracteres -> ${saida}\n`);
console.log('Voz gerada: ' + saida);
