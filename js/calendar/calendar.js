// Modelo del calendario: agrupa notas por día. Fecha efectiva = recordatorio (si existe) o creación.
import { dayKey } from '../core/util.js';

export const effectiveDate = (n) => n.reminder?.at ?? n.createdAt;

export function groupByDay(notes) {
  const map = new Map();
  for (const n of notes) {
    const k = dayKey(effectiveDate(n));
    (map.get(k) ?? map.set(k, []).get(k)).push(n);
  }
  for (const list of map.values()) list.sort((a, b) => effectiveDate(a) - effectiveDate(b));
  return map;
}

/** Celdas del mes (semana empieza en lunes). */
export function monthGrid(year, month) {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7) cells.push(null);
  return cells;
}
