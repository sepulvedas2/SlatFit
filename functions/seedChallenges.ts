import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_KEY');
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const source = {
  'Hidratação': ['Beber 2L de água por 7 dias','Beber 500ml ao acordar por 5 dias','3L por dia durante 3 dias','7 dias sem refrigerante','5 dias bebendo água a cada 2h','10 dias mantendo 2L/dia','3 dias sem bebidas açucaradas','Beber 1 copo antes de cada refeição (7 dias)','14 dias com meta diária de hidratação','5 dias usando garrafa de controle','7 dias bebendo água antes do café','3 dias com 3L/dia','10 dias sem álcool','7 dias com lembrete de água ativo','30 dias com mínimo de 2L','5 dias bebendo água ao invés de suco','7 dias com meta personalizada','14 dias mantendo consistência','3 dias com 4L (nível avançado)','21 dias criando hábito de hidratação'],
  'Treino': ['Treinar 3 dias na semana','7 dias seguidos de atividade física leve','5 treinos em 7 dias','30 minutos por dia (5 dias)','10 dias sem faltar treino','3 dias de treino intenso','7 dias com caminhada diária','14 dias ativos','20 treinos em 30 dias','Treinar 2x ao dia (3 dias)','5 dias de treino funcional','7 dias sem sedentarismo','3 dias de cardio','10 dias com 10k passos','7 dias com alongamento diário','30 dias com treino consistente','5 dias de academia','7 dias de treino em casa','14 dias com disciplina','21 dias criando hábito','3 dias de HIIT','5 dias com treino matinal','7 dias com treino noturno','10 dias superando preguiça','15 dias com meta de movimento'],
  'Mentalidade': ['Meditar 5 minutos por 7 dias','3 dias sem redes sociais','7 dias dormindo 8h','5 dias de journaling','10 dias sem estresse excessivo (autoavaliação)','7 dias com respiração consciente','14 dias cuidando da mente','3 dias offline à noite','7 dias acordando sem celular','5 dias praticando gratidão','10 dias evitando negatividade','7 dias lendo 10 min','21 dias de autocuidado','3 dias sem ansiedade digital','7 dias focando no presente','5 dias de silêncio matinal','14 dias com rotina leve','7 dias com pausa mental','10 dias com mindset positivo','30 dias de evolução mental'],
  'Disciplina': ['Acordar no mesmo horário por 7 dias','5 dias sem procrastinar','10 dias cumprindo metas','7 dias sem faltar compromisso','3 dias de foco total','14 dias com rotina fixa','5 dias sem distrações','7 dias com checklist diário','10 dias sem atrasos','3 dias de produtividade extrema','21 dias criando disciplina','7 dias com rotina matinal','5 dias com planejamento','10 dias sem desculpas','7 dias de execução total','3 dias deep work','14 dias sem falhar','5 dias focado em metas','30 dias de consistência','7 dias com meta diária cumprida'],
  'Saúde': ['Comer saudável por 5 dias','7 dias sem fast food','3 dias sem açúcar','10 dias equilibrando alimentação','5 dias com café da manhã saudável','7 dias sem ultraprocessados','14 dias com dieta equilibrada','3 dias detox leve','7 dias com frutas diárias','5 dias com vegetais','10 dias sem exageros','7 dias com alimentação limpa','3 dias sem junk food','21 dias de alimentação consciente','5 dias com proteína adequada','7 dias com refeições balanceadas','10 dias sem açúcar refinado','14 dias com foco em saúde','30 dias de evolução alimentar','7 dias com disciplina alimentar']
};

function extractDurationDays(title) {
  const match = title.match(/(\d+)\s*dias?/i);
  if (match) return Number(match[1]);
  if (/na semana/i.test(title)) return 7;
  if (/em 30 dias/i.test(title)) return 30;
  return 7;
}

function buildChallenge(category, title) {
  const durationDays = extractDurationDays(title);
  const lower = title.toLowerCase();
  const difficulty = lower.includes('avançado') || durationDays >= 21 ? 'hard' : durationDays >= 10 ? 'medium' : 'easy';
  const xpPerDay = difficulty === 'hard' ? 40 : difficulty === 'medium' ? 20 : 10;
  const xpCompletionBonus = Math.round(durationDays * xpPerDay * 0.5);

  return {
    title,
    description: `Desafio de ${category.toLowerCase()} com foco em consistência diária.`,
    category,
    difficulty,
    duration_days: durationDays,
    xp_per_day: xpPerDay,
    xp_completion_bonus: xpCompletionBonus,
    is_daily: true,
    repeatable: true,
    nome_desafio: title,
    descricao: `Desafio de ${category.toLowerCase()} com foco em consistência diária.`,
    xp_recompensa: xpCompletionBonus,
    duracao_dias: durationDays,
    is_active: true,
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const rows = Object.entries(source).flatMap(([category, titles]) => titles.map((title) => buildChallenge(category, title)));
    const { data: existing } = await supabase.from('challenges').select('title');
    const existingTitles = new Set((existing || []).map((item) => item.title));
    const toInsert = rows.filter((row) => !existingTitles.has(row.title));

    if (toInsert.length > 0) {
      await supabase.from('challenges').insert(toInsert);
    }

    return Response.json({ success: true, inserted: toInsert.length, total: rows.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});