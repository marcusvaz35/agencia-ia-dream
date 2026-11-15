---
tipo: stack
projetos: [Agencia IA Dream]
tags: [stack, instagram, automacao]
criado: 2026-11-11
atualizado: 2026-11-11
resumo: Agendar Reels pelo instagram.com: Postar → enviar → corte Original → Avançar ×2 → legenda → Programar conteúdo → data/hora → Programar
---
# Agendar posts no Instagram web

- Input de arquivo escondido: mostrar via JS e enviar com file_upload (limite **10 MB** por envio → gerar versão leve < 9,5 MB).
- Hora/minuto: focar `[aria-label="Hours"]`/`[aria-label="Minutes"]` e digitar.
- Conferir em instagram.com/scheduled_content/.

Projetos: [[Agencia IA Dream]]

- Fluxo que funcionou em 12/11 (4 Reels): Programar conteúdo → mostrar o input de arquivo por JS e `file_upload` → ícone de corte (canto inferior esquerdo da prévia; a posição varia) → **Original** → Avançar ×2 → legenda (digitar `@cliente ` com espaço final fecha a lista de menções) → rolar até Data/Hora → seletor de data abre calendário → clicar Hora (triple_click) e digitar `18` → Programar. A hora padrão vem como 19:00. Conferir em scheduled_content (vista semanal).

- Atalho estável (12/11, janela larga 1568x750): clicar por JS nos botões de texto exato ("Concluir", "Programar conteúdo", "Avançar", "Programar"); ícone de corte em (538,638) e "Original" em (563,453); legenda em (1030,190) e digitar `Amém 🙏🏻` direto; data: abrir o seletor em (1058,367) e clicar o dia; hora: triple_click em (945,432) e digitar `06` (ou `18`); depois "Programar" e esperar "foi programado". Coordenadas variam com o tamanho da janela — conferir com uma captura no 1º post.

- Cuidado (12/11, janela 1534x784): a posição dos campos Data/Hora muda conforme o scrollIntoView e se há faixa de notificação; SEMPRE tirar uma captura após rolar até a hora e só então clicar (data ~(1058,408) e hora ~(950,473) numa variação; ~(1058,448) e ~(950,513) em outra). Conferir `Data/Hora` pelo texto do diálogo antes de Programar.

- Carrossel (12/11): Postar → Publicação → file_upload de vários PNGs de uma vez (ordem do nome) → só aparece corte 4:5/1:1 (escolher 4:5 para imagens 1080x1350) → Avançar ×2 → legenda → Data/Hora → Programar. O seletor de hora pode errar (mostrou 00:00): conferir o valor antes de Programar. Conferir em scheduled_content após recarregar.

- 14/11/2026 (@perfil-do-ceo): ao programar, o rótulo "feito com IA" fica desligado e "Compartilhar no Facebook" vem LIGADO por padrão — perguntar ao CEO. Algumas contas não aceitam ser marcadas (o @ some ao salvar). Conferir sempre na vista semanal de scheduled_content (avançar com a seta para a semana certa).

- 15/11/2026: o calendario-agendado.md pode estar desatualizado (o CEO mexe na conta) — sempre conferir scheduled_content antes de excluir/substituir. Na conta do Cliente Exemplo, "Compartilhar no Facebook" não aparece no diálogo.
- 15/11/2026: a janela do Chrome pode mudar de tamanho no meio do fluxo e o clique do corte cai errado (sai quadrado e sem legenda) — conferir 9:16 e a legenda na tela antes de Programar.
- 15/11/2026: dois agentes no mesmo Chrome funcionam em abas separadas, mas quando um fecha a aba pode fechar o grupo de abas do outro — quem continuar deve reabrir aba e conferir em scheduled_content o que já foi programado antes de seguir (não duplicar).
