---
tipo: aprendizado
projetos: [Agencia IA Dream, todos]
tags: [aprendizado, 3d, threejs, personagens]
criado: 2026-11-11
atualizado: 2026-11-11
resumo: Personagem montado com formas geométricas no código fica "boneco de brinquedo"; para o acabamento Pixar das referências é preciso modelo 3D esculpido (GLB) — gerado por IA a partir da imagem ou comprado/baixado
---
# Personagens Pixar exigem modelo 3D de verdade

- 11/11/2026: tentativas no escritório 3D — (1) corpo Quaternius realista com roupa pintada; (2) o mesmo com roupa em casca; (3) bonecos cartoon procedurais (cápsulas/esferas). Nenhum chega ao visual das referências do CEO (cabeça grande esculpida, cabelo em mechas, tecido macio com dobras).
- Caminho para ficar igual: gerar modelos 3D a partir das imagens (Meshy, Tripo, Rodin etc. — serviço pago, precisa OK do CEO), riggar (Mixamo/auto-rig) e carregar como GLB; ou usar pack pronto de personagens estilizados com licença.
- O código atual (`escritorio/personagem.js`) já tem rig por articulações e todas as poses; dá para trocar a malha mantendo a API.

## Pesquisa (11/11/2026)
- Meshy: imagem→3D + auto-rig + animações prontas, exporta GLB/FBX; plano grátis ~100 créditos/mês (~3 modelos, licença CC BY 4.0, 10 downloads); Pro ~US$20/mês (conferir em meshy.ai/pricing).
- Tripo: parecido; grátis ~200–300 créditos, uso não comercial; Pro ~US$20/mês; rig no grátis é incerto.
- Local e grátis: Hunyuan3D 2.1 / TRELLIS têm versões não oficiais para Mac (MPS); mínimo 16 GB (este Mac tem 16 GB), textura pode falhar sem CUDA, sem rig.
- Animações humanas: Mixamo (grátis com conta Adobe, exporta FBX → converter para GLB) ou as animações prontas do Meshy.
- Caminho recomendado: CEO cria conta grátis no Meshy → testar 3 bonecos (gerente img1, toon6, toon4) → se aprovar, plano Pro para os outros 12 → GLB + AnimationMixer no escritório.

## GLB enviado pelo CEO (12/11/2026)
- `escritorio/modelos/ceo-masculino/personagem_fiel_referencia.glb` (gerado com trimesh): textura frontal da imagem + volume aproximado, **sem rig e sem 360°**. De frente fica idêntico; de lado/costas aparece duplicado e achatado. Teste em `escritorio/teste-glb.html?ang=`.
- Uso possível: recorte sempre virado para a câmera (billboard, pose única) ou gerar 3D com esqueleto a partir da imagem.

Projetos: [[Agencia IA Dream]]

- Envio de imagem para sites (ex.: Meshy): o navegador do app não aceita envio de arquivo por automação; usar o Claude in Chrome (`file_upload`) com o CEO logado lá. Meshy grátis: 100 créditos/mês, ~20 por imagem→3D.

- Meshy na prática (12/11/2026): imagem→3D com textura = 30 créditos, fica fiel à imagem; remesh 30K é pago, 10K grátis; rig humanoide grátis (marcadores ajustáveis, esqueleto Mixamo); animações de sentar são premium; **baixar modelo com rig/animação exige plano pago** (Starter R$54/mês 250 cr/20 downloads; Pro R$53,95 no 1º mês, depois R$107,90, 1.000 cr). Sentar/digitar dá para fazer girando os ossos no three.js.

- Defeito do rig (12/11/2026): na caminhada surge triângulo branco no quadril/mão (interior da roupa visível quando o punho atravessa a malha). Correções: marcadores de punho/cotovelo mais afastados ao riggar; no three.js, material da roupa com lado de dentro escuro (side/backface) ou DoubleSide com cor do tecido.

- Alternativa GRÁTIS (12/11/2026): imagem→3D no Hugging Face Space `trellis-community/TRELLIS` (abrir `trellis-community-trellis.hf.space`, enviar imagem por file_upload, "Generate & Extract GLB", ~1 min, modelo completo com textura mais escura). `tencent/Hunyuan3D-2.1` falha com "GPU duration 270s > máximo" para anônimo. Sem esqueleto: riggar por código ou Mixamo (gratuito, exige conta Adobe do CEO).

- Rig por código (12/11/2026): GLB do TRELLIS não tem pele nem normais (computeVertexNormals), vem com placa preta sob os pés (remover triângulos com y < -0,488 no espaço do modelo). Esqueleto: 15 segmentos (quadril, peito, cabeça, braço/antebraço/mão e coxa/canela/pé ×2), peso = exp(-(d/σ)²) por vértice com máscaras (braços não pegam o tronco, pernas só abaixo do quadril); no THREE.Bone rotação x positiva leva o membro que aponta para baixo para TRÁS. Ver `escritorio/boneco-trellis.js`.

- Cota (12/11/2026): TRELLIS no HF Space usa ZeroGPU; anônimo gasta ~40–60 s de GPU por modelo e esgota em ~2–3 modelos/dia ("ZeroGPU quota exceeded… Try again in ~24h"); conta HF logada dá mais. Folhas de personagem com várias vistas devem ser recortadas para UMA vista de frente antes de enviar.

- 13/11/2026 (folhas Pixar do CEO): TRELLIS anônimo gerou só 1 modelo (Noah) e bloqueou a 2ª ('ZeroGPU quota exceeded: 120s pedidos vs 158s restantes, tente em ~24h', libera ~16:15 do dia seguinte); logar no Hugging Face dá mais cota (o agente não cria conta nem digita senha). Folhas de ~735 px dão recortes pequenos (~110x300 px) = qualidade limitada; recortar com GrabCut e ampliar 4x. Resultado Noah: rosto/cabelo/moletom bem próximos, textura mais escura, zíper/cordão borrados, costas inventadas; andando bom, acenar não implementado. boneco-trellis.js generalizado (juntas por modelo, remoção de pedaços soltos); ?bonecos=pixar com MODELOS_PIXAR. Página de comparação ao vivo em /comparacao/pixar-lado-a-lado.html (ferramenta do navegador não salva PNG no disco).

- 14/11/2026 (retomada): todos os Spaces grátis de imagem→3D (TRELLIS, TRELLIS.2, InstantMesh, SF3D, TripoSG, Hunyuan3D-2) rodam em ZeroGPU e a cota anônima é por IP, compartilhada entre todos; TripoSR Space com erro; InstantMesh falha no generate_mvs. O Claude in Chrome ficou 'not connected', então o agente usou Playwright headless + gradio_client sem login. Resultado: Noah (TRELLIS) o melhor; Nunu e barba (SF3D) razoáveis com rosto borrado; mulher (SF3D) quebrada (pernas fundidas), segue no cartoon. Rig por código: braço levantado parece lâmina porque a malha não separa braço e tronco. Conclusão: sem cota/login ou serviço pago (Meshy, a conferir preço) não chega ao acabamento Pixar. Decisão do CEO pendente (logar no HF, pagar Meshy, ou esperar a cota ~16:15 de 14/11).

- 14/11/2026: opções avaliadas — Meshy/Tripo (~US$20/mês, auto-rig; Meshy grátis = não comercial), Rodin (paga por download), pacote Casual Characters (~US$69), CC0 Kenney/KayKit/100 Avatars (estilo diferente). Recomendação: Meshy 1 mês; aguardando OK do CEO.
