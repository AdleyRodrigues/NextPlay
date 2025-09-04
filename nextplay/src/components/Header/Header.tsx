import React from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    Button,
    IconButton,
    Menu,
    MenuItem,
} from '@mui/material';
import {
    AccountCircle,
    Home,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

export const Header: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };



    const isActive = (path: string) => {
        return location.pathname === path;
    };

    return (
        <AppBar
            position="fixed"
            sx={{
                backgroundColor: '#1b2838',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                zIndex: 1200,
            }}
        >
            <Toolbar>
                {/* Logo */}
                <Typography
                    variant="h6"
                    component="div"
                    sx={{
                        flexGrow: 0,
                        mr: 4,
                        fontWeight: 'bold',
                        background: 'linear-gradient(45deg, #66c0f4, #4a9eff)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        cursor: 'pointer',
                    }}
                    onClick={() => navigate('/')}
                >
                    NextPlay
                </Typography>

                {/* Navigation Links - MVP simplificado */}
                <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
                    <Button
                        color="inherit"
                        startIcon={<Home />}
                        onClick={() => navigate('/')}
                        sx={{
                            backgroundColor: isActive('/') ? 'rgba(255,255,255,0.1)' : 'transparent',
                            '&:hover': {
                                backgroundColor: 'rgba(255,255,255,0.1)',
                            },
                        }}
                    >
                        NextPlay - Recomendações Steam
                    </Button>
                </Box>

                {/* User Menu */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton
                        size="large"
                        aria-label="account of current user"
                        aria-controls="menu-appbar"
                        aria-haspopup="true"
                        onClick={handleMenu}
                        color="inherit"
                    >
                        <AccountCircle />
                    </IconButton>

                    <Menu
                        id="menu-appbar"
                        anchorEl={anchorEl}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        keepMounted
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                        sx={{
                            '& .MuiPaper-root': {
                                backgroundColor: '#1b2838',
                                border: '1px solid #2a475e',
                            },
                        }}
                    >
                        <MenuItem onClick={handleClose}>
                            <AccountCircle sx={{ mr: 1 }} />
                            Sobre NextPlay
                        </MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
};
