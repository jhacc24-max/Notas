// Diccionario médico unificado: términos base + términos del usuario (Ajustes).
import { BASE_TERMS, BASE_ALIASES } from './terms.js';
import { normalize } from '../core/util.js';
import { getSetting } from '../settings/settings.js';
import { on } from '../core/events.js';

let built = null;
const STOP = new Set(['enfermedad', 'insuficiencia', 'cancer', 'sindrome', 'trastorno', 'dolor', 'perdida', 'cada', 'para', 'como',
  'cirugia', 'medicina', 'terapia', 'tension', 'presion', 'frecuencia', 'vitamina', 'acido', 'tomografia', 'resonancia', 'general', 'interna',
  'familiar', 'vision', 'columna', 'cerebral', 'profunda', 'estimulacion', 'infeccion', 'cardiaca', 'renal', 'cronica', 'arterial', 'venosa',
  'cabeza', 'cuello', 'peso', 'talla', 'mano', 'pie', 'ojo', 'piel']);

function parseList(s) {
  // Separa por líneas / comas; los términos pueden tener varias palabras. Los de BASE_TERMS están
  // separados por saltos de línea y espacios, así que ahí detectamos frases por el listado explícito.
  return s.split(/[\n,]+/).map((x) => x.trim()).filter(Boolean);
}

/** Los bloques base usan espacios entre términos de UNA palabra; las frases conocidas se listan aparte. */
const PHRASES = [
  'enfermedad de Parkinson', 'esclerosis múltiple', 'esclerosis lateral amiotrófica', 'miastenia gravis', 'ataque isquémico transitorio',
  'hemorragia subaracnoidea', 'enfermedad de Alzheimer', 'deterioro cognitivo', 'infarto agudo de miocardio', 'angina de pecho',
  'cardiopatía isquémica', 'insuficiencia cardíaca', 'fibrilación auricular', 'estenosis aórtica', 'trombosis venosa profunda',
  'tromboembolismo pulmonar', 'reflujo gastroesofágico', 'enfermedad de Crohn', 'colitis ulcerosa', 'síndrome de intestino irritable',
  'insuficiencia renal crónica', 'nefropatía diabética', 'infección urinaria', 'hiperplasia prostática', 'cáncer de próstata',
  'tiroiditis de Hashimoto', 'enfermedad de Graves', 'artritis reumatoide', 'hernia discal', 'cáncer de mama', 'cáncer de pulmón',
  'cáncer colorrectal', 'trastorno bipolar', 'trastorno obsesivo compulsivo', 'estrés postraumático', 'dermatitis atópica', 'herpes zóster',
  'diabetes mellitus', 'síndrome metabólico', 'apnea del sueño', 'derrame pleural', 'presión arterial', 'tensión arterial',
  'frecuencia cardíaca', 'frecuencia respiratoria', 'saturación de oxígeno', 'índice de masa corporal', 'hipotensión ortostática',
  'hemoglobina glicosilada', 'filtrado glomerular', 'proteína C reactiva', 'dímero D', 'vitamina D', 'vitamina B12', 'ácido acetilsalicílico',
  'ácido fólico', 'sulfato ferroso', 'amoxicilina clavulánico', 'tomografía computarizada', 'resonancia magnética', 'punción lumbar',
  'estimulación cerebral profunda', 'médula espinal', 'tronco encefálico', 'columna cervical', 'vesícula biliar', 'senos paranasales',
  'pérdida de peso', 'dolor torácico', 'dolor abdominal', 'visión borrosa', 'pérdida de memoria', 'inestabilidad postural',
  'medicina interna', 'medicina familiar', 'cirugía general', 'cirugía vascular', 'terapia ocupacional', 'cada ocho horas', 'cada doce horas',
  'cada veinticuatro horas', 'antes de dormir', 'con las comidas', 'en ayunas', 'miligramos por decilitro', 'milímetros de mercurio',
  'latidos por minuto', 'unidades internacionales', 'monitorización ambulatoria de presión arterial', 'cáncer de pulmón',
];

function build() {
  const terms = new Map(); // normalizado -> forma canónica
  const add = (t) => { const k = normalize(t); if (k && !terms.has(k)) terms.set(k, t); };
  // Los bloques base separan términos de una sola palabra por espacios; las frases van en PHRASES.
  // 'signos' y 'unidades' solo contienen frases (separarlas añadiría palabras comunes como ruido).
  for (const [cat, block] of Object.entries(BASE_TERMS)) {
    if (cat === 'signos' || cat === 'unidades') continue;
    for (const w of block.split(/\s+/)) if (w.length > 3 && !STOP.has(normalize(w))) add(w);
  }
  PHRASES.forEach(add);
  const aliases = new Map(Object.entries(BASE_ALIASES).map(([a, c]) => [normalize(a), c]));
  // Frases con tilde: permiten restaurarla si el motor la omitió ("fibrilacion auricular").
  for (const [k, canon] of terms) if (k.includes(' ') && k !== canon.toLowerCase()) aliases.set(k, canon);
  // Términos del usuario: "alias=Término" o solo "Término"
  for (const line of parseList(getSetting('customTerms') || '')) {
    const [a, b] = line.split('=').map((x) => x.trim());
    if (b) { aliases.set(normalize(a), b); add(b); } else add(a);
  }
  const words = new Set();
  for (const k of terms.keys()) k.split(' ').forEach((w) => w.length > 3 && words.add(w));
  built = { terms, aliases, words };
  return built;
}
export const dictionary = () => built ?? build();
on('settings:changed', ({ key }) => { if (key === 'customTerms') built = null; });
export const termCount = () => dictionary().terms.size;

/**
 * Términos para sesgar (contexto) al motor de transcripción.
 * `max` limita el tamaño: Whisper solo admite ~224 tokens de prompt; el navegador, ~500 frases.
 * Primero van los del usuario (más relevantes para él), luego un muestreo del paquete base.
 */
export function contextTerms(max = 120) {
  const user = parseList(getSetting('customTerms') || '').map((l) => l.split('=').pop().trim());
  const out = [...new Set(user)];
  for (const t of dictionary().terms.values()) {
    if (out.length >= max) break;
    if (!out.includes(t)) out.push(t);
  }
  return out.slice(0, max);
}

/** Prompt para Whisper: frase natural con terminología (Whisper imita el estilo/vocabulario del prompt). */
export function whisperPrompt() {
  return `Nota clínica en español. Vocabulario médico: ${contextTerms(70).join(', ')}.`;
}
