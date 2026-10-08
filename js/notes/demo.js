// Notas de ejemplo para probar la app (Ajustes → Datos de ejemplo). Se marcan con la categoría «Ejemplo».
import * as Notes from './notes.js';
import { saveReminder } from '../reminders/reminders.js';

export const DEMO_CATEGORY = 'Ejemplo';
const D = 86400000;

export async function loadDemo() {
  const t0 = new Date(); t0.setHours(0, 0, 0, 0);
  const at = (dayOff, h, m = 0) => t0.getTime() + dayOff * D + (h * 60 + m) * 60000;
  const items = [
    ['Control de presión arterial y medicamentos', 'Tomar la presión por la mañana. Ajustar dosis de losartán según resultados.', 0, 9, 'high', true],
    ['Comprar medicamento', 'Levodopa carbidopa y metformina en la farmacia.', 0, 11, 'medium', true],
    ['Llamar al neurólogo', 'Consultar por el temblor y la bradicinesia. Pedir cita de control.', 0, 16, 'high', true],
    ['Análisis de sangre', 'Hemoglobina glicosilada, creatinina y colesterol LDL en ayunas.', 1, 8, 'medium', true],
    ['Cita con cardiología', 'Revisar fibrilación auricular y ecocardiograma.', 2, 10, 'high', true],
    ['Fisioterapia', 'Ejercicios de marcha y equilibrio.', 3, 17, 'low', true],
    ['Renovar receta', 'Pramipexol y rasagilina.', 5, 12, 'medium', true],
    ['Vacuna de la gripe', 'Pasar por el centro de salud.', 8, 9, 'low', true],
    ['Resultados de resonancia magnética', 'Recoger informe.', -2, 13, 'medium', false],
    ['Nota sobre síntomas', 'Mareo al levantarse, posible hipotensión ortostática.', -4, 20, 'low', false],
  ];
  for (const [title, text, off, h, priority, reminder] of items) {
    const when = at(off, h);
    const kind = /médic|Análisis|cardiolog|neurólogo|resonancia|Fisioterapia|Vacuna|receta|síntomas/i.test(`${title} ${text}`) ? 'hospital' : 'personal';
    const n = await Notes.create({ title, text, priority, kind, createdAt: reminder ? Date.now() : when, category: DEMO_CATEGORY });
    if (reminder) await saveReminder({ noteId: n.id, at: when, notified: false }); // local: no toca Google Tasks
    if (off < 0) await Notes.update(n.id, { done: off === -2 });
  }
}
export const demoIds = () => Notes.all().filter((n) => n.category === DEMO_CATEGORY).map((n) => n.id);
export const clearDemo = () => Notes.purge(demoIds());
