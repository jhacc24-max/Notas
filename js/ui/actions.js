// Acciones de UI compartidas (eliminar, compartir, prioridad, recordatorio).
import * as Notes from '../notes/notes.js';
import { confirmDialog, menuSheet, reminderDialog, shareDialog, toast } from './dialogs.js';
import { shareNotes, whatsappUrl, mailUrl } from '../share/share.js';
import { getSetting, setSetting } from '../settings/settings.js';
import { setReminder, clearReminder, syncNoteChange, googleSyncActive } from '../reminders/service.js';
import { googleCalendarUrl, icsFile, requestNotificationPermission } from '../reminders/reminders.js';
import { googleConfigured, wasConnected, getToken } from '../google/oauth.js';
import { PRIORITIES } from './components.js';

export async function deleteNotes(ids) {
  const one = ids.length === 1;
  const ok = await confirmDialog({
    title: one ? '¿Quieres eliminar esta nota?' : `¿Quieres eliminar ${ids.length} notas?`,
    text: `Se moverá a la papelera, donde se conserva ${Notes.TRASH_RETENTION_DAYS} días.`,
    ok: 'Eliminar', cancel: 'Cancelar', danger: true,
  });
  if (!ok) return false;
  for (const id of ids) { const n = Notes.get(id); if (n?.reminder?.taskId) clearReminder(n); }
  await Notes.trash(ids);
  toast(one ? 'Nota movida a la papelera' : `${ids.length} notas movidas a la papelera`, {
    action: 'Deshacer', onAction: () => Notes.restore(ids),
  });
  return true;
}

export async function shareUI(notes) {
  if (!notes.length) return;
  const hasAudio = notes.some((n) => n.hasAudio);
  const choice = await shareDialog({ count: notes.length, hasAudio, withAudio: getSetting('includeAudioShare') });
  if (!choice) return;
  if (hasAudio) setSetting('includeAudioShare', choice.withAudio);
  const r = await shareNotes(notes, choice);
  if (r === 'copied') {
    const alt = await menuSheet({
      title: 'Copiado al portapapeles', items: [
        { id: 'wa', label: 'Enviar por WhatsApp', icon: 'share' }, { id: 'mail', label: 'Enviar por correo', icon: 'share' },
      ],
    });
    if (alt === 'wa') window.open(whatsappUrl(notes), '_blank', 'noopener');
    if (alt === 'mail') location.href = mailUrl(notes);
  } else if (r === 'unavailable') toast('No se pudo compartir en este navegador.');
}

export async function pickPriority(ids) {
  const p = await menuSheet({
    title: 'Prioridad',
    items: PRIORITIES.map((x) => ({ id: x.id, label: `${x.emoji} ${x.label}` })),
  });
  if (!p) return false;
  for (const id of ids) await Notes.setPriority(id, p);
  return true;
}

/** Abre el selector de recordatorio y devuelve { at } | { remove } | undefined, sin aplicar nada. */
export async function reminderPicker(note) {
  return reminderDialog({
    at: note.reminder?.at, withGoogle: googleSyncActive(), googleReady: googleConfigured() && !wasConnected(),
    onConnect: async () => { try { await getToken(true); return true; } catch (e) { toast(e.message); return false; } },
    calendarLink: googleCalendarUrl(note, note.reminder?.at ?? Date.now() + 3600e3),
    onIcs: (at) => {
      const f = icsFile(note, at), url = URL.createObjectURL(f);
      const a = Object.assign(document.createElement('a'), { href: url, download: f.name });
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    },
  });
}

export async function reminderUI(note) {
  const res = await reminderPicker(note);
  if (!res) return;
  if (res.remove) { await clearReminder(note); toast('Recordatorio eliminado'); return; }
  const r = await setReminder(note, res.at);
  requestNotificationPermission();
  toast(r.synced ? 'Recordatorio guardado y añadido a Google' : 'Recordatorio guardado');
}

export { syncNoteChange };
