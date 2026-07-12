import { getSectorId } from '../helper/sector';
import { useResponsiveCellSize } from '../helper/useResponsiveCellSize';

const EsquemaBatea = ({ batea, selectedCells = [], onToggleCell }) => {
    const rows = batea.row_sector;
    const cols = batea.col_sector;

    const { containerRef, cellSize, gap } = useResponsiveCellSize(cols);

    const isSelected = (rowIdx, colIdx) =>
        selectedCells.some(([r, c]) => r === rowIdx && c === colIdx);

    const handleCellClick = (rowIdx, colIdx) => {
        onToggleCell?.([rowIdx, colIdx]); // el padre gestiona añadir/quitar
    };

    return (
        // Si aun así no caben todas las columnas (raft con muchas columnas en
        // pantallas pequeñas), este contenedor hace scroll horizontal solo del
        // esquema, sin afectar al resto de la página.
        <div ref={containerRef} style={{ maxWidth: '100%', overflowX: 'auto' }}>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
                    gap: `${gap}px`,
                    marginTop: '20px',
                }}
            >
                {Array.from({ length: rows }).map((_, rowIdx) =>
                    Array.from({ length: cols }).map((_, colIdx) => {
                        const selected = isSelected(rowIdx, colIdx);

                        return (
                            <div
                                key={`${rowIdx}-${colIdx}`}
                                onClick={() => handleCellClick(rowIdx, colIdx)}
                                style={{
                                    padding: '10px 4px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    backgroundColor: selected ? '#4caf50' : '#e0e0e0',
                                    color: selected ? 'white' : 'black',
                                    borderRadius: '8px',
                                    userSelect: 'none',
                                    fontWeight: 'bold',
                                }}
                            >
                                {getSectorId(rowIdx, colIdx, cols)}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default EsquemaBatea;
