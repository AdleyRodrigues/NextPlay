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
import * as S from './Header.styles';

export const Header: React.FC = () => {
    return (
        <AppBar position="fixed" sx={S.appBar}>
            <Toolbar sx={S.toolbar}>
                {/* Logo */}
                <Box sx={S.logoContainer}>
                    <Box sx={S.logoWrapper}>
                        <Gamepad sx={S.logoIcon} />
                        <Typography variant="h5" sx={S.logoText}>
                            Gameterapia
                        </Typography>
                    </Box>
                </Box>
            </Toolbar>
        </AppBar>
    );
};