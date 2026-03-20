import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_KEY');
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const source = {
  'Hidratação': ['Beber 2L de água por 7 dias','Beber 500ml ao acordar por 5 dias','3L por dia durante 3 dias','7 dias sem refrigerante','5 dias bebendo água a cada 2h','10 dias mantendo 2L/dia','3 dias sem bebidas açucaradas','Beber água antes de refeições por 7 dias','14 dias de hidratação consistente','5 dias com controle de consumo','7 dias bebendo água ao acordar','3 dias com 3L/dia','10 dias sem álcool','7 dias com lembretes ativos','30 dias com mínimo de 2L','Substituir suco por água por 5 dias','7 dias com meta personalizada','14 dias consistentes','3 dias com 4L','21 dias criando hábito','7 dias sem bebidas industrializadas','5 dias bebendo água antes do treino','10 dias com hidratação perfeita','14 dias sem falhar meta','7 dias monitorando ingestão','3 dias hidratando-se corretamente','21 dias sem esquecer água','5 dias bebendo 2,5L','7 dias mantendo constância','30 dias de hidratação completa'],
  'Treino': ['Treinar 3 dias na semana','7 dias de atividade leve','5 treinos em 7 dias','30 min por dia (5 dias)','10 dias sem faltar treino','3 dias treino intenso','7 dias caminhada','14 dias ativos','20 treinos em 30 dias','Treinar 2x ao dia (3 dias)','5 dias treino funcional','7 dias sem sedentarismo','3 dias cardio','10 dias 10k passos','7 dias alongamento','30 dias treino consistente','5 dias academia','7 dias treino em casa','14 dias disciplina','21 dias hábito','3 dias HIIT','5 dias treino manhã','7 dias treino noite','10 dias sem preguiça','15 dias movimento','7 dias corrida leve','5 dias treino completo','10 dias foco físico','14 dias evolução física','30 dias constância'],
  'Saúde Mental': ['Meditar 5 min por 7 dias','3 dias sem redes sociais','7 dias dormindo 8h','5 dias journaling','10 dias sem estresse','7 dias respiração','14 dias mente saudável','3 dias offline','7 dias sem celular ao acordar','5 dias gratidão','10 dias pensamento positivo','7 dias leitura','21 dias autocuidado','3 dias sem ansiedade digital','7 dias foco no presente','5 dias silêncio matinal','14 dias rotina leve','7 dias pausas mentais','10 dias controle emocional','30 dias evolução mental','7 dias sem negatividade','5 dias relaxamento','10 dias foco mental','14 dias equilíbrio emocional','7 dias mindfulness','3 dias detox digital','21 dias mente forte','5 dias autocontrole','10 dias calma diária','30 dias disciplina mental'],
  'Disciplina': ['Acordar cedo 7 dias','5 dias sem procrastinar','10 dias metas cumpridas','7 dias sem faltar compromisso','3 dias foco total','14 dias rotina fixa','5 dias sem distrações','7 dias checklist','10 dias pontualidade','3 dias produtividade extrema','21 dias disciplina','7 dias rotina manhã','5 dias planejamento','10 dias sem desculpas','7 dias execução total','3 dias deep work','14 dias consistência','5 dias foco metas','30 dias disciplina total','7 dias organização','10 dias produtividade','5 dias foco absoluto','14 dias sem falhas','3 dias disciplina extrema','7 dias rotina estruturada','10 dias hábitos fortes','5 dias foco total','14 dias evolução disciplina','21 dias rotina firme','30 dias consistência'],
  'Nutrição': ['Comer saudável 5 dias','7 dias sem fast food','3 dias sem açúcar','10 dias dieta equilibrada','5 dias café saudável','7 dias sem ultraprocessados','14 dias alimentação limpa','3 dias detox','7 dias frutas','5 dias vegetais','10 dias controle alimentar','7 dias alimentação limpa','3 dias sem junk food','21 dias alimentação consciente','5 dias proteína adequada','7 dias refeições balanceadas','10 dias sem açúcar refinado','14 dias foco saúde','30 dias evolução alimentar','7 dias disciplina alimentar','5 dias dieta controlada','10 dias sem exagero','7 dias alimentação natural','3 dias dieta limpa','21 dias hábitos saudáveis','5 dias comida saudável','10 dias foco alimentação','14 dias controle alimentar','7 dias dieta correta','30 dias nutrição ideal'],
  'Consistência': ['3 dias seguidos sem falhar','5 dias consistentes','7 dias de hábito contínuo','10 dias sem interrupção','14 dias mantendo rotina','21 dias consistência total','30 dias sem falhar','7 dias foco total','5 dias rotina firme','10 dias disciplina contínua','14 dias hábito forte','21 dias execução perfeita','30 dias constância','7 dias sequência ativa','5 dias hábito sólido','10 dias consistência mental','14 dias execução contínua','21 dias disciplina total','30 dias rotina perfeita','7 dias compromisso total','5 dias foco diário','10 dias sem parar','14 dias sem desistir','21 dias evolução constante','30 dias alta performance','7 dias sequência perfeita','5 dias foco contínuo','10 dias sem falhar','14 dias constância máxima','30 dias disciplina extrema']
};

function extractDurationDays(title) {
  const match = title.match(/(\d+)\s*(dias?|min)/i);
  if (match) return Number(match[1]);
  if (/na semana/i.test(title)) return 7;
  if (/em 30 dias/i.test(title)) return 30;
  return 7;
}

function buildChallenge(category, title) {
  const durationDays = extractDurationDays(title);
  const difficulty = durationDays >= 21 ? 'hard' : durationDays >= 10 ? 'medium' : 'easy';
  const xpPerDay = difficulty === 'hard' ? 40 : difficulty === 'medium' ? 20 : 10;
  const xpCompletionBonus = Math.round(durationDays * xpPerDay * 0.5);
  return {
    title,
    description: `Desafio de ${category.toLowerCase()} com foco em constância diária.`,
    category,
    difficulty,
    duration_days: durationDays,
    xp_per_day: xpPerDay,
    xp_completion_bonus: xpCompletionBonus,
    is_daily: true,
    repeatable: true,
    nome_desafio: title,
    descricao: `Desafio de ${category.toLowerCase()} com foco em constância diária.`,
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
    if (toInsert.length > 0) await supabase.from('challenges').insert(toInsert);

    return Response.json({ success: true, inserted: toInsert.length, total: rows.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});