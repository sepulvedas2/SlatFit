import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_KEY');
const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { query } = await req.json();
    const term = (query || '').trim();

    if (!term) {
      return Response.json({ foods: [] });
    }

    const safeTerm = term.replace(/'/g, "''");
    const sql = term
      ? `
        SELECT COALESCE(json_agg(t), '[]'::json) AS foods
        FROM (
          SELECT id, food_name, portion_size, calories, protein, carbohydrates, fat, fiber
          FROM foods_database
          WHERE food_name ILIKE '%${safeTerm}%'
          ORDER BY food_name ASC
          LIMIT 20
        ) t;
      `
      : `
        SELECT COALESCE(json_agg(t), '[]'::json) AS foods
        FROM (
          SELECT id, food_name, portion_size, calories, protein, carbohydrates, fat, fiber
          FROM foods_database
          ORDER BY food_name ASC
          LIMIT 30
        ) t;
      `;

    const { data, error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    const foods = data?.[0]?.foods || data?.foods || [];
    return Response.json({ foods });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});