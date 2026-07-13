// Tipos de saco de producción (lista fija, como los tipos de cuerda).
// El value es lo que se guarda en la BD (check constraint en producciones).
export const TIPOS_SACO = [
  { value: 'fresco_pequeno', label: 'Fresco pequeño' },
  { value: 'fresco_mediano', label: 'Fresco mediano' },
  { value: 'fresco_grande', label: 'Fresco grande' },
  { value: 'conservera', label: 'Conservera / industria' },
];

export const SACO_LABEL = Object.fromEntries(TIPOS_SACO.map((t) => [t.value, t.label]));
