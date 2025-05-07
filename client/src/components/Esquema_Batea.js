import React, { useState, useEffect } from 'react';

const Esquema_Batea = ({ batea, selectedCell, onCellSelect }) => {
    const rows = batea.x_sector;
    const cols = batea.y_sector;

    // Guardamos solo la celda seleccionada como [fila, columna]
    const [currentSelectedCell, setCurrentSelectedCell] = useState(selectedCell);

    // Si el selectedCell cambia, actualizamos el estado de la celda seleccionada
    useEffect(() => {
        setCurrentSelectedCell(selectedCell);
    }, [selectedCell]);

    const handleCellClick = (rowIdx, colIdx) => {
        const isAlreadySelected = currentSelectedCell?.[0] === rowIdx && currentSelectedCell?.[1] === colIdx;
        const newSelection = isAlreadySelected ? null : [rowIdx, colIdx];
        setCurrentSelectedCell(newSelection);
        onCellSelect?.(newSelection); // notificamos al componente padre
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
                        const isSelected =
                            currentSelectedCell?.[0] === rowIdx &&
                            currentSelectedCell?.[1] === colIdx;

                        return (
                            <div
                                key={`${rowIdx}-${colIdx}`}
                                onClick={() => handleCellClick(rowIdx, colIdx)}
                                style={{
                                    padding: '10px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    backgroundColor: isSelected ? '#4caf50' : '#e0e0e0',
                                    color: isSelected ? 'white' : 'black',
                                    borderRadius: '8px',
                                    userSelect: 'none',
                                    fontWeight: 'bold',
                                }}
                            >
                                {rowIdx + 1} - {colIdx + 1}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default Esquema_Batea;
