---
tipo: decisao
projetos: [Agencia IA Dream]
tags: [escritorio-3d, navegador, ideia]
criado: 2026-11-12
resumo: Ideia do CEO — cada agente tem um monitor no escritório 3D que mostra o que ele faz no navegador, em vez de usar a aba pessoal do CEO
---
# Monitores por agente no escritório 3D

- Pedido do CEO (12/11/2026): cada funcionário tem uma "telinha"; o que o agente estiver fazendo no navegador deve aparecer nela, e não na aba pessoal do CEO.
- Limite atual: o Claude no Chrome opera o Chrome real do CEO. Para isso seria preciso um navegador separado (perfil próprio, login feito uma vez pelo CEO) e transmitir imagens dele para a tela 3D de cada agente.
- Estado: só anotado; plano com prazo a apresentar ao CEO depois das respostas aos comentários.

Projetos: [[Agencia IA Dream]]

- Plano apresentado (12/11): cada mesa já tem monitor com ícone (`telaMonitor` em `escritorio/mundo.js`). Nível 1: texto de atividade ao vivo via ganchos (~2–3 h, ESTIMATIVA). Nível 2: Chromium Playwright separado por agente + frames a cada 2 s servidos pelo `servidor.mjs` (~1–2 dias, ESTIMATIVA); logins feitos só pelo CEO; agentes teriam de operar esse navegador. Risco: verificação de login do Instagram. Recomendado começar pelo Nível 1.

- 12/11: CEO não quer abas dos agentes no Chrome dele e quer manter os logins. Claude no Chrome sempre abre abas no Chrome real (só dá para minimizar). Caminho proposto: segundo Chrome sem janela usando CÓPIA do perfil (sessões sensíveis → exige OK explícito do CEO; pode copiar só o Instagram). Aguardando OK.

