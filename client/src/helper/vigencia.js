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
