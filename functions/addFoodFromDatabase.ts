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

    const { food_id, food_name, portion_size, meal_type, quantity, nutrition, log_date } = await req.json();

    const safeFoodId = String(food_id).replace(/'/g, "''");
    const safeMealType = String(meal_type).replace(/'/g, "''");
    const qty = Number(quantity) || 1;

    const insertSql = `
      INSERT INTO user_food_logs (user_id, food_id, quantity, meal_type)
      VALUES ('${user.id}'::uuid, '${safeFoodId}'::uuid, ${qty}, '${safeMealType}');
    `;

    const { error: logError } = await supabase.rpc('exec_sql', { sql: insertSql });
    if (logError) return Response.json({ error: logError.message }, { status: 400 });

    const { error: foodLogError } = await supabase
      .from('food_logs')
      .insert({
        user_email: user.email,
        food_name,
        meal_type,
        calories: nutrition?.calories || 0,
        protein: nutrition?.protein || 0,
        carbs: nutrition?.carbohydrates || 0,
        fats: nutrition?.fat || 0,
        portion_size,
        image_url: null,
        log_date,
      });

    if (foodLogError) return Response.json({ error: foodLogError.message }, { status: 400 });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});