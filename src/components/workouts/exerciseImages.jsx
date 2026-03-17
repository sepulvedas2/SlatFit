import agachamento from "@/assets/exercises/agachamento.svg";
import legpress from "@/assets/exercises/legpress.svg";
import avanco from "@/assets/exercises/avanco.svg";
import flexao from "@/assets/exercises/flexao.svg";
import prancha from "@/assets/exercises/prancha.svg";
import abdominal from "@/assets/exercises/abdominal.svg";
import corrida from "@/assets/exercises/corrida.svg";
import gluteo from "@/assets/exercises/gluteo.svg";
import burpee from "@/assets/exercises/burpee.svg";
import ombro from "@/assets/exercises/ombro.svg";
import mobilidade from "@/assets/exercises/mobilidade.svg";
import generic from "@/assets/exercises/generic.svg";

export const EXERCISE_IMAGES = {
  "Agachamento livre": agachamento,
  "Agachamento sumô": agachamento,
  "Agachamento lateral": agachamento,
  "Agachamento": agachamento,
  "Leg press": legpress,
  "Leg Press": legpress,
  "Passada para trás": avanco,
  "Passada à frente": avanco,
  "Avanço": avanco,
  "Passada": avanco,
  "Flexão de braço (joelho no chão)": flexao,
  "Flexão com joelho": flexao,
  "Flexão de braço": flexao,
  "Prancha baixa": prancha,
  "Prancha alta": prancha,
  "Prancha lateral": prancha,
  "Prancha": prancha,
  "Abdominal curto": abdominal,
  "Abdominal longo": abdominal,
  "Abdominal": abdominal,
  "Polichinelo": corrida,
  "Corrida no colchonete": corrida,
  "Corrida curta": corrida,
  "Corrida na cadeira": corrida,
  "Corrida com braços à frente": corrida,
  "Corrida no lugar": corrida,
  "Elevação pélvica": gluteo,
  "Ponte de glúteo": gluteo,
  "Burpee": burpee,
  "Burpee (cadeira ou caixa)": burpee,
  "Elevação lateral de ombro": ombro,
  "Elevação lateral": ombro,
  "Desenvolvimento": ombro,
  "Mobilidade Gato": mobilidade,
  'Mobilidade "Gato"': mobilidade,
  "Mobilidade": mobilidade,
  "Alongamento": mobilidade,
};

export const DEFAULT_EXERCISE_IMAGE = generic;

export function getExerciseImage(exerciseName) {
  if (!exerciseName) return DEFAULT_EXERCISE_IMAGE;
  if (EXERCISE_IMAGES[exerciseName]) return EXERCISE_IMAGES[exerciseName];

  const lowerName = exerciseName.toLowerCase();
  for (const [key, image] of Object.entries(EXERCISE_IMAGES)) {
    if (lowerName.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerName)) {
      return image;
    }
  }

  if (lowerName.includes("agach")) return agachamento;
  if (lowerName.includes("leg")) return legpress;
  if (lowerName.includes("avan") || lowerName.includes("passada") || lowerName.includes("lunge")) return avanco;
  if (lowerName.includes("flex")) return flexao;
  if (lowerName.includes("prancha")) return prancha;
  if (lowerName.includes("abdom") || lowerName.includes("crunch")) return abdominal;
  if (lowerName.includes("corr") || lowerName.includes("polich")) return corrida;
  if (lowerName.includes("glúte") || lowerName.includes("glute") || lowerName.includes("ponte") || lowerName.includes("pélv")) return gluteo;
  if (lowerName.includes("burpee")) return burpee;
  if (lowerName.includes("ombro") || lowerName.includes("elevação") || lowerName.includes("desenvolvimento")) return ombro;
  if (lowerName.includes("mobil") || lowerName.includes("along")) return mobilidade;

  return DEFAULT_EXERCISE_IMAGE;
}