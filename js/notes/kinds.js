// Tipos de nota (además de la prioridad): cada uno tiene su color (variables --k-* en css/tokens.css).
export const KINDS = [
  { id: 'personal', label: 'Personal' },
  { id: 'hospital', label: 'Hospital' },
];
export const kindLabel = (id) => KINDS.find((k) => k.id === id)?.label ?? '';
