// Corrección posterior CONSERVADORA. Es una red de seguridad: la precisión principal viene de pasar
// el vocabulario como contexto al motor (ver dictionary.contextTerms / whisperPrompt).
// Reglas, de más a menos segura:
//   1. Alias explícitos (frases) -> forma correcta.
//   2. Unir dos palabras contiguas si juntas forman un término ("levo dopa" -> "levodopa").
//   3. Palabra desconocida con la MISMA clave fonética que un término largo y distancia de edición ≤ 2.
import { dictionary } from './dictionary.js';
import { normalize } from '../core/util.js';

/** Clave fonética simplificada para español (seseo/yeísmo/b-v/h muda…). */
export function phoneticKey(word) {
  let w = normalize(word).replace(/[^a-z]/g, '');
  w = w.replace(/^h/, '').replace(/ph/g, 'f').replace(/qu/g, 'k').replace(/c([ei])/g, 's$1').replace(/z/g, 's')
    .replace(/c/g, 'k').replace(/v/g, 'b').replace(/ll/g, 'y').replace(/w/g, 'b').replace(/x/g, 'ks')
    .replace(/g([ei])/g, 'j$1').replace(/(.)\1+/g, '$1');
  return w;
}

export function editDistance(a, b, max = 3) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      rowMin = Math.min(rowMin, cur[j]);
    }
    if (rowMin > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

let phoneticIndex = null, phoneticFor = null;
function getPhoneticIndex(d) {
  if (phoneticFor === d) return phoneticIndex;
  phoneticIndex = new Map();
  for (const [norm, canon] of d.terms) {
    if (norm.includes(' ') || norm.length < 6) continue; // solo palabras largas: menor riesgo de falsos positivos
    const k = phoneticKey(norm);
    (phoneticIndex.get(k) ?? phoneticIndex.set(k, []).get(k)).push([norm, canon]);
  }
  phoneticFor = d;
  return phoneticIndex;
}

const matchCase = (src, canon) => (src[0] === src[0]?.toUpperCase() && src[0] !== src[0]?.toLowerCase() && canon[0] === canon[0].toLowerCase()
  ? canon[0].toUpperCase() + canon.slice(1) : canon);

export function correctMedical(text) {
  if (!text) return { text: '', changes: [] };
  const d = dictionary();
  const changes = [];
  let out = text;

  // 1) alias de frase (por longitud descendente)
  const aliases = [...d.aliases].sort((a, b) => b[0].length - a[0].length);
  for (const [alias, canon] of aliases) {
    out = replaceNormalized(out, alias, canon, changes);
  }

  // 2 y 3) palabra a palabra
  const tokens = out.split(/(\s+)/); // conserva separadores
  const idx = getPhoneticIndex(d);
  for (let i = 0; i < tokens.length; i += 2) {
    const raw = tokens[i];
    const m = raw.match(/^([^\p{L}\p{N}]*)([\p{L}\p{N}-]+)([^\p{L}\p{N}]*)$/u);
    if (!m) continue;
    const [, pre, word, post] = m;
    const nw = normalize(word);
    if (nw.length < 3) continue;
    // 2) unir con la siguiente palabra
    if (i + 2 < tokens.length) {
      const m2 = tokens[i + 2].match(/^([^\p{L}\p{N}]*)([\p{L}\p{N}-]+)([^\p{L}\p{N}]*)$/u);
      if (m2 && !/[.,;:!?]/.test(post) && !d.terms.has(nw)) {
        const joined = nw + normalize(m2[2]);
        const canon = d.terms.get(joined);
        if (canon && !d.words.has(nw)) {
          tokens[i] = pre + matchCase(word, canon) + m2[3];
          changes.push([`${word} ${m2[2]}`, canon]);
          tokens[i + 1] = ''; tokens[i + 2] = '';
          continue;
        }
      }
    }
    // 2b) restaurar tilde/forma canónica de un término conocido ("hipertension" -> "hipertensión")
    const known = d.terms.get(nw);
    if (known && !known.includes(' ') && known.toLowerCase() !== word.toLowerCase()) {
      tokens[i] = pre + matchCase(word, known) + post;
      changes.push([word, known]);
      continue;
    }
    // 3) fonética
    if (nw.length < 6 || d.terms.has(nw) || d.words.has(nw)) continue;
    const cands = idx.get(phoneticKey(nw));
    if (!cands) continue;
    let best = null, bd = 3;
    for (const [norm, canon] of cands) {
      const dist = editDistance(nw, norm, 2);
      if (dist < bd) { bd = dist; best = canon; }
    }
    if (best && bd <= 2) {
      tokens[i] = pre + matchCase(word, best) + post;
      changes.push([word, best]);
    }
  }
  return { text: tokens.join(''), changes };
}

/** Reemplaza `alias` (comparado sin acentos/mayúsculas) preservando el resto del texto original. */
function replaceNormalized(text, alias, canon, changes) {
  // normalize() conserva la longitud carácter a carácter para texto en español precompuesto (NFC).
  const base = text.normalize('NFC');
  const norm = normalize(base);
  if (norm.length !== base.length) return text;
  let res = '', pos = 0, from = 0;
  const isW = (c) => /[\p{L}\p{N}]/u.test(c ?? '');
  while ((from = norm.indexOf(alias, pos)) !== -1) {
    const end = from + alias.length;
    if (isW(norm[from - 1]) || isW(norm[end])) { res += base.slice(pos, end); pos = end; continue; }
    const found = base.slice(from, end);
    const fixed = matchCase(found, canon);
    if (found === fixed) { res += base.slice(pos, end); pos = end; continue; }
    res += base.slice(pos, from) + fixed;
    changes.push([found, fixed]);
    pos = end;
  }
  return res + base.slice(pos);
}
