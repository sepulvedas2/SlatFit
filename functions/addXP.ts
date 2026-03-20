import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_KEY');
const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { amount, source, reference_id } = await req.json();
    const xpAmount = Number(amount || 0);
    if (!xpAmount) return Response.json({ error: 'amount é obrigatório' }, { status: 400 });

    const { data: rows, error } = await supabase
      .from('user_points')
      .select('*')
      .eq('user_email', user.email)
      .limit(1);

    if (error) return Response.json({ error: error.message }, { status: 400 });

    const current = rows?.[0];
    if (current) {
      const currentXp = current.xp_current || 0;
      const nextLevelXp = current.xp_next_level || 100;
      const updatedXp = currentXp + xpAmount;
      const leveledUp = updatedXp >= nextLevelXp;

      await supabase
        .from('user_points')
        .update({
          total_points: (current.total_points || 0) + xpAmount,
          xp_current: leveledUp ? updatedXp - nextLevelXp : updatedXp,
          level: leveledUp ? (current.level || 1) + 1 : (current.level || 1),
          xp_next_level: leveledUp ? Math.round(nextLevelXp * 1.5) : nextLevelXp,
          updated_date: new Date().toISOString(),
        })
        .eq('id', current.id);
    } else {
      await supabase.from('user_points').insert({
        user_email: user.email,
        total_points: xpAmount,
        level: 1,
        xp_current: xpAmount,
        xp_next_level: 100,
        rank: 'bronze',
        daily_streak: 0,
        longest_streak: 0,
      });
    }

    try {
      await supabase.from('user_xp_log').insert({
        user_id: user.id,
        xp_gained: xpAmount,
        source: source || 'generic',
        reference_id: reference_id || null,
        created_at: new Date().toISOString(),
      });
    } catch (_error) {
      // tabela opcional
    }

    return Response.json({ success: true, xp_gained: xpAmount });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});