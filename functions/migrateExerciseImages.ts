import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';
import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_KEY'));

const EXERCISE_IMAGE_FALLBACKS = {
  'Agachamento livre': 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=533&fit=crop&q=80',
  'Agachamento sumô': 'https://images.unsplash.com/photo-1485811055483-1c09e64d4576?w=400&h=533&fit=crop&q=80',
  'Agachamento lateral': 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=400&h=533&fit=crop&q=80',
  'Agachamento': 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=533&fit=crop&q=80',
  'Polichinelo': 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=400&h=533&fit=crop&q=80',
  'Corrida no lugar': 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&h=533&fit=crop&q=80',
  'Flexão de braço (joelho no chão)': 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400&h=533&fit=crop&q=80',
  'Flexão de braço': 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400&h=533&fit=crop&q=80',
  'Prancha baixa': 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=400&h=533&fit=crop&q=80',
  'Prancha alta': 'https://images.unsplash.com/photo-1590487988256-9ed24133863e?w=400&h=533&fit=crop&q=80',
  'Prancha lateral': 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=533&fit=crop&q=80',
  'Prancha': 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=400&h=533&fit=crop&q=80',
  'Abdominal curto': 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=533&fit=crop&q=80',
  'Abdominal longo': 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=533&fit=crop&q=80',
  'Passada para trás': 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=400&h=533&fit=crop&q=80',
  'Passada à frente': 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=400&h=533&fit=crop&q=80',
  'Elevação pélvica': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=533&fit=crop&q=80',
  'Ponte de glúteo': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=533&fit=crop&q=80',
  'Burpee': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=533&fit=crop&q=80',
  'Elevação lateral de ombro': 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=533&fit=crop&q=80',
  'Mobilidade Gato': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=533&fit=crop&q=80',
  'Alongamento': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=533&fit=crop&q=80'
};

function normalizeExerciseName(name = '') {
  return name.replace(/\s*\((?:fem(?:\s*[a-z])?)\)\s*$/i, '').trim();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: exercises, error } = await supabase
      .from('exercises')
      .select('id, name, image_url')
      .limit(1000);

    if (error) {
      return Response.json({ error: error.message }, { status: 400 });
    }

    let migrated = 0;

    for (const exercise of exercises || []) {
      if (exercise.image_url) continue;

      const normalizedName = normalizeExerciseName(exercise.name);
      const fallbackUrl = EXERCISE_IMAGE_FALLBACKS[exercise.name] || EXERCISE_IMAGE_FALLBACKS[normalizedName];
      if (!fallbackUrl) continue;

      const { error: updateError } = await supabase
        .from('exercises')
        .update({ image_url: fallbackUrl })
        .eq('id', exercise.id);

      if (!updateError) migrated += 1;
    }

    return Response.json({ success: true, migrated, total: exercises?.length || 0 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});