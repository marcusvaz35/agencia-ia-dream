// Ferramenta dos agentes: informa o PROGRESSO REAL do trabalho (etapas concluídas).
// Uso:
//   node escritorio/progresso.mjs <slug-do-agente> <feito> <total> ["etapa atual"]
//   node escritorio/progresso.mjs <slug-do-agente> --pct 40 ["etapa atual"]
// Grava uma linha em escritorio/eventos.jsonl (o mesmo arquivo do hook.mjs).
// O escritório 3D mostra o anel com arco SÓLIDO (real). Sem isso ele só estima pelo tempo.
// Nunca atrapalha o trabalho: em caso de erro de uso, avisa e sai com código 1; erro de disco é ignorado.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const ARQ = process.env.EVENTOS_ARQ || path.join(AQUI, 'eventos.jsonl');
const DIR_AGENTES = path.join(AQUI, '..', '.claude', 'agents');

const uso = () => {
  console.error('Uso: node escritorio/progresso.mjs <slug> <feito> <total> ["etapa"]   ou   <slug> --pct 40 ["etapa"]');
  process.exit(1);
};
const args = process.argv.slice(2);
const slug = args.shift();
if (!slug) uso();

let agentesValidos = [];
try { agentesValidos = fs.readdirSync(DIR_AGENTES).filter((f) => f.endsWith('.md') && !f.startsWith('.')).map((f) => f.slice(0, -3)); } catch { /* sem lista: não valida */ }
if (agentesValidos.length && !agentesValidos.includes(slug)) {
  console.error(`Agente desconhecido: "${slug}". Válidos: ${agentesValidos.join(', ')}`);
  process.exit(1);
}

let feito = null, total = null, pct = null, etapa = '';
if (args[0] === '--pct') {
  pct = Number(args[1]);
  if (!Number.isFinite(pct)) uso();
  etapa = args[2] || '';
} else {
  feito = Number(args[0]); total = Number(args[1]);
  if (!Number.isFinite(feito) || !Number.isFinite(total) || total <= 0 || feito < 0) uso();
  etapa = args[2] || '';
  pct = (feito / total) * 100;
}
pct = Math.max(0, Math.min(100, Math.round(pct * 10) / 10));

const reg = { t: Date.now(), ev: 'Progresso', agente: slug, feito, total, pct, etapa: String(etapa).replace(/\s+/g, ' ').trim().slice(0, 80) };
try {
  fs.appendFileSync(ARQ, JSON.stringify(reg) + '\n');
  console.log(`Progresso de ${slug}: ${pct}%${reg.etapa ? ` — ${reg.etapa}` : ''}`);
} catch (e) {
  console.error('Não consegui gravar o progresso (segue o trabalho):', e.message);
}
process.exit(0);
