import { getSectorId } from '../helper/sector';


const EsquemaBatea = ({ batea, selectedCells = [], onToggleCell }) => {
    const rows = batea.row_sector;
    const cols = batea.col_sector;

    const isSelected = (rowIdx, colIdx) =>
        selectedCells.some(([r, c]) => r === rowIdx && c === colIdx);

    const handleCellClick = (rowIdx, colIdx) => {
        onToggleCell?.([rowIdx, colIdx]); // el padre gestiona añadir/quitar
    };

    return (
        <div>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${cols}, 100px)`,
                    gap: '10px',
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
                                    padding: '10px',
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
