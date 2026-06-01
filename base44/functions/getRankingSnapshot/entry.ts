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

    const [{ data: pointsRows, error: pointsError }, { data: profileRows }] = await Promise.all([
      supabase.from('user_points').select('id,user_id,total_points,level').order('total_points', { ascending: false }).limit(100),
      supabase.from('user_profiles').select('id,user_id,email,display_name').limit(500),
    ]);

    if (pointsError) return Response.json({ error: pointsError.message }, { status: 400 });

    const profileMapById = Object.fromEntries((profileRows || []).map((row) => [row.user_id || row.id, row.display_name || '']));

    const leaderboard = (pointsRows || []).map((row, index) => ({
      id: row.id,
      user_id: row.user_id,
      posicao: index + 1,
      total_xp: row.total_points || 0,
      nivel: row.level || 1,
      display_name: profileMapById[row.user_id] || 'Usuário',
      is_current_user: row.user_id === user.id,
    }));

    const currentUser = leaderboard.find((row) => row.is_current_user) || null;

    return Response.json({
      currentRank: currentUser?.posicao || null,
      currentXp: currentUser?.total_xp || 0,
      currentLevel: currentUser?.nivel || 1,
      leaderboard: leaderboard.slice(0, 10),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});