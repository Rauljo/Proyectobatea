import React, { createContext, useContext, useState } from 'react';

const SelectedBateaContext = createContext(null);

// Comparte qué batea está seleccionada entre páginas (Inserción, Visualización...)
// para que no haya que volver a elegirla al navegar de una a otra.
export const SelectedBateaProvider = ({ children }) => {
  const [selectedBatea, setSelectedBatea] = useState(null);

  return (
    <SelectedBateaContext.Provider value={{ selectedBatea, setSelectedBatea }}>
      {children}
    </SelectedBateaContext.Provider>
  );
};

export const useSelectedBatea = () => useContext(SelectedBateaContext);
