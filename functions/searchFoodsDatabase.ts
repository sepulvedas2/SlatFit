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

    const { data, error } = await supabase
      .from('foods_database')
      .select('id, food_name, portion_size, calories, protein, carbohydrates, fat, fiber')
      .ilike('food_name', `%${term}%`)
      .order('food_name', { ascending: true })
      .limit(20);

    if (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    return Response.json({ foods: data || [] });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});