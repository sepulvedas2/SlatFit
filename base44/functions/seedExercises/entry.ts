import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Exercícios permanentes do aplicativo
const PERMANENT_EXERCISES = [
  // Agachamentos
  { name: "Agachamento livre", description: "Agachamento completo sem apoio", image_url: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=533&fit=crop&q=80", reps_suggestion: "15x", duration_seconds: 45, difficulty: "intermediario", category: "forca" },
  { name: "Agachamento sumô", description: "Agachamento com pernas afastadas", image_url: "https://images.unsplash.com/photo-1485811055483-1c09e64d4576?w=400&h=533&fit=crop&q=80", reps_suggestion: "12x", duration_seconds: 40, difficulty: "intermediario", category: "forca" },
  { name: "Agachamento lateral", description: "Agachamento com movimento lateral", image_url: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=400&h=533&fit=crop&q=80", reps_suggestion: "10x cada lado", duration_seconds: 50, difficulty: "intermediario", category: "forca" },
  
  // Cardio
  { name: "Polichinelo", description: "Salto com abertura de braços e pernas", image_url: "https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=400&h=533&fit=crop&q=80", reps_suggestion: "30x", duration_seconds: 30, difficulty: "iniciante", category: "cardio" },
  { name: "Corrida no lugar", description: "Corrida estática elevando joelhos", image_url: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&h=533&fit=crop&q=80", reps_suggestion: "60 segundos", duration_seconds: 60, difficulty: "iniciante", category: "cardio" },
  
  // Flexões
  { name: "Flexão de braço (joelho no chão)", description: "Flexão adaptada com joelhos apoiados", image_url: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400&h=533&fit=crop&q=80", reps_suggestion: "10x", duration_seconds: 40, difficulty: "iniciante", category: "forca" },
  { name: "Flexão de braço", description: "Flexão completa tradicional", image_url: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400&h=533&fit=crop&q=80", reps_suggestion: "15x", duration_seconds: 45, difficulty: "intermediario", category: "forca" },
  
  // Prancha
  { name: "Prancha baixa", description: "Prancha isométrica com antebraços", image_url: "https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=400&h=533&fit=crop&q=80", reps_suggestion: "45 segundos", duration_seconds: 45, difficulty: "intermediario", category: "core" },
  { name: "Prancha alta", description: "Prancha com braços estendidos", image_url: "https://images.unsplash.com/photo-1590487988256-9ed24133863e?w=400&h=533&fit=crop&q=80", reps_suggestion: "30 segundos", duration_seconds: 30, difficulty: "intermediario", category: "core" },
  { name: "Prancha lateral", description: "Prancha de lado com apoio em um braço", image_url: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=533&fit=crop&q=80", reps_suggestion: "30s cada lado", duration_seconds: 60, difficulty: "avancado", category: "core" },
  
  // Abdominais
  { name: "Abdominal curto", description: "Crunch abdominal tradicional", image_url: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=533&fit=crop&q=80", reps_suggestion: "20x", duration_seconds: 40, difficulty: "iniciante", category: "core" },
  { name: "Abdominal longo", description: "Abdominal com amplitude completa", image_url: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=533&fit=crop&q=80", reps_suggestion: "15x", duration_seconds: 45, difficulty: "intermediario", category: "core" },
  
  // Passadas
  { name: "Passada para trás", description: "Lunge reverso alternado", image_url: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=400&h=533&fit=crop&q=80", reps_suggestion: "12x cada perna", duration_seconds: 60, difficulty: "intermediario", category: "forca" },
  { name: "Passada à frente", description: "Lunge frontal alternado", image_url: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=400&h=533&fit=crop&q=80", reps_suggestion: "12x cada perna", duration_seconds: 60, difficulty: "intermediario", category: "forca" },
  
  // Glúteo
  { name: "Elevação pélvica", description: "Hip thrust básico", image_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=533&fit=crop&q=80", reps_suggestion: "20x", duration_seconds: 50, difficulty: "iniciante", category: "forca" },
  { name: "Ponte de glúteo", description: "Ponte com contração de glúteos", image_url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=533&fit=crop&q=80", reps_suggestion: "15x", duration_seconds: 45, difficulty: "intermediario", category: "forca" },
  
  // Burpee
  { name: "Burpee", description: "Burpee completo", image_url: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=533&fit=crop&q=80", reps_suggestion: "10x", duration_seconds: 50, difficulty: "avancado", category: "cardio" },
  
  // Ombro
  { name: "Elevação lateral de ombro", description: "Elevação lateral com braços", image_url: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=533&fit=crop&q=80", reps_suggestion: "15x", duration_seconds: 40, difficulty: "intermediario", category: "forca" },
  
  // Mobilidade
  { name: "Mobilidade Gato", description: "Mobilidade de coluna em 4 apoios", image_url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=533&fit=crop&q=80", reps_suggestion: "10 ciclos", duration_seconds: 60, difficulty: "iniciante", category: "mobilidade" },
  { name: "Alongamento", description: "Alongamento geral do corpo", image_url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=533&fit=crop&q=80", reps_suggestion: "5 minutos", duration_seconds: 300, difficulty: "iniciante", category: "flexibilidade" },
];

Deno.serve(async (req) => {
  try {
    // Verifica se os exercícios já existem
    const { data: existingExercises, error: checkError } = await supabase
      .from('exercises')
      .select('id, name, image_url')
      .limit(100);

    if (checkError) {
      throw new Error(`Erro ao verificar exercícios: ${checkError.message}`);
    }

    let results = {
      inserted: 0,
      updated: 0,
      total: 0
    };

    // Processa cada exercício permanente
    for (const exercise of PERMANENT_EXERCISES) {
      const existing = existingExercises?.find(e => e.name === exercise.name);

      if (existing) {
        // Se o exercício existe mas não tem imagem, atualiza
        if (!existing.image_url || existing.image_url !== exercise.image_url) {
          const { error: updateError } = await supabase
            .from('exercises')
            .update({ image_url: exercise.image_url })
            .eq('id', existing.id);

          if (!updateError) {
            results.updated++;
          }
        }
      } else {
        // Insere novo exercício
        const { error: insertError } = await supabase
          .from('exercises')
          .insert([exercise]);

        if (!insertError) {
          results.inserted++;
        }
      }
      results.total++;
    }

    return Response.json({
      success: true,
      message: "Sincronização de exercícios e imagens concluída",
      inserted: results.inserted,
      updated: results.updated,
      total: results.total
    });

  } catch (error) {
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});