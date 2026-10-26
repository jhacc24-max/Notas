// Adaptador entre la cola de transcripción y el módulo de notas (evita dependencias circulares).
import * as Notes from './notes/notes.js';

export const queueApi = () => ({
  pending: () => Notes.pendingTranscription(),
  audio: (id) => Notes.getAudio(id),
  apply: async (id, text, status) => {
    const n = Notes.get(id);
    if (!n) return;
    const patch = { transcriptStatus: status };
    // No pisar un texto que el usuario ya haya escrito.
    if (text != null && !n.text.trim()) patch.text = text;
    await Notes.update(id, patch);
  },
});
