import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Paper, Alert, Avatar } from '@mui/material';
import { SportsEsports, PlayArrow } from '@mui/icons-material';
import { useSteam } from '../../hooks/useSteam';

export const OnboardingPage = () => {
    const navigate = useNavigate();
    const { setSteamId64 } = useSteam();
    const [steamId, setSteamId] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validação básica do Steam ID
        if (!steamId.trim()) {
            setError('Por favor, insira seu Steam ID');
            return;
        }

        // Steam ID deve ter 17 dígitos
        if (!/^\d{17}$/.test(steamId.trim())) {
            setError('Steam ID deve ter exatamente 17 dígitos');
            return;
        }

        // Salvar Steam ID e navegar para a página principal
        setSteamId64(steamId.trim());
        navigate('/');
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #1b2838 0%, #2a475e 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 3,
            }}
        >
            <Paper
                sx={{
                    maxWidth: 500,
                    width: '100%',
                    p: 4,
                    background: 'linear-gradient(135deg, #2a475e 0%, #1b2838 100%)',
                    border: '2px solid #66c0f4',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                }}
            >
                {/* Header */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Avatar
                        sx={{
                            width: 80,
                            height: 80,
                            bgcolor: '#66c0f4',
                            color: '#1b2838',
                            fontSize: '2rem',
                            fontWeight: 700,
                            mx: 'auto',
                            mb: 2,
                        }}
                    >
                        <SportsEsports />
                    </Avatar>
                    <Typography
                        variant="h3"
                        sx={{
                            fontWeight: 700,
                            color: '#ffffff',
                            mb: 1,
                            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                        }}
                    >
                        Bem-vindo ao NextPlay
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            color: '#c7d5e0',
                            fontSize: '1.1rem',
                        }}
                    >
                        Conecte sua conta Steam para começar
                    </Typography>
                </Box>

                {/* Form */}
                <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
                    {error && (
                        <Alert
                            severity="error"
                            sx={{
                                mb: 3,
                                backgroundColor: 'rgba(255, 68, 68, 0.1)',
                                border: '1px solid #ff4444',
                                color: '#ff4444',
                            }}
                        >
                            {error}
                        </Alert>
                    )}

                    <TextField
                        fullWidth
                        label="Steam ID (64-bit)"
                        value={steamId}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSteamId(e.target.value)}
                        placeholder="Ex: 76561198012345678"
                        sx={{
                            mb: 3,
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: 'rgba(26, 40, 56, 0.8)',
                                border: '1px solid #66c0f4',
                                borderRadius: '8px',
                                '& fieldset': {
                                    borderColor: 'transparent',
                                },
                                '&:hover fieldset': {
                                    borderColor: '#8ed8ff',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#66c0f4',
                                },
                            },
                            '& .MuiInputLabel-root': {
                                color: '#c7d5e0',
                                '&.Mui-focused': {
                                    color: '#66c0f4',
                                },
                            },
                            '& .MuiInputBase-input': {
                                color: '#ffffff',
                                fontSize: '1rem',
                            },
                        }}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        startIcon={<PlayArrow />}
                        sx={{
                            backgroundColor: '#66c0f4',
                            color: '#1b2838',
                            fontWeight: 700,
                            fontSize: '1.1rem',
                            py: 1.5,
                            borderRadius: '8px',
                            textTransform: 'none',
                            '&:hover': {
                                backgroundColor: '#8ed8ff',
                            },
                        }}
                    >
                        Conectar Steam
                    </Button>
                </Box>

                {/* Info */}
                <Box sx={{ textAlign: 'center' }}>
                    <Typography
                        variant="body2"
                        sx={{
                            color: '#c7d5e0',
                            fontSize: '0.9rem',
                            lineHeight: 1.5,
                        }}
                    >
                        Não sabe seu Steam ID?{' '}
                        <a
                            href="https://steamidfinder.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                color: '#66c0f4',
                                textDecoration: 'none',
                                fontWeight: 600,
                            }}
                        >
                            Clique aqui para descobrir
                        </a>
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
};
