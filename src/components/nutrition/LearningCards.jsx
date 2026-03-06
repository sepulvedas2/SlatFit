import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ChevronRight, BookOpen, Lightbulb, Flame, Droplets, Brain, Dumbbell, Zap, HelpCircle, Apple, TrendingUp } from "lucide-react";

// ─── DADOS ────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: "alimentacao", label: "Alimentação Prática", emoji: "🥗", icon: Apple, color: "#4ade80", bg: "rgba(74,222,128,0.12)" },
  { id: "nutricao",    label: "Nutrição Básica",     emoji: "⚡", icon: Zap,    color: "#facc15", bg: "rgba(250,204,21,0.12)" },
  { id: "mitos",       label: "Mitos & Verdades",    emoji: "💡", icon: Lightbulb, color: "#c084fc", bg: "rgba(192,132,252,0.12)" },
  { id: "hidratacao",  label: "Hidratação",          emoji: "💧", icon: Droplets, color: "#60a5fa", bg: "rgba(96,165,250,0.12)" },
  { id: "comportamento", label: "Comportamento",     emoji: "🧠", icon: Brain,  color: "#f472b6", bg: "rgba(244,114,182,0.12)" },
  { id: "treino",      label: "Treino & Recuperação",emoji: "🏋️", icon: Dumbbell, color: "#fb923c", bg: "rgba(251,146,60,0.12)" },
  { id: "gordura",     label: "Queima de Gordura",   emoji: "🔥", icon: Flame,  color: "#f97316", bg: "rgba(249,115,22,0.12)" },
  { id: "diaadia",     label: "Dia a Dia Fitness",   emoji: "📅", icon: TrendingUp, color: "#34d399", bg: "rgba(52,211,153,0.12)" },
  { id: "rapidas",     label: "Perguntas Rápidas",   emoji: "❓", icon: HelpCircle, color: "#a78bfa", bg: "rgba(167,139,250,0.12)" },
];

const TIPS = [
  // ── ALIMENTAÇÃO PRÁTICA ──
  { id:1,  cat:"alimentacao", title:"Comer fora sem sair da dieta",     body:"Comer fora é desafiador, mas possível com estratégia.", tips:["Prefira grelhados, cozidos ou assados","Peça a salada sem molho industrializado","Controle o tamanho da porção","Evite frituras e ultraprocessados","Beba água antes da refeição para reduzir a fome"] },
  { id:2,  cat:"alimentacao", title:"O que comer depois do treino",      body:"Após o treino, seu corpo precisa recuperar músculos e repor energia.", tips:["Consuma entre 20–40g de proteína","Inclua carboidratos para repor energia","Priorize alimentos naturais","A janela pós-treino é de ~2 horas, mas não é urgente","Hidrate-se bem"] },
  { id:3,  cat:"alimentacao", title:"O que comer antes do treino",       body:"O pré-treino ideal dá energia sem deixar o estômago pesado.", tips:["Coma 1–2h antes do treino","Priorize carboidratos de fácil digestão","Adicione uma fonte leve de proteína","Evite gorduras em excesso antes de treinar","Não treine em jejum total se sentir fraqueza"] },
  { id:4,  cat:"alimentacao", title:"Como montar um prato saudável",     body:"Um prato equilibrado é a base de uma alimentação consistente.", tips:["Metade do prato = vegetais coloridos","¼ do prato = proteína magra","¼ do prato = carboidratos complexos","Adicione uma colher de gordura boa","Beba água, não suco industrializado"] },
  { id:5,  cat:"alimentacao", title:"Como controlar porções",            body:"Controlar porções é mais simples do que parece quando você usa referências visuais.", tips:["Use a palma da mão como referência para proteína","Use o punho fechado para carboidratos","Use o polegar para gorduras","Coma devagar — o cérebro leva 20min para registrar saciedade","Evite comer da embalagem"] },
  { id:6,  cat:"alimentacao", title:"Como evitar exageros",              body:"Exagerar de vez em quando é normal, mas criar estratégias reduz a frequência.", tips:["Nunca chegue com fome extrema em uma refeição","Faça refeições em horários regulares","Evite beliscar sem fome real","Planeje refeições com antecedência","Se exagerou, retome normalmente na próxima refeição"] },
  { id:7,  cat:"alimentacao", title:"Como escolher melhor no supermercado", body:"O supermercado é onde sua dieta começa — boas escolhas facilitam tudo.", tips:["Faça lista antes de ir","Não vá com fome","Priorize produtos com menos de 5 ingredientes","Leia o rótulo: menos ingredientes = melhor","Compre mais na área de hortifrúti"] },
  { id:8,  cat:"alimentacao", title:"Como fazer lanches saudáveis",      body:"Lanches inteligentes mantêm o metabolismo ativo e evitam compulsão nas refeições principais.", tips:["Kombine proteína + carboidrato","Exemplos: ovo cozido + fruta, iogurte + castanhas","Evite snacks ultraprocessados","Prepare seus lanches com antecedência","Mantenha opções saudáveis acessíveis"] },
  { id:9,  cat:"alimentacao", title:"Como reduzir açúcar no dia a dia",  body:"Reduzir açúcar não significa eliminar, mas criar consciência.", tips:["Elimine refrigerante primeiro — alto impacto","Reduza açúcar no café gradualmente","Leia rótulos: açúcar tem muitos nomes","Substitua doces por frutas na maioria das vezes","Não precisa ser perfeito, só consistente"] },
  { id:10, cat:"alimentacao", title:"Como reduzir ultraprocessados",     body:"Ultraprocessados são projetados para viciar — reduzir exige estratégia.", tips:["Identifique seus 3 principais ultraprocessados","Substitua um por vez, sem pressa","Prepare versões caseiras dos favoritos","Não os mantenha em casa — se não está, não come","Leia ingredientes: lista longa = ultraprocessado"] },

  // ── NUTRIÇÃO BÁSICA ──
  { id:11, cat:"nutricao", title:"O que são macronutrientes",            body:"Macronutrientes são os três grupos principais que fornecem energia ao corpo.", tips:["Proteínas: constroem e reparam músculos (4 kcal/g)","Carboidratos: principal fonte de energia (4 kcal/g)","Gorduras: hormonios e absorção de vitaminas (9 kcal/g)","Você precisa dos três para funcionar bem","Nenhum macronutriente é vilão isoladamente"] },
  { id:12, cat:"nutricao", title:"O que são micronutrientes",            body:"Micronutrientes são vitaminas e minerais essenciais para o funcionamento do organismo.", tips:["Vitamina D: essencial para ossos e imunidade","Ferro: transporte de oxigênio no sangue","Magnésio: mais de 300 reações no corpo","Zinco: imunidade e testosterona","Dieta variada e colorida = micronutrientes cobertos"] },
  { id:13, cat:"nutricao", title:"Por que proteína é importante",        body:"Proteína é o macronutriente mais importante para quem treina.", tips:["Constrói e repara tecido muscular","Aumenta saciedade — você fica mais satisfeito","Tem maior efeito térmico (queima mais ao ser digerida)","Meta mínima: 1,6–2g por kg de peso corporal","Distribua ingestão ao longo do dia"] },
  { id:14, cat:"nutricao", title:"Por que carboidrato não é vilão",      body:"Carboidrato é demonizado erroneamente — o problema está na quantidade e qualidade.", tips:["Carboidratos fornecem energia para o cérebro e músculos","Prefira complexos: arroz integral, batata, aveia","Simples (açúcar) em excesso é o problema","Após o treino, carboidrato ajuda na recuperação","Restrição severa pode prejudicar performance"] },
  { id:15, cat:"nutricao", title:"Para que servem as gorduras",          body:"Gorduras são essenciais — seu corpo não funciona sem elas.", tips:["Produção de hormônios (testosterona, estrogênio)","Absorção de vitaminas A, D, E e K","Gorduras boas: azeite, abacate, castanhas, peixes","Evite gordura trans e minimize saturada","~25–35% das calorias diárias devem vir de gordura"] },
  { id:16, cat:"nutricao", title:"O que são fibras e por que importam",  body:"Fibras são carboidratos que não são digeridos — e fazem muito pela sua saúde.", tips:["Controlam a glicemia (açúcar no sangue)","Aumentam saciedade","Alimentam bactérias boas do intestino","Meta: 25–35g por dia","Fontes: legumes, frutas com casca, grãos, sementes"] },
  { id:17, cat:"nutricao", title:"Como funciona o metabolismo",          body:"Metabolismo é o conjunto de reações químicas que mantêm seu corpo vivo e funcionando.", tips:["TMB = energia que você gasta em repouso total","Massa muscular aumenta o metabolismo basal","Atividade física aumenta gasto total","Não existe 'metabolismo lento' sem causa clínica","Consistência alimentar estabiliza o metabolismo"] },
  { id:18, cat:"nutricao", title:"O que é déficit calórico",             body:"Déficit calórico é a base do emagrecimento — sem ele, não há perda de peso.", tips:["Déficit = comer menos do que você gasta","500 kcal/dia de déficit = ~0,5kg/semana","Déficit muito grande = perda de músculo","Ideal: 300–500 kcal abaixo do seu TDEE","Não precisa contar calorias para criar déficit"] },
  { id:19, cat:"nutricao", title:"O que é superávit calórico",           body:"Para ganhar massa muscular, você precisa fornecer mais energia do que gasta.", tips:["Superávit = comer mais do que você gasta","Superávit de 200–300 kcal é suficiente para iniciantes","Excesso muito grande vira gordura, não músculo","Combine com treino de força para resultado","Ganho de músculo é lento: 1–2kg/mês no máximo"] },
  { id:20, cat:"nutricao", title:"Como funciona o ganho de massa",       body:"Ganhar massa muscular é um processo que exige paciência, proteína e treino.", tips:["Treino de força é o estímulo principal","Proteína adequada é obrigatória (2g/kg)","Superávit calórico moderado ajuda","Sono é quando o músculo se recupera e cresce","Consistência ao longo de meses faz a diferença"] },

  // ── MITOS ──
  { id:21, cat:"mitos", title:"Suco detox realmente funciona?",          body:"O conceito de 'detox' é um mito — seu fígado e rins já fazem esse trabalho.", tips:["Fígado e rins filtram toxinas naturalmente","Nenhum suco tem propriedade comprovada de 'limpar'","Sucos com frutas têm muito açúcar","Água, sono e alimentação natural são o verdadeiro detox","Gaste o dinheiro em comida de verdade"] },
  { id:22, cat:"mitos", title:"Carboidrato realmente engorda?",          body:"Carboidrato em si não engorda — excesso de calorias totais engorda.", tips:["Calorias totais determinam ganho ou perda de peso","Carboidrato tem 4 kcal/g (mesma proteína)","O problema: carboidratos refinados são hipercalóricos","Em déficit calórico, você emagrece mesmo comendo carbo","Qualidade e quantidade importam mais que o macronutriente"] },
  { id:23, cat:"mitos", title:"Comer à noite engorda?",                  body:"Horário de comer não determina ganho de peso — o total do dia sim.", tips:["Seu corpo não 'para' de queimar calorias à noite","O que importa é o balanço calórico do dia todo","Comer à noite pode ser prejudicial SE for em excesso","Evite refeições pesadas perto de dormir por conforto digestivo","A noite, prefira proteínas leves e menos carboidratos"] },
  { id:24, cat:"mitos", title:"Gordura faz mal à saúde?",                body:"Gordura não é o inimigo — gordura trans e excesso de saturada sim.", tips:["Gorduras boas são essenciais (abacate, azeite, peixes)","Gordura trans é a real vilã — evite","Gordura saturada em moderação não é problema para a maioria","Dietas com gordura adequada melhoram hormônios","O problema são calorias totais, não a gordura em si"] },
  { id:25, cat:"mitos", title:"Pular refeições emagrece?",               body:"Pular refeições não acelera o emagrecimento — pode até atrapalhar.", tips:["Pular refeições aumenta fome e risco de compulsão","Não há evidência de que comer menos vezes acelera metabolismo","O que importa é o total calórico do dia","Jejum intermitente funciona, mas por restrição calórica","Faça a quantidade de refeições que funciona para você"] },
  { id:26, cat:"mitos", title:"Jejum é obrigatório para emagrecer?",     body:"Jejum é uma ferramenta eficaz, mas não é obrigatório.", tips:["Jejum intermitente funciona para muitas pessoas","Mas não é superior a outras estratégias com igual déficit","É uma ferramenta, não uma regra","Se não se adapta ao seu estilo de vida, não use","O melhor protocolo é o que você consegue manter"] },
  { id:27, cat:"mitos", title:"Comer de 3 em 3h acelera metabolismo?",   body:"Comer com alta frequência não acelera o metabolismo — é um mito.", tips:["O efeito térmico dos alimentos é proporcional ao total consumido","Não há benefício metabólico comprovado em comer a cada 3h","Coma na quantidade de refeições que te ajuda a controlar a fome","Para alguns, poucas refeições maiores funcionam melhor","O total do dia é o que determina resultado"] },
  { id:28, cat:"mitos", title:"Açúcar mascavo é saudável?",              body:"Açúcar mascavo é levemente menos processado, mas ainda é açúcar.", tips:["Tem os mesmos efeitos metabólicos do açúcar branco","A diferença nutricional é insignificante nas quantidades usadas","Não é um alimento saudável — apenas menos processado","Mel, demerara e mascavo têm efeito similar no sangue","Consuma em pequenas quantidades, independente do tipo"] },
  { id:29, cat:"mitos", title:"Produtos 'fit' realmente ajudam?",        body:"O rótulo 'fit' não é garantia de produto saudável — leia os ingredientes.", tips:["Muitos produtos fit têm alto teor de açúcar ou sódio","'Zero açúcar' pode ter adoçantes em excesso","Barra de proteína pode ter tanta caloria quanto chocolate","Leia a lista de ingredientes — não só o rótulo frontal","Prefira alimentos naturais em vez de versões 'fit' industrializadas"] },
  { id:30, cat:"mitos", title:"Dieta restritiva funciona a longo prazo?",body:"Dietas muito restritivas têm alta taxa de abandono e efeito rebote.", tips:["Quanto mais restritiva, mais difícil de manter","Após dieta restritiva, o metabolismo pode se adaptar","Efeito sanfona é comum em dietas radicais","Mudança gradual e sustentável é mais eficaz","O melhor plano é o que você consegue seguir por anos"] },

  // ── HIDRATAÇÃO ──
  { id:31, cat:"hidratacao", title:"Quanto de água devo beber por dia",  body:"A recomendação geral é de 35ml por kg de peso corporal ao dia.", tips:["Pessoa de 70kg = ~2,5 litros/dia","Aumente em dias de treino ou calor","Urina clara a amarelo-claro = bem hidratado","Urina escura = sinal de alerta para beber mais","Conte a água dos alimentos também"] },
  { id:32, cat:"hidratacao", title:"Água realmente ajuda a emagrecer?",  body:"Água ajuda de forma indireta, mas com impacto real.", tips:["Beber água antes das refeições reduz ingestão calórica","Sede é confundida com fome com frequência","Hidratação adequada melhora metabolismo celular","Água pura não tem calorias — substitua bebidas calóricas","Hidratação melhora performance nos treinos"] },
  { id:33, cat:"hidratacao", title:"Sede já é sinal de desidratação",    body:"Quando você sente sede, já perdeu 1–2% de água — seu desempenho já cai.", tips:["Não espere sentir sede para beber água","Beba em intervalos regulares ao longo do dia","Use uma garrafinha como lembrete visual","Em treinos, beba a cada 15–20 minutos","Ambientes com ar condicionado desidratam mais"] },
  { id:34, cat:"hidratacao", title:"Café desidrata?",                    body:"Café tem efeito diurético leve, mas não causa desidratação em consumo moderado.", tips:["Até 4 xícaras/dia não causa desidratação","O líquido do café conta para hidratação diária","Excesso de cafeína pode aumentar perda de água","Compense com um copo de água para cada café","Café sem açúcar é praticamente caloria zero"] },
  { id:35, cat:"hidratacao", title:"Água com limão emagrece?",           body:"Água com limão não emagrece — mas pode ser parte de hábitos saudáveis.", tips:["Não há evidência de efeito termogênico do limão","Pode melhorar palatabilidade e ajudar a beber mais água","Vitamina C do limão tem outros benefícios (imunidade)","O que emagrece é o déficit calórico, não ingredientes isolados","Use como hábito positivo, não como solução mágica"] },
  { id:36, cat:"hidratacao", title:"Bebidas esportivas são necessárias?", body:"Isotônicos são úteis em treinos longos e intensos — em outros casos, água basta.", tips:["Para treinos de até 1 hora: água é suficiente","Para treinos longos e suados: isotônico pode ajudar","Isotônicos têm calorias e sódio — não são água","Não use como bebida diária fora de treinos","Água de coco é uma alternativa natural"] },
  { id:37, cat:"hidratacao", title:"Hidratação durante o treino",        body:"Manter-se hidratado durante o treino preserva performance e segurança.", tips:["Beba 200–300ml antes do treino","Durante o treino: 150–200ml a cada 15–20 minutos","Após o treino: reponha o que perdeu","Em calor extremo, aumente a ingestão","Não espere sentir sede para beber"] },
  { id:38, cat:"hidratacao", title:"Hidratação no calor e verão",        body:"No calor, a perda de água pelo suor aumenta muito — a hidratação precisa ser maior.", tips:["Aumente em pelo menos 500ml nos dias de calor","Suor intenso pode exigir até 3–4 litros/dia","Cuidado com hiponatremia (excesso de água sem sódio)","Frutas com água (melancia, pepino) ajudam na hidratação","Fique de olho na cor da urina"] },
  { id:39, cat:"hidratacao", title:"Como saber se está bem hidratado",   body:"A cor da urina é o indicador mais simples e confiável de hidratação.", tips:["Amarelo claro = hidratado","Amarelo escuro ou laranja = beba mais água","Incolor = bem hidratado (ou superidratado)","Vermelha ou rosa = procure um médico","Monitore especialmente após treinos intensos"] },
  { id:40, cat:"hidratacao", title:"Hidratação e desempenho físico",     body:"Desidratação de apenas 2% já reduz o desempenho físico significativamente.", tips:["Redução de força, velocidade e resistência","Pensamento mais lento e concentração prejudicada","A recuperação muscular é mais lenta","Hidratação pré-treino é tão importante quanto pós","Pesquisa: atletas desidratados queimam mais energia para mesmo resultado"] },

  // ── COMPORTAMENTO ──
  { id:41, cat:"comportamento", title:"Por que comemos por emoção",      body:"Comer por emoção é um mecanismo de regulação emocional aprendido.", tips:["Identifique se é fome física ou emocional","Fome emocional é repentina e por alimentos específicos","Antes de comer, pergunte: estou com fome ou estressado?","Busque outras formas de regular emoção (caminhar, respirar)","Não se puna por episódios eventuais"] },
  { id:42, cat:"comportamento", title:"Como evitar compulsão alimentar", body:"Compulsão é frequentemente resultado de privação extrema ou gatilhos emocionais.", tips:["Evite restrição severa — ela aumenta o desejo","Mantenha horários regulares de refeição","Não tenha alimentos 'proibidos' — apenas em moderação","Se sentir compulsão, busque apoio profissional","Comer consciente reduz episódios compulsivos"] },
  { id:43, cat:"comportamento", title:"Comer com atenção plena",         body:"Mindful eating é comer com consciência e sem distrações — e muda resultados.", tips:["Desligue o celular e TV durante as refeições","Mastigue devagar e saboreie cada mordida","Preste atenção aos sinais de saciedade","Comer com pressa leva à ingestão excessiva","5 minutos de atenção plena por refeição já faz diferença"] },
  { id:44, cat:"comportamento", title:"Como identificar fome real",      body:"Distinguir fome física de emocional é uma habilidade que pode ser treinada.", tips:["Fome física: gradual, pode esperar, qualquer alimento serve","Fome emocional: repentina, urgente, por algo específico","Beba um copo de água e espere 10 minutos","Se a fome passou, era emocional","Faça um diário de quando e por que come"] },
  { id:45, cat:"comportamento", title:"Como reduzir ansiedade alimentar", body:"Ansiedade por comida é comum e pode ser manejada com hábitos simples.", tips:["Planejamento alimentar reduz ansiedade sobre o que comer","Inclua alimentos que gosta no seu plano","Não trate nenhum alimento como proibido","Exercício físico reduz ansiedade geral","Conversa com nutricionista pode transformar o relacionamento com comida"] },
  { id:46, cat:"comportamento", title:"Como manter consistência na dieta",body:"Consistência supera perfeição — dias imperfeitos fazem parte da jornada.", tips:["80% de consistência gera resultados duradouros","Um dia ruim não desfaz semanas de dedicação","Crie um plano realista, não perfeito","Use o aplicativo para visualizar seu progresso","Comemore as pequenas vitórias diárias"] },
  { id:47, cat:"comportamento", title:"Como evitar o efeito sanfona",    body:"O efeito sanfona acontece quando a perda de peso é rápida demais e insustentável.", tips:["Perca peso devagar: 0,5–1kg/semana no máximo","Não faça dieta — mude o estilo de vida","Inclua treino de força para preservar músculo","Mantenha os hábitos mesmo após atingir o peso","O objetivo é manter para sempre, não só emagrecer"] },
  { id:48, cat:"comportamento", title:"Como lidar com recaídas",         body:"Recaídas são parte do processo — o que importa é como você responde a elas.", tips:["Uma recaída não é fracasso, é aprendizado","Analise o que a causou sem se julgar","Retome os hábitos na próxima refeição, não no próximo dia","Ajuste a estratégia se a mesma recaída se repete","Autocompaixão é mais eficaz que autopunição"] },
  { id:49, cat:"comportamento", title:"Como manter disciplina a longo prazo", body:"Disciplina não é força de vontade — é sistema, ambiente e hábitos.", tips:["Prepare refeições com antecedência (meal prep)","Remova tentações do ambiente doméstico","Associe hábitos saudáveis a recompensas positivas","Encontre um parceiro de accountability","A disciplina vem com a consistência, não o contrário"] },
  { id:50, cat:"comportamento", title:"Como criar hábitos saudáveis duradouros", body:"Hábitos se formam por repetição — pequenas ações diárias criam grandes transformações.", tips:["Comece com um hábito pequeno e faça por 30 dias","Associe ao hábito existente (ancoragem)","Celebre cada dia de execução","Use o app para rastrear a sequência","Após 60 dias, o hábito se torna automático"] },

  // ── TREINO ──
  { id:51, cat:"treino", title:"Quanto tempo devo treinar por sessão",   body:"A duração ideal varia com objetivo, mas qualidade supera quantidade.", tips:["30–60 minutos é suficiente para a maioria","Mais de 90 minutos pode aumentar cortisol","Treinos curtos e intensos são altamente eficazes","O que importa é consistência ao longo de semanas","Não existe treino 'muito curto' se for feito com qualidade"] },
  { id:52, cat:"treino", title:"Descanso entre treinos: quanto é ideal", body:"Descanso é quando o músculo cresce — ignorá-lo prejudica o resultado.", tips:["Músculo treinado precisa de 48–72h para recuperar","Iniciantes devem descansar mais entre as sessões","Sono de qualidade é o melhor recuperador","Dor muscular intensa = mais descanso necessário","Active recovery (caminhada leve) acelera recuperação"] },
  { id:53, cat:"treino", title:"Treinar todo dia é uma boa ideia?",      body:"Treinar 7 dias por semana não é ideal para a maioria — o descanso faz parte do processo.", tips:["Overtraining reduz performance e aumenta risco de lesão","4–5 dias por semana é suficiente para a maioria","Nos dias de descanso, faça atividades leves","Sinais de overtraining: fadiga, humor irritado, performance caindo","Periodize seu treino com ciclos de carga e descanso"] },
  { id:54, cat:"treino", title:"Dor muscular após treino: normal?",      body:"Dor muscular de início tardio (DOMS) é normal — dor intensa pode ser lesão.", tips:["DOMS: dor que aparece 12–48h após treino é normal","É causada por microlesões que levam ao crescimento","Não indica que o treino foi 'bom ou ruim'","Dor aguda durante o treino = pare e avalie","Hidratação e proteína ajudam na recuperação"] },
  { id:55, cat:"treino", title:"Como evitar lesões nos treinos",         body:"A maioria das lesões é prevenível com técnica correta e progressão gradual.", tips:["Aprenda a técnica antes de aumentar carga","Aqueça sempre antes de treinar","Progrida gradualmente: mais peso, mais repetições","Ouça seu corpo — dor é sinal de alerta","Alongamento após treino reduz tensão muscular"] },
  { id:56, cat:"treino", title:"Importância do aquecimento antes do treino", body:"O aquecimento prepara músculos e articulações, reduzindo lesões e melhorando performance.", tips:["5–10 minutos de aquecimento geral (caminhada, bicicleta)","Mobilidade articular específica para o treino do dia","Aquecimento específico: movimentos do exercício com carga leve","Não pule o aquecimento mesmo em dias de pressa","Aquecimento mental: concentre-se no treino que vem"] },
  { id:57, cat:"treino", title:"Importância do sono para o treino",      body:"Sono é quando o corpo se recupera, hormonios se equilibram e músculos crescem.", tips:["7–9 horas de sono por noite é ideal para atletas","GH (hormônio do crescimento) é liberado durante o sono","Privação de sono reduz performance em até 30%","Crie uma rotina de sono regular (mesmo horário)","Evite telas 1 hora antes de dormir"] },
  { id:58, cat:"treino", title:"Treinar em jejum funciona?",             body:"Treinar em jejum pode funcionar para alguns, mas não é obrigatório.", tips:["Não prejudica ganho muscular se a dieta for adequada no dia","Pode melhorar oxidação de gordura em treinos leves","Para treinos intensos, pode reduzir performance","Escute seu corpo — se sentir fraqueza, coma algo","Não é superior ao treino com alimentação quando calorias são iguais"] },
  { id:59, cat:"treino", title:"Treino curto realmente funciona?",       body:"Treinos de 20–30 minutos com intensidade adequada geram excelentes resultados.", tips:["HIIT de 20 min pode superar cardio moderado de 45 min","Treino de força curto e focado é altamente eficaz","A intensidade compensa a duração reduzida","Melhor treino curto feito do que treino longo não feito","Consistência > perfeição"] },
  { id:60, cat:"treino", title:"Como saber se o treino está funcionando", body:"Resultados de treino aparecem em diferentes formas — saiba identificá-los.", tips:["Aumento de força: mais peso ou repetições ao longo das semanas","Melhora de resistência: menos cansaço no mesmo esforço","Mudança corporal: fotos mensais são mais confiáveis que balança","Humor e energia melhoram com treino regular","Resultados visíveis levam de 4 a 12 semanas — seja paciente"] },

  // ── GORDURA ──
  { id:61, cat:"gordura", title:"Como o corpo queima gordura",           body:"O corpo usa gordura como energia quando há déficit calórico — não existe 'queima localizada'.", tips:["Você não pode escolher de onde queimar gordura","Déficit calórico é a única forma de perder gordura","Treino aumenta o gasto total e preserva músculo","O corpo queima gordura 24h/dia, não só durante o treino","Tudo que cabe no déficit calórico contribui"] },
  { id:62, cat:"gordura", title:"Cardio é obrigatório para emagrecer?",  body:"Cardio ajuda, mas não é obrigatório — o déficit calórico é o que importa.", tips:["Cardio aumenta o gasto calórico — facilita o déficit","Treino de força também queima calorias e preserva músculo","Você pode emagrecer sem nenhum exercício (só com dieta)","O melhor exercício é o que você faz consistentemente","Combine força + cardio para melhor resultado"] },
  { id:63, cat:"gordura", title:"Treino de força ajuda a emagrecer?",    body:"Treino de força é um dos melhores aliados do emagrecimento.", tips:["Constrói músculo, que aumenta metabolismo em repouso","O efeito metabólico pós-treino dura até 24–48h","Preserva massa magra durante a perda de peso","Muda a composição corporal, não só o número na balança","Combine com dieta adequada para melhores resultados"] },
  { id:64, cat:"gordura", title:"O que realmente queima gordura",        body:"A ciência é clara: déficit calórico é o que queima gordura.", tips:["Não existe alimento que queima gordura diretamente","Thermogenics têm efeito mínimo e temporário","Exercício físico regular aumenta o gasto calórico","Sono inadequado dificulta a queima de gordura","Estresse crônico (cortisol alto) dificulta emagrecimento"] },
  { id:65, cat:"gordura", title:"Como acelerar o metabolismo",           body:"Não existe atalho, mas hábitos simples otimizam o metabolismo.", tips:["Treino de força aumenta metabolismo basal a longo prazo","Proteína tem maior efeito térmico dos alimentos","Não faça restrições calóricas muito severas","Sono adequado regula hormônios metabólicos","Consistência no longo prazo é a melhor estratégia"] },
  { id:66, cat:"gordura", title:"Importância da massa muscular",         body:"Músculo é o motor metabólico do corpo — mais músculo = mais calorias queimadas em repouso.", tips:["1kg de músculo queima ~13 kcal/dia em repouso","Mais músculo = mais flexibilidade alimentar","Preserva mobilidade e qualidade de vida na velhice","Treino de força é o único jeito de ganhar músculo","Proteína adequada é obrigatória para manter músculo"] },
  { id:67, cat:"gordura", title:"Como evitar perda muscular ao emagrecer", body:"Emagrecer sem perder músculo é possível com as estratégias certas.", tips:["Consuma proteína suficiente: mínimo 1,6g/kg","Mantenha o treino de força durante a dieta","Déficit calórico moderado (não radical)","Durma bem — cortisol alto destrói músculo","Não elimine carboidratos — eles preservam massa muscular"] },
  { id:68, cat:"gordura", title:"O que sabota o emagrecimento",          body:"Muitas pessoas fazem tudo 'certo' mas ignoram fatores que bloqueiam o progresso.", tips:["Estresse crônico eleva cortisol e dificulta emagrecimento","Sono ruim desregula grelina e leptina (hormônios da fome)","Subestimar calorias de bebidas (álcool, sucos)","Condicionar recompensas alimentares ao exercício","Falta de consistência — não é o que faz 2 dias, é o que faz 365"] },
  { id:69, cat:"gordura", title:"Erros comuns ao tentar emagrecer",      body:"Erros frequentes atrasam resultados e podem desmotivar — aprenda a evitá-los.", tips:["Fazer cardio excessivo e não treinar força","Comer muito pouco — dificulta manutenção e perde músculo","Focar demais na balança — fotos e medidas são melhores","Esperar resultados rápidos — emagrecimento leva tempo","Parar completamente após um dia ruim"] },
  { id:70, cat:"gordura", title:"Quanto tempo leva para ver resultado",  body:"Resultados reais e duradouros são mais lentos — e isso é sinal de qualidade.", tips:["1–2kg/mês é emagrecimento saudável e sustentável","Resultados visíveis: 4–8 semanas de consistência","Composição corporal muda antes do peso na balança","Fotos mensais revelam mudanças que a balança esconde","Paciência não é fraqueza — é estratégia"] },

  // ── DIA A DIA ──
  { id:71, cat:"diaadia", title:"Como manter dieta no trabalho",         body:"O ambiente de trabalho sabota muitas dietas — com planejamento, dá para contornar.", tips:["Leve sua própria comida de casa (meal prep)","Tenha lanches saudáveis na gaveta","Beba água ao longo do dia para evitar fome emocional","Evite reuniões de 'bolo e pizza' automáticas","Marque suas refeições no aplicativo durante o trabalho"] },
  { id:72, cat:"diaadia", title:"Como manter dieta em viagens",          body:"Viajar não precisa destruir a dieta — com pequenas estratégias, você mantém o rumo.", tips:["Pesquise restaurantes saudáveis no destino","Carregue snacks proteicos (castanhas, barra de proteína)","Priorize pratos com proteína + legumes","Mantenha hidratação — avião desidrata muito","Uma refeição fora do plano não desfaz o progresso"] },
  { id:73, cat:"diaadia", title:"Como manter dieta em festas e eventos", body:"Festas são desafios, mas não precisam ser sabotagem total.", tips:["Coma uma refeição proteica antes de ir","Na fila do buffet, monte o prato primeiro com proteína","Prefira um prato completo a beliscar sem parar","Limite o álcool — ele tem calorias e reduz inibições","Divirta-se sem culpa — um evento não muda o resultado"] },
  { id:74, cat:"diaadia", title:"Como equilibrar vida social e dieta",   body:"Dieta e vida social não são opostos — é possível ter os dois.", tips:["Inclua refeições especiais no plano semanalmente","80% de consistência é suficiente para resultados","Não se isole socialmente por causa da dieta","Aprenda a fazer escolhas melhores em qualquer ambiente","Compartilhe seus objetivos com pessoas próximas"] },
  { id:75, cat:"diaadia", title:"Como planejar refeições com antecedência", body:"Meal prep é uma das ferramentas mais poderosas para consistência alimentar.", tips:["Reserve 1–2 horas no domingo para preparar","Cozinhe proteínas em lote (frango, ovo, carne)","Pré-corte vegetais e guarde em potes","Separe refeições em marmitas individuais","Planejamento elimina decisões ruins por impulso"] },
  { id:76, cat:"diaadia", title:"Como organizar alimentação semanal",    body:"Uma semana bem planejada é uma semana de sucesso na dieta.", tips:["Crie um cardápio semanal fixo e rotacione","Faça compras de acordo com o cardápio planejado","Use a regra dos pratos: proteína + legume + carboidrato","Tenha sempre um plano B rápido (ovo mexido, atum)","Use o aplicativo para registrar e manter o histórico"] },
  { id:77, cat:"diaadia", title:"Como manter motivação a longo prazo",   body:"Motivação varia — hábito e sistema são mais confiáveis.", tips:["Defina um 'porquê' poderoso além de estética","Acompanhe o progresso visualmente (fotos, gráficos)","Celebre cada semana de consistência","Conecte-se a uma comunidade de objetivos similares","Motivação vem depois da ação, não antes"] },
  { id:78, cat:"diaadia", title:"Como medir progresso de forma inteligente", body:"A balança é apenas um dos muitos indicadores de progresso.", tips:["Tire fotos mensais no mesmo horário e condição","Meça cintura, quadril e braços mensalmente","Monitore performance no treino (mais força = progresso)","Observe como as roupas ficam","Bem-estar, energia e humor também são resultados"] },
  { id:79, cat:"diaadia", title:"Peso na balança é tudo?",               body:"A balança é apenas uma ferramenta — ela não conta a história completa.", tips:["Peso varia até 2kg no mesmo dia por água e alimentos","Pode estar perdendo gordura e ganhando músculo sem mudar o peso","Período menstrual altera retenção de líquidos","Foque em tendência ao longo de semanas, não dias","Composição corporal importa mais que número no peso"] },
  { id:80, cat:"diaadia", title:"Dicas para manter consistência",        body:"Consistência é o único fator que separa quem transforma o corpo de quem não transforma.", tips:["Torne os hábitos o mais simples possível","Prepare o ambiente para facilitar boas escolhas","Crie rituais diários (checklist no app, por exemplo)","Aprenda com os dias ruins em vez de desistir","A consistência de 1 ano supera qualquer dieta milagrosa"] },

  // ── RÁPIDAS ──
  { id:81, cat:"rapidas", title:"Quantas calorias devo comer por dia",   body:"A quantidade ideal depende do seu peso, altura, idade, sexo e objetivo.", tips:["Fórmula base: peso(kg) × 30–35 para manutenção","Para emagrecer: reduza 300–500 kcal desse valor","Para ganhar massa: adicione 200–300 kcal","Use o perfil do app para calcular automaticamente","Ajuste conforme resultado nas primeiras 2–3 semanas"] },
  { id:82, cat:"rapidas", title:"Quantos litros de água devo beber",     body:"35ml por kg de peso corporal é uma referência confiável.", tips:["70kg → ~2,5 litros/dia","Aumente em 500ml por hora de treino","No calor intenso, aumente mais","Urina clara = você está no ponto","Garrafinha de 750ml: encha e beba 3–4x ao dia"] },
  { id:83, cat:"rapidas", title:"Quantas refeições devo fazer por dia",  body:"Não há número mágico — o que funciona para o seu estilo de vida é o certo.", tips:["2 a 6 refeições funcionam igualmente bem","O que importa é o total diário, não a frequência","Para controle de fome, mais refeições menores podem ajudar","Para praticidade, menos refeições maiores são válidas","Experimente e ajuste ao que funciona para você"] },
  { id:84, cat:"rapidas", title:"Preciso contar calorias?",              body:"Contar calorias é útil para aprendizado, mas não é obrigatório para sempre.", tips:["Contar por 2–4 semanas cria percepção das porções","Depois, estimativas visuais funcionam para muita gente","Apps facilitam contagem se quiser continuar","Para objetivos específicos (competições), contar ajuda mais","O objetivo é criar consciência, não obsessão"] },
  { id:85, cat:"rapidas", title:"Whey protein é necessário?",            body:"Whey é uma fonte prática de proteína, não um suplemento obrigatório.", tips:["Whey é apenas proteína de leite em pó","Se você atinge a meta de proteína com comida, não precisa","É conveniente pós-treino quando não quer cozinhar","Alimentos naturais têm mais micronutrientes","Se o bolso apertar, invista em frango e ovos primeiro"] },
  { id:86, cat:"rapidas", title:"Suplementos são obrigatórios?",         body:"Suplementos suplementam uma boa dieta — não substituem.", tips:["Nenhum suplemento é obrigatório para saúde","Creatina é o mais evidenciado para força e músculo","Vitamina D e ômega-3 são os mais comuns por deficiência real","Whey, BCAA e pré-treino: conveniência, não necessidade","Invista em comida de qualidade antes de qualquer suplemento"] },
  { id:87, cat:"rapidas", title:"Treinar à noite prejudica o sono?",     body:"Para a maioria das pessoas, treinar à noite não prejudica o sono.", tips:["Estudos recentes mostram que não prejudica para a maioria","Alguns são mais sensíveis — observe como você responde","Treino de alta intensidade muito próximo de dormir pode ativar","Encerre treinos pelo menos 1 hora antes de dormir se tiver insônia","Se noite é o único horário, treine — é melhor do que não treinar"] },
  { id:88, cat:"rapidas", title:"Quantos dias por semana devo treinar",  body:"3–5 dias por semana é o ideal para a maioria das pessoas.", tips:["Iniciantes: 3 dias é suficiente e seguro","Intermediários: 4–5 dias com divisão adequada","Avançados: 5–6 dias com periodização","Menos dias, mais qualidade por sessão","O melhor plano é o que você cumpre consistentemente"] },
  { id:89, cat:"rapidas", title:"Caminhada ajuda a emagrecer?",          body:"Caminhada é uma das ferramentas mais subestimadas para emagrecimento.", tips:["10.000 passos/dia = ~300–400 kcal a mais gasto","Baixo impacto: protege articulações e é sustentável","Após refeições: melhora glicemia e digestão","Caminhada + dieta = resultados consistentes","É um exercício que qualquer pessoa pode começar hoje"] },
  { id:90, cat:"rapidas", title:"Abdominal queima gordura na barriga?",  body:"Exercício localizado não queima gordura localizada — é um mito.", tips:["Não existe redução localizada de gordura comprovada","Abdominais fortalecem o core, não queimam barriga","Gordura é perdida de forma sistêmica pelo corpo inteiro","O déficit calórico é o que remove a gordura abdominal","Fortaleça o core por saúde postural, não para queimar barriga"] },
];

// ─── COMPONENTE ───────────────────────────────────────────────────────────────

export default function LearningCards() {
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState(null);
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    let list = TIPS;
    if (activeCat) list = list.filter(t => t.cat === activeCat);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(t => t.title.toLowerCase().includes(q) || t.body.toLowerCase().includes(q) || CATEGORIES.find(c => c.id === t.cat)?.label.toLowerCase().includes(q));
    }
    return list;
  }, [activeCat, search]);

  const activeCatData = activeCat ? CATEGORIES.find(c => c.id === activeCat) : null;

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "rgba(206,241,123,0.15)" }}>
          <BookOpen className="w-5 h-5 text-[#CEF17B]" />
        </div>
        <div>
          <h2 className="text-lg font-black text-white">Biblioteca de Conhecimento</h2>
          <p className="text-xs text-white/40">{TIPS.length} conteúdos · 9 categorias</p>
        </div>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar conteúdo... ex: proteína, água, treino"
          className="w-full h-12 pl-10 pr-10 rounded-2xl text-sm text-white placeholder-white/30 outline-none"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3.5 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-white/40" />
          </button>
        )}
      </div>

      {/* Categorias */}
      {!search && (
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map(cat => {
            const count = TIPS.filter(t => t.cat === cat.id).length;
            const isActive = activeCat === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCat(isActive ? null : cat.id)}
                className="rounded-2xl p-3 text-left transition-all active:scale-95"
                style={{
                  background: isActive ? cat.bg : "rgba(255,255,255,0.04)",
                  border: `1px solid ${isActive ? cat.color + "40" : "rgba(255,255,255,0.08)"}`,
                }}
              >
                <div className="text-xl mb-1">{cat.emoji}</div>
                <div className="text-xs font-bold text-white leading-tight">{cat.label}</div>
                <div className="text-[10px] mt-0.5" style={{ color: isActive ? cat.color : "rgba(255,255,255,0.3)" }}>{count} itens</div>
              </button>
            );
          })}
        </div>
      )}

      {/* Filtro ativo */}
      {(activeCat || search) && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/60">
            {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
            {activeCatData ? ` em ${activeCatData.label}` : ""}
            {search ? ` para "${search}"` : ""}
          </span>
          <button
            onClick={() => { setActiveCat(null); setSearch(""); }}
            className="text-xs px-3 py-1 rounded-full"
            style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}
          >
            Limpar
          </button>
        </div>
      )}

      {/* Lista */}
      <div className="space-y-2">
        {filtered.length === 0 && (
          <div className="py-12 text-center text-white/30 text-sm">
            <div className="text-3xl mb-2">🔍</div>
            Nenhum conteúdo encontrado.
          </div>
        )}
        {filtered.map(tip => {
          const catData = CATEGORIES.find(c => c.id === tip.cat);
          return (
            <motion.button
              key={tip.id}
              onClick={() => setSelected(tip)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full text-left rounded-2xl p-4 flex items-center gap-3 transition-all active:scale-[0.98]"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg" style={{ background: catData?.bg || "rgba(255,255,255,0.08)" }}>
                {catData?.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{tip.title}</p>
                <p className="text-xs mt-0.5" style={{ color: catData?.color || "rgba(255,255,255,0.4)" }}>{catData?.label}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-white/20 flex-shrink-0" />
            </motion.button>
          );
        })}
      </div>

      {/* Modal de conteúdo */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key="modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-end justify-center z-50 px-4 pb-4"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="w-full max-w-lg rounded-3xl p-6 space-y-5"
              style={{ background: "#0F2420", border: "1px solid rgba(206,241,123,0.15)", maxHeight: "80vh", overflowY: "auto" }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal header */}
              {(() => {
                const catData = CATEGORIES.find(c => c.id === selected.cat);
                return (
                  <>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: catData?.bg }}>
                          {catData?.emoji}
                        </div>
                        <div>
                          <p className="text-xs font-semibold mb-1" style={{ color: catData?.color }}>{catData?.label}</p>
                          <h3 className="text-base font-black text-white leading-tight">{selected.title}</h3>
                        </div>
                      </div>
                      <button onClick={() => setSelected(null)} className="ml-3 flex-shrink-0">
                        <X className="w-5 h-5 text-white/40" />
                      </button>
                    </div>

                    {/* Corpo */}
                    <p className="text-sm text-white/60 leading-relaxed">{selected.body}</p>

                    {/* Dicas */}
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-white/40 uppercase tracking-wider">Dicas práticas</p>
                      {selected.tips.map((tip, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5" style={{ background: catData?.color, color: "#fff" }}>
                            {i + 1}
                          </div>
                          <p className="text-sm text-white/80 leading-relaxed">{tip}</p>
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="pt-2 pb-1 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                      <p className="text-xs text-white/30 text-center">💡 Aplique uma dica por vez para resultados duradouros</p>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}