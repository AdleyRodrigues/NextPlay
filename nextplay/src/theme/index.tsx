import { createTheme, ThemeProvider } from '@mui/material/styles';
import React, { type ReactNode } from 'react';

const theme = createTheme({
    palette: {
        mode: 'dark',
    },
});

export const AppThemeProvider = ({ children }: { children: ReactNode }) => {
    return React.createElement(ThemeProvider, { theme: theme }, children);
};

export const useTheme = () => {
    return {
        isDarkMode: true,
        toggleTheme: () => { },
    };
};