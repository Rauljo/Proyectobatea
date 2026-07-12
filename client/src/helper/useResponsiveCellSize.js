import { useState, useRef, useEffect } from 'react';

const GAP = 8;
const MIN_CELL = 40; // objetivo táctil razonable en móvil
const MAX_CELL = 100; // tamaño original en escritorio

// Mide el ancho real disponible (con ResizeObserver) para que el tamaño de
// celda de una rejilla de sectores se adapte a la pantalla (móvil, escritorio,
// rotación...) en vez de basarse solo en el número de filas/columnas.
export const useResponsiveCellSize = (cols) => {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      setContainerWidth(entries[0].contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const totalGap = GAP * Math.max(0, cols - 1);
  const rawCellSize = containerWidth > 0
    ? Math.floor((containerWidth - totalGap) / cols)
    : MAX_CELL;
  const cellSize = Math.min(MAX_CELL, Math.max(MIN_CELL, rawCellSize));

  return { containerRef, cellSize, gap: GAP };
};
