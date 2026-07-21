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

// Color continuo (verde -> rojo) según la edad real respecto al umbral de su
// tipo, en vez de 3 cortes discretos: se nota la progresión incluso antes de
// pasarse de plazo. ratio 0 = recién entrada, 1 = justo en el umbral, 1.5 =
// tres meses pasada de plazo (a partir de ahí, tope en rojo).
const gradientRatio = (days, umbralMeses) => Math.min(1.5, days / (umbralMeses * 30));

export const gradientColorFor = (days, umbralMeses) => {
  const hue = 132 - (132 / 1.5) * gradientRatio(days, umbralMeses);
  return `hsl(${hue.toFixed(0)} 55% 76%)`;
};

export const gradientInkFor = (days, umbralMeses) => {
  const hue = 132 - (132 / 1.5) * gradientRatio(days, umbralMeses);
  return `hsl(${hue.toFixed(0)} 60% 24%)`;
};
