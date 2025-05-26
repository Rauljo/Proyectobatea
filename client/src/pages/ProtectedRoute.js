import React, { useState, useEffect } from 'react';
import supabase from '../helper/supabase';
import { useNavigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(!!session);
            setLoading(false);
        }

        getSession();
    }
    , []);

    if (loading) {
        return <div>Loading...</div>; // You can replace this with a spinner or loading component
    }

    if (!session) {
        navigate('/login'); // Redirect to login if not authenticated
        return <div>You must be logged in to view this page.</div>; // Redirect to login or show a message
    }

    return (
        <div>
            {children}
        </div>
    );
}

export default ProtectedRoute;