import { createClient } from 'npm:@supabase/supabase-js@2.39.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Exercícios permanentes do aplicativo
const PERMANENT_EXERCISES = [
  // Agachamentos
  { name: "Agachamento livre", description: "Agachamento completo sem apoio", reps_suggestion: "15x", duration_seconds: 45, difficulty: "intermediario", category: "forca" },
  { name: "Agachamento sumô", description: "Agachamento com pernas afastadas", reps_suggestion: "12x", duration_seconds: 40, difficulty: "intermediario", category: "forca" },
  { name: "Agachamento lateral", description: "Agachamento com movimento lateral", reps_suggestion: "10x cada lado", duration_seconds: 50, difficulty: "intermediario", category: "forca" },
  
  // Cardio
  { name: "Polichinelo", description: "Salto com abertura de braços e pernas", reps_suggestion: "30x", duration_seconds: 30, difficulty: "iniciante", category: "cardio" },
  { name: "Corrida no lugar", description: "Corrida estática elevando joelhos", reps_suggestion: "60 segundos", duration_seconds: 60, difficulty: "iniciante", category: "cardio" },
  
  // Flexões
  { name: "Flexão de braço (joelho no chão)", description: "Flexão adaptada com joelhos apoiados", reps_suggestion: "10x", duration_seconds: 40, difficulty: "iniciante", category: "forca" },
  { name: "Flexão de braço", description: "Flexão completa tradicional", reps_suggestion: "15x", duration_seconds: 45, difficulty: "intermediario", category: "forca" },
  
  // Prancha
  { name: "Prancha baixa", description: "Prancha isométrica com antebraços", reps_suggestion: "45 segundos", duration_seconds: 45, difficulty: "intermediario", category: "core" },
  { name: "Prancha alta", description: "Prancha com braços estendidos", reps_suggestion: "30 segundos", duration_seconds: 30, difficulty: "intermediario", category: "core" },
  { name: "Prancha lateral", description: "Prancha de lado com apoio em um braço", reps_suggestion: "30s cada lado", duration_seconds: 60, difficulty: "avancado", category: "core" },
  
  // Abdominais
  { name: "Abdominal curto", description: "Crunch abdominal tradicional", reps_suggestion: "20x", duration_seconds: 40, difficulty: "iniciante", category: "core" },
  { name: "Abdominal longo", description: "Abdominal com amplitude completa", reps_suggestion: "15x", duration_seconds: 45, difficulty: "intermediario", category: "core" },
  
  // Passadas
  { name: "Passada para trás", description: "Lunge reverso alternado", reps_suggestion: "12x cada perna", duration_seconds: 60, difficulty: "intermediario", category: "forca" },
  { name: "Passada à frente", description: "Lunge frontal alternado", reps_suggestion: "12x cada perna", duration_seconds: 60, difficulty: "intermediario", category: "forca" },
  
  // Glúteo
  { name: "Elevação pélvica", description: "Hip thrust básico", reps_suggestion: "20x", duration_seconds: 50, difficulty: "iniciante", category: "forca" },
  { name: "Ponte de glúteo", description: "Ponte com contração de glúteos", reps_suggestion: "15x", duration_seconds: 45, difficulty: "intermediario", category: "forca" },
  
  // Burpee
  { name: "Burpee", description: "Burpee completo", reps_suggestion: "10x", duration_seconds: 50, difficulty: "avancado", category: "cardio" },
  
  // Ombro
  { name: "Elevação lateral de ombro", description: "Elevação lateral com braços", reps_suggestion: "15x", duration_seconds: 40, difficulty: "intermediario", category: "forca" },
  
  // Mobilidade
  { name: "Mobilidade Gato", description: "Mobilidade de coluna em 4 apoios", reps_suggestion: "10 ciclos", duration_seconds: 60, difficulty: "iniciante", category: "mobilidade" },
  { name: "Alongamento", description: "Alongamento geral do corpo", reps_suggestion: "5 minutos", duration_seconds: 300, difficulty: "iniciante", category: "flexibilidade" },
];

Deno.serve(async (req) => {
  try {
    // Verifica se os exercícios já existem
    const { data: existingExercises, error: checkError } = await supabase
      .from('exercises')
      .select('id, name')
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
        continue;
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
      message: "Exercícios nativos sincronizados com sucesso",
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