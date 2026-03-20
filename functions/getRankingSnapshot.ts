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
      supabase.from('user_points').select('*').order('total_points', { ascending: false }).limit(100),
      supabase.from('user_profiles').select('*').limit(500),
    ]);

    if (pointsError) return Response.json({ error: pointsError.message }, { status: 400 });

    const profileMap = Object.fromEntries(
      (profileRows || []).map((row) => [row.email || row.user_email || row.user_id || row.id, row.display_name || ''])
    );

    const leaderboard = (pointsRows || []).map((row, index) => ({
      ...row,
      posicao: index + 1,
      total_xp: row.total_points || 0,
      nivel: row.level || 1,
      display_name: profileMap[row.user_email] || 'Usuário Anônimo',
    }));

    const currentUser = leaderboard.find((row) => row.user_email === user.email) || null;

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