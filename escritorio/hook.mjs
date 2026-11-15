// Gancho (hook) do Claude Code: anota a atividade dos agentes em escritorio/eventos.jsonl.
// O servidor do escritório lê esse arquivo e mostra quem está trabalhando.
// Nunca bloqueia nem atrapalha o Claude Code: qualquer erro é ignorado.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const curto = (s, n = 140) => String(s ?? '').replace(/\s+/g, ' ').trim().slice(0, n);

try {
  let txt = '';
  for await (const parte of process.stdin) txt += parte;
  const p = JSON.parse(txt || '{}');
  const ev = p.hook_event_name;
  const reg = {
    t: Date.now(),
    ev,
    sessao: String(p.session_id || '').slice(0, 8),
    id: p.agent_id || p.tool_use_id || null,
    agente: p.agent_type || p.subagent_type || p.tool_input?.subagent_type || null,
  };
  if (ev === 'PreToolUse') {
    if (!reg.agente) reg.agente = 'general-purpose';
    // vira o texto do balão ao lado do anel no escritório: só um resumo curto (nunca o prompt inteiro)
    reg.desc = curto(p.tool_input?.description || p.tool_input?.prompt, 80);
  }
  if (ev === 'UserPromptSubmit') reg.desc = curto(p.prompt);
  fs.appendFileSync(path.join(AQUI, 'eventos.jsonl'), JSON.stringify(reg) + '\n');
} catch {
  // silencioso de propósito
}
process.exit(0);
