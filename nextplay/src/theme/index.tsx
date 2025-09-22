import { createTheme, ThemeProvider } from '@mui/material/styles';
import React, { type ReactNode } from 'react';

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#667eea',
            light: '#5a67d8',
            dark: '#4c51bf',
        },
        secondary: {
            main: '#764ba2',
            light: '#6b46c1',
            dark: '#553c9a',
        },
        background: {
            default: '#0f1419',
            paper: '#1a1f2e',
        },
        text: {
            primary: '#ffffff',
            secondary: '#a0aec0',
        },
    },
    typography: {
        fontFamily: '"Inter", "Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontWeight: 800,
            fontSize: '3.5rem',
            lineHeight: 1.2,
        },
        h2: {
            fontWeight: 700,
            fontSize: '2.5rem',
            lineHeight: 1.3,
        },
        h3: {
            fontWeight: 700,
            fontSize: '2rem',
            lineHeight: 1.3,
        },
        h4: {
            fontWeight: 600,
            fontSize: '1.5rem',
            lineHeight: 1.4,
        },
        h5: {
            fontWeight: 600,
            fontSize: '1.25rem',
            lineHeight: 1.4,
        },
        h6: {
            fontWeight: 600,
            fontSize: '1.1rem',
            lineHeight: 1.4,
        },
        body1: {
            fontSize: '1rem',
            lineHeight: 1.6,
        },
        body2: {
            fontSize: '0.875rem',
            lineHeight: 1.5,
        },
        button: {
            fontWeight: 600,
            textTransform: 'none',
        },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 600,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        transform: 'translateY(-1px)',
                    },
                },
                contained: {
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    '&:hover': {
                        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.25)',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: '16px',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                    fontWeight: 500,
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: '20px',
                },
            },
        },
        MuiLinearProgress: {
            styleOverrides: {
                root: {
                    borderRadius: '6px',
                },
            },
        },
    },
});

export const AppThemeProvider = ({ children }: { children: ReactNode }) => {
    return React.createElement(ThemeProvider, { theme: theme }, children);
};

// export const useTheme = () => {
//     return {
//         isDarkMode: true,
//         toggleTheme: () => { },
//     };
// };