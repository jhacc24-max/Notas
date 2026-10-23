// Bus de eventos mínimo para desacoplar módulos.
const target = new EventTarget();
export const on = (name, fn) => {
  const h = (e) => fn(e.detail);
  target.addEventListener(name, h);
  return () => target.removeEventListener(name, h);
};
export const emit = (name, detail) => target.dispatchEvent(new CustomEvent(name, { detail }));
