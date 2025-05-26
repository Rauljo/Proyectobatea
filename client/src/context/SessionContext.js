import React, { createContext, useContext, useEffect, useState } from 'react';
import supabase from '../helper/supabase';

const SessionContext = createContext(null);

export const SessionProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Escuchar cambios en la sesión (login/logout)
    const { } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });


  }, []);

  return (
    <SessionContext.Provider value={{ session, loading }}>
      {children}
    </SessionContext.Provider>
  );
};

// Hook para usar el contexto en cualquier componente
export const useSession = () => {
  return useContext(SessionContext);
};
