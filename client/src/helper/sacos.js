// Tipos de producción (lista fija). El value es lo que se guarda en la BD
// (check constraint en producciones). Todos se miden en sacos salvo
// "fabrica", que se vende por kg directo (unidad: 'kg').
export const KG_POR_SACO = 10;

export const TIPOS_SACO = [
  { value: 'grande', label: 'Grande', unidad: 'saco' },
  { value: 'normal_fresco', label: 'Normal fresco', unidad: 'saco' },
  { value: 'pequeno_fresco', label: 'Pequeño fresco', unidad: 'saco' },
  { value: 'pequeno_exportacion', label: 'Pequeño exportación', unidad: 'saco' },
  { value: 'dop', label: 'DOP', unidad: 'saco' },
  { value: 'reparcado', label: 'Reparcado', unidad: 'saco' },
  { value: 'fabrica', label: 'Fábrica', unidad: 'kg' },
];

export const SACO_LABEL = Object.fromEntries(TIPOS_SACO.map((t) => [t.value, t.label]));
export const SACO_UNIDAD = Object.fromEntries(TIPOS_SACO.map((t) => [t.value, t.unidad]));

// Kg reales de una línea de producción: cantidad ya es kg para "fabrica",
// y cantidad * 10 (sacos) para el resto.
export const kgFor = (tipo, cantidad) =>
  SACO_UNIDAD[tipo] === 'kg' ? cantidad : cantidad * KG_POR_SACO;
