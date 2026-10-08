// Capa de almacenamiento (IndexedDB). Cuatro almacenes separados:
//   notes     -> datos de la nota (texto, título, prioridad, estado…)
//   audio     -> blobs de audio, clave = id de nota (separado para no cargar audio al listar)
//   reminders -> recordatorios (+ vínculo con Google Tasks), clave = id de nota
//   settings  -> configuración clave/valor
// Todo queda en el dispositivo. Para sincronizar con la nube basta con implementar
// un "SyncAdapter" que lea/escriba estos mismos registros (cada nota tiene id y updatedAt).
const DB_NAME = 'notas-medicas';
const DB_VERSION = 1;
const STORES = { notes: 'id', audio: 'id', reminders: 'noteId', settings: 'key' };

let dbp;
const open = () => dbp ??= new Promise((resolve, reject) => {
  const req = indexedDB.open(DB_NAME, DB_VERSION);
  req.onupgradeneeded = () => {
    const db = req.result;
    for (const [name, keyPath] of Object.entries(STORES)) {
      if (!db.objectStoreNames.contains(name)) db.createObjectStore(name, { keyPath });
    }
  };
  req.onsuccess = () => resolve(req.result);
  req.onerror = () => reject(req.error);
});

const run = async (store, mode, fn) => {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, mode);
    const out = fn(tx.objectStore(store));
    tx.oncomplete = () => resolve(out && 'result' in out ? out.result : undefined);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
};

export const dbGet = (store, key) => run(store, 'readonly', (s) => s.get(key));
export const dbAll = (store) => run(store, 'readonly', (s) => s.getAll());
export const dbPut = (store, value) => run(store, 'readwrite', (s) => { s.put(value); });
export const dbDelete = (store, key) => run(store, 'readwrite', (s) => { s.delete(key); });
export const dbClear = (store) => run(store, 'readwrite', (s) => { s.clear(); });

/** Pide almacenamiento persistente para que el navegador no borre las notas por falta de espacio. */
export async function requestPersistence() {
  try { return (await navigator.storage?.persist?.()) ?? false; } catch { return false; }
}
export async function storageEstimate() {
  try {
    const e = await navigator.storage?.estimate?.();
    const persisted = (await navigator.storage?.persisted?.()) ?? false;
    return { usage: e?.usage ?? 0, quota: e?.quota ?? 0, persisted };
  } catch { return { usage: 0, quota: 0, persisted: false }; }
}
