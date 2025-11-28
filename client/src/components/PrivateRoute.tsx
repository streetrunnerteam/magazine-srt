import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute({ children }: { children: React.ReactElement }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-gold-500">Carregando...</div>;
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
}
