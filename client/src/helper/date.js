// Fecha local en formato YYYY-MM-DD. A diferencia de
// `date.toISOString().split('T')[0]`, no se desplaza al día anterior cuando
// la zona horaria local va por delante de UTC (p.ej. España de madrugada).
export const toLocalDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
