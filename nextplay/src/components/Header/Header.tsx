import React from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
} from '@mui/material';
import {
    Gamepad,
} from '@mui/icons-material';

export const Header: React.FC = () => {
    return (
        <AppBar
            position="fixed"
            sx={{
                background: 'rgba(15, 20, 25, 0.95)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                zIndex: 1300,
            }}
        >
            <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
                {/* Logo */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        <Gamepad sx={{ fontSize: '2rem', color: '#667eea' }} />
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 800,
                                fontSize: { xs: '1.3rem', md: '1.5rem' },
                                letterSpacing: '-0.02em',
                            }}
                        >
                            Gameterapia
                        </Typography>
                    </Box>
                </Box>
            </Toolbar>
        </AppBar>
    );
};