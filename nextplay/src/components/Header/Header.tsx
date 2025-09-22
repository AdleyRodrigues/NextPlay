import React, { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    Chip,
    Box,
    Fade,
} from '@mui/material';
import {
    ExitToApp,
    Public,
    Info,
    Gamepad,
} from '@mui/icons-material';
import { useSteam } from '../../context/SteamContext';

export const Header: React.FC = () => {
    const { steamId64, playerInfo, setSteamId64, setPlayerInfo } = useSteam();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setMobileMenuAnchor(event.currentTarget);
    };

    const handleMobileMenuClose = () => {
        setMobileMenuAnchor(null);
    };

    const handleLogout = () => {
        setSteamId64('');
        setPlayerInfo(null);
        localStorage.removeItem('steamId64');
        localStorage.removeItem('playerInfo');
        handleMenuClose();
        handleMobileMenuClose();
    };

    const handleViewSteamProfile = () => {
        if (playerInfo?.steamId64) {
            window.open(`https://steamcommunity.com/profiles/${playerInfo.steamId64}`, '_blank');
        }
        handleMenuClose();
        handleMobileMenuClose();
    };

    const isMenuOpen = Boolean(anchorEl);
    const isMobileMenuOpen = Boolean(mobileMenuAnchor);

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
                            NextPlay
                        </Typography>
                    </Box>
                </Box>

                {/* User Profile Section */}
                {steamId64 && playerInfo ? (
                    <Fade in timeout={500}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {/* User Info */}
                            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2 }}>
                                <Box sx={{ textAlign: 'right' }}>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            color: '#ffffff',
                                            fontWeight: 600,
                                            fontSize: '0.9rem',
                                        }}
                                    >
                                        {playerInfo.personaName}
                                    </Typography>
                                    <Chip
                                        label={playerInfo.isOnline ? 'Online' : 'Offline'}
                                        size="small"
                                        sx={{
                                            backgroundColor: playerInfo.isOnline ? '#48bb78' : '#a0aec0',
                                            color: '#ffffff',
                                            fontWeight: 600,
                                            fontSize: '0.7rem',
                                            height: 20,
                                        }}
                                    />
                                </Box>
                                <Avatar
                                    src={playerInfo.avatar}
                                    onClick={handleMenuOpen}
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        border: '2px solid #667eea',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease-in-out',
                                        '&:hover': {
                                            transform: 'scale(1.1)',
                                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                                        },
                                    }}
                                />
                            </Box>

                            {/* Mobile Avatar */}
                            <Avatar
                                src={playerInfo.avatar}
                                onClick={handleMobileMenuOpen}
                                sx={{
                                    width: 40,
                                    height: 40,
                                    border: '2px solid #667eea',
                                    cursor: 'pointer',
                                    display: { xs: 'flex', md: 'none' },
                                    transition: 'all 0.2s ease-in-out',
                                    '&:hover': {
                                        transform: 'scale(1.1)',
                                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                                    },
                                }}
                            />

                            {/* Desktop Menu */}
                            <Menu
                                anchorEl={anchorEl}
                                open={isMenuOpen}
                                onClose={handleMenuClose}
                                PaperProps={{
                                    sx: {
                                        background: 'rgba(26, 31, 46, 0.95)',
                                        backdropFilter: 'blur(20px)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '16px',
                                        mt: 1,
                                        minWidth: 200,
                                    },
                                }}
                                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                            >
                                <MenuItem
                                    onClick={handleViewSteamProfile}
                                    sx={{
                                        color: '#ffffff',
                                        '&:hover': {
                                            backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                        },
                                    }}
                                >
                                    <Public sx={{ mr: 2, fontSize: '1.2rem' }} />
                                    Ver Perfil Steam
                                </MenuItem>
                                <MenuItem
                                    onClick={handleLogout}
                                    sx={{
                                        color: '#e53e3e',
                                        '&:hover': {
                                            backgroundColor: 'rgba(229, 62, 62, 0.1)',
                                        },
                                    }}
                                >
                                    <ExitToApp sx={{ mr: 2, fontSize: '1.2rem' }} />
                                    Desconectar
                                </MenuItem>
                            </Menu>

                            {/* Mobile Menu */}
                            <Menu
                                anchorEl={mobileMenuAnchor}
                                open={isMobileMenuOpen}
                                onClose={handleMobileMenuClose}
                                PaperProps={{
                                    sx: {
                                        background: 'rgba(26, 31, 46, 0.95)',
                                        backdropFilter: 'blur(20px)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '16px',
                                        mt: 1,
                                        minWidth: 200,
                                    },
                                }}
                                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                            >
                                <Box sx={{ px: 2, py: 1, borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                    <Typography variant="body2" sx={{ color: '#a0aec0', fontSize: '0.8rem' }}>
                                        {playerInfo.personaName}
                                    </Typography>
                                    <Chip
                                        label={playerInfo.isOnline ? 'Online' : 'Offline'}
                                        size="small"
                                        sx={{
                                            backgroundColor: playerInfo.isOnline ? '#48bb78' : '#a0aec0',
                                            color: '#ffffff',
                                            fontWeight: 600,
                                            fontSize: '0.7rem',
                                            height: 20,
                                            mt: 0.5,
                                        }}
                                    />
                                </Box>
                                <MenuItem
                                    onClick={handleViewSteamProfile}
                                    sx={{
                                        color: '#ffffff',
                                        '&:hover': {
                                            backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                        },
                                    }}
                                >
                                    <Public sx={{ mr: 2, fontSize: '1.2rem' }} />
                                    Ver Perfil Steam
                                </MenuItem>
                                <MenuItem
                                    onClick={handleLogout}
                                    sx={{
                                        color: '#e53e3e',
                                        '&:hover': {
                                            backgroundColor: 'rgba(229, 62, 62, 0.1)',
                                        },
                                    }}
                                >
                                    <ExitToApp sx={{ mr: 2, fontSize: '1.2rem' }} />
                                    Desconectar
                                </MenuItem>
                            </Menu>
                        </Box>
                    </Fade>
                ) : (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                            variant="body2"
                            sx={{
                                color: '#a0aec0',
                                fontSize: '0.8rem',
                                display: { xs: 'none', sm: 'block' },
                            }}
                        >
                            Conecte sua Steam para começar
                        </Typography>
                        <IconButton
                            color="inherit"
                            sx={{
                                color: '#a0aec0',
                                '&:hover': {
                                    color: '#667eea',
                                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                },
                            }}
                        >
                            <Info />
                        </IconButton>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
};