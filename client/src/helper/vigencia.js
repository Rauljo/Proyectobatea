// Formatea un interval de Postgres (now() - fecha) como "X meses Y días".
// Horas/minutos/segundos se ignoran a propósito: no aportan valor para decidir
// si una cuerda lleva demasiado tiempo en la batea.
export const formatVigencia = (vigencia) => {
  if (!vigencia) return '';

  const totalDays = vigencia.days ?? 0;
  const months = Math.floor(totalDays / 30);
  const days = totalDays % 30;

  return `${months}m ${days}d`;
};

export const vigenciaDays = (vigencia) => vigencia?.days ?? 0;

// Severidad de una cuerda respecto al umbral de su tipo (en meses, 1 mes = 30 días):
// 'ok' por debajo del umbral, 'atencion' pasada de plazo, 'urgente' si lleva
// más de un mes pasada de plazo.
export const getSeveridad = (vigencia, umbralMeses) => {
  const days = vigenciaDays(vigencia);
  const umbralDays = umbralMeses * 30;

  if (days < umbralDays) return 'ok';
  if (days < umbralDays + 30) return 'atencion';
  return 'urgente';
};
