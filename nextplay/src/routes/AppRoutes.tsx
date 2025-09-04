import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from '../pages/Landing/LandingPage';

export const AppRoutes: React.FC = () => {
    return (
        <Routes>
            {/* Rota principal - MVP focado */}
            <Route path="/" element={<LandingPage />} />

            {/* Rota padrão - redireciona para landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};
