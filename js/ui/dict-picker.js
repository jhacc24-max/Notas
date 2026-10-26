// "Añadir al diccionario": al seleccionar una palabra de la transcripción aparece una opción flotante.
// Sirve tanto para texto de solo lectura como mientras se edita (textarea).
import { addCustomTerm } from '../medical/dictionary.js';
import { correctMedical } from '../medical/corrector.js';
import { normalize, esc } from '../core/util.js';
import { icon } from '../core/icons.js';
import { termDialog, toast } from './dialogs.js';

export function mountDictPicker(root, { getText, setText }) {
  const chip = document.createElement('button');
  chip.className = 'dict-chip';
  chip.hidden = true;
  chip.type = 'button';
  document.body.appendChild(chip);
  let current = '', timer;

  const selectedText = () => {
    const ta = document.activeElement;
    if (ta?.tagName === 'TEXTAREA' && root.contains(ta) && ta.selectionStart !== ta.selectionEnd) {
      return ta.value.slice(ta.selectionStart, ta.selectionEnd);
    }
    const sel = getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) return '';
    const el = sel.anchorNode?.nodeType === 1 ? sel.anchorNode : sel.anchorNode?.parentElement;
    if (!el?.closest?.('.transcript') || !root.contains(el)) return '';
    return sel.toString();
  };

  const update = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const t = selectedText().replace(/\s+/g, ' ').trim();
      const words = t.split(' ').length;
      if (t.length >= 2 && t.length <= 60 && words <= 4) {
        current = t;
        chip.innerHTML = `${icon('add')}<span>Añadir «${esc(t.length > 24 ? t.slice(0, 24) + '…' : t)}» al diccionario</span>`;
        chip.hidden = false;
      } else chip.hidden = true;
    }, 160);
  };
  document.addEventListener('selectionchange', update);
  // Evita que al tocar la opción se pierda la selección antes de leerla.
  chip.addEventListener('pointerdown', (e) => e.preventDefault());
  chip.addEventListener('click', async () => {
    const picked = current;
    chip.hidden = true;
    const res = await termDialog({ selected: picked });
    if (!res) return;
    await addCustomTerm(res.term, res.fixAlways && normalize(res.term) !== normalize(picked) ? picked : null);
    // Aplica ya a este texto: reemplaza lo seleccionado y repasa el resto con el diccionario ampliado.
    let text = getText();
    if (res.replaceHere && picked && normalize(picked) !== normalize(res.term)) {
      const i = normalize(text).indexOf(normalize(picked));
      if (i >= 0 && normalize(text).length === text.length) text = text.slice(0, i) + res.term + text.slice(i + picked.length);
    }
    setText(correctMedical(text).text);
    toast(`«${res.term}» añadido al diccionario`);
  });

  return { destroy() { document.removeEventListener('selectionchange', update); clearTimeout(timer); chip.remove(); } };
}
