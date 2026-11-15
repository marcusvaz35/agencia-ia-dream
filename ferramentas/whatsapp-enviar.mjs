#!/usr/bin/env node
// Envia o vídeo pronto como DOCUMENTO no WhatsApp do CEO, pela API oficial (WhatsApp Cloud API / Meta).
// Uso: node ferramentas/whatsapp-enviar.mjs "<video.mp4>" "<legenda curta>"
// Chaves em ~/.maquina-4h/segredos.env: WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_PARA (seu número com DDI, ex.: 5511999999999),
// opcional WHATSAPP_TEMPLATE (nome do modelo aprovado com cabeçalho de documento; necessário para o envio automático fora da janela de 24 h).
import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';
const arq = process.argv[2], legenda = process.argv[3] || 'Seu vídeo de hoje está pronto para aprovar.';
if (!arq || !fs.existsSync(arq)) { console.error('Uso: node ferramentas/whatsapp-enviar.mjs video.mp4 "legenda"'); process.exit(1); }
const p = path.join(os.homedir(), '.maquina-4h', 'segredos.env'); const S = {};
if (!fs.existsSync(p)) { console.error('Falta ' + p + ' (veja CONFIGURAR-VOZ-E-WHATSAPP.md).'); process.exit(2); }
for (const l of fs.readFileSync(p, 'utf8').split('\n')) { const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/); if (m) S[m[1]] = m[2].replace(/^["']|["']$/g, ''); }
for (const k of ['WHATSAPP_TOKEN', 'WHATSAPP_PHONE_NUMBER_ID', 'WHATSAPP_PARA']) if (!S[k]) { console.error('Falta ' + k + ' no segredos.env'); process.exit(2); }
const base = `https://graph.facebook.com/v21.0/${S.WHATSAPP_PHONE_NUMBER_ID}`, H = { Authorization: 'Bearer ' + S.WHATSAPP_TOKEN };
const nome = path.basename(arq);
// 1) sobe o arquivo
const fd = new FormData(); fd.append('messaging_product', 'whatsapp'); fd.append('type', 'video/mp4');
fd.append('file', new Blob([fs.readFileSync(arq)], { type: 'video/mp4' }), nome);
const up = await fetch(base + '/media', { method: 'POST', headers: H, body: fd }); const upj = await up.json();
if (!upj.id) { console.error('Falha ao subir o arquivo: ' + JSON.stringify(upj).slice(0, 300)); process.exit(4); }
// 2) manda como documento (dentro da janela de 24 h) ou, se recusado, pelo modelo aprovado
async function enviar(corpo) { const r = await fetch(base + '/messages', { method: 'POST', headers: { ...H, 'Content-Type': 'application/json' }, body: JSON.stringify({ messaging_product: 'whatsapp', to: S.WHATSAPP_PARA, ...corpo }) }); return [r.ok, await r.json()]; }
let [ok, j] = await enviar({ type: 'document', document: { id: upj.id, filename: nome, caption: legenda } });
if (!ok && S.WHATSAPP_TEMPLATE) {
  [ok, j] = await enviar({ type: 'template', template: { name: S.WHATSAPP_TEMPLATE, language: { code: 'pt_BR' }, components: [
    { type: 'header', parameters: [{ type: 'document', document: { id: upj.id, filename: nome } }] },
    { type: 'body', parameters: [{ type: 'text', text: legenda.slice(0, 200) }] } ] } });
}
if (!ok) { console.error('WhatsApp recusou: ' + JSON.stringify(j).slice(0, 400)); process.exit(5); }
console.log('Enviado ao WhatsApp como documento: ' + nome);
