import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Switch,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
    Card,
    CardContent,
    Avatar,
    Container,
} from '@mui/material';
import {
    Logout,
    Delete,
    Person,
    Palette,
    Notifications,
    Security,
    History,
    SportsEsports,
    Brightness4,
    Brightness7,
    FilterList,
} from '@mui/icons-material';
import { useSteam } from '../../context/SteamContext';
// import { useTheme } from '../../theme/index';
import { useToast } from '../../hooks/useToast';

export const SettingsPage = () => {
    const navigate = useNavigate();
    const { steamId64, setSteamId64 } = useSteam();
    // const { isDarkMode, toggleTheme } = useTheme();
    const isDarkMode = true;
    const toggleTheme = () => { };
    const { showToast } = useToast();

    // Estados para configurações
    const [settings, setSettings] = useState({
        notifications: true,
        autoRefresh: false,
        showSpoilers: false,
        language: 'pt-BR',
        maxRecommendations: 12,
        filterRemember: true,
        soundEffects: true,
        compactView: false,
        adultContent: false,
        privacyMode: false,
    });

    const handleSettingChange = (setting: keyof typeof settings, value: any) => {
        setSettings(prev => ({ ...prev, [setting]: value }));
        showToast(`Configuração "${setting}" atualizada!`, 'success');
    };

    const handleLogout = () => {
        setSteamId64(null);
        navigate('/onboarding');
        showToast('Logout realizado com sucesso!', 'info');
    };

    const handleDeleteAccount = () => {
        if (window.confirm('⚠️ ATENÇÃO: Tem certeza que deseja excluir todos os seus dados? Esta ação NÃO pode ser desfeita!\n\nSerão removidos:\n• Histórico de recomendações\n• Preferências salvas\n• Feedback de jogos\n• Configurações personalizadas')) {
            setSteamId64(null);
            localStorage.clear();
            navigate('/onboarding');
            showToast('Conta excluída com sucesso!', 'info');
        }
    };

    const handleClearHistory = () => {
        if (window.confirm('Deseja limpar todo o histórico de recomendações? Esta ação não pode ser desfeita.')) {
            // Implementar lógica de limpeza de histórico
            showToast('Histórico limpo com sucesso!', 'success');
        }
    };

    const handleExportData = () => {
        // Simular exportação de dados
        const data = {
            steamId: steamId64,
            settings,
            exportDate: new Date().toISOString(),
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nextplay-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Dados exportados com sucesso!', 'success');
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #1b2838 0%, #2a475e 100%)',
                pt: 2,
                pb: 4,
            }}
        >
            <Container maxWidth="lg">
                {/* Header da página */}
                <Box sx={{ mb: 4 }}>
                    <Typography
                        variant="h3"
                        sx={{
                            color: '#ffffff',
                            fontWeight: 700,
                            mb: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                        }}
                    >
                        <Box
                            sx={{
                                width: 60,
                                height: 60,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #66c0f4 0%, #8ed8ff 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Person sx={{ fontSize: 32, color: '#1b2838' }} />
                        </Box>
                        Configurações
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#c7d5e0' }}>
                        Personalize sua experiência no NextPlay
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    {/* Perfil do Usuário */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Card
                            sx={{
                                background: 'linear-gradient(135deg, #2a475e 0%, #1b2838 100%)',
                                border: '1px solid #66c0f4',
                                borderRadius: 3,
                                height: '100%',
                                transition: 'all 0.3s ease-in-out',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 8px 25px rgba(102, 192, 244, 0.3)',
                                    borderColor: '#8ed8ff',
                                }
                            }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" sx={{ color: '#ffffff', mb: 3, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
                                    <Person sx={{ color: '#66c0f4', fontSize: 24 }} />
                                    Perfil Steam
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                                    <Box
                                        sx={{
                                            position: 'relative',
                                            '&::before': {
                                                content: '""',
                                                position: 'absolute',
                                                top: -4,
                                                left: -4,
                                                right: -4,
                                                bottom: -4,
                                                background: 'linear-gradient(45deg, #66c0f4, #8ed8ff)',
                                                borderRadius: '50%',
                                                zIndex: 0,
                                                opacity: 0.8,
                                            }
                                        }}
                                    >
                                        <Avatar sx={{
                                            bgcolor: '#66c0f4',
                                            width: 64,
                                            height: 64,
                                            position: 'relative',
                                            zIndex: 1,
                                            boxShadow: '0 4px 12px rgba(102, 192, 244, 0.4)'
                                        }}>
                                            <SportsEsports sx={{ fontSize: 32, color: '#1b2838' }} />
                                        </Avatar>
                                    </Box>
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography variant="body2" sx={{ color: '#c7d5e0', mb: 0.5, fontSize: '0.85rem', opacity: 0.8 }}>
                                            Conectado como
                                        </Typography>
                                        <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 600, mb: 0.5 }}>
                                            Steam User
                                        </Typography>
                                        <Typography variant="body2" sx={{
                                            color: '#66c0f4',
                                            fontFamily: 'monospace',
                                            fontSize: '0.9rem',
                                            background: 'rgba(102, 192, 244, 0.1)',
                                            padding: '4px 8px',
                                            borderRadius: 1,
                                            display: 'inline-block'
                                        }}>
                                            ID: {steamId64?.slice(0, 8)}...
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => window.open(`https://steamcommunity.com/profiles/${steamId64}`, '_blank')}
                                        sx={{
                                            borderColor: '#66c0f4',
                                            color: '#66c0f4',
                                            fontSize: '0.8rem',
                                            px: 2,
                                            py: 0.5,
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                backgroundColor: 'rgba(102, 192, 244, 0.15)',
                                                borderColor: '#8ed8ff',
                                                transform: 'scale(1.05)',
                                            }
                                        }}
                                    >
                                        Ver Perfil
                                    </Button>
                                    <Button
                                        variant="text"
                                        size="small"
                                        onClick={() => navigator.clipboard.writeText(steamId64 || '')}
                                        sx={{
                                            color: '#c7d5e0',
                                            fontSize: '0.8rem',
                                            px: 2,
                                            py: 0.5,
                                            '&:hover': {
                                                backgroundColor: 'rgba(199, 213, 224, 0.1)',
                                                color: '#ffffff',
                                            }
                                        }}
                                    >
                                        Copiar ID
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Aparência */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Card
                            sx={{
                                background: 'linear-gradient(135deg, #2a475e 0%, #1b2838 100%)',
                                border: '1px solid #66c0f4',
                                borderRadius: 3,
                                height: '100%',
                                transition: 'all 0.3s ease-in-out',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 8px 25px rgba(102, 192, 244, 0.3)',
                                    borderColor: '#8ed8ff',
                                }
                            }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" sx={{ color: '#ffffff', mb: 3, display: 'flex', alignItems: 'center', gap: 1, fontWeight: 700 }}>
                                    <Palette sx={{ color: '#66c0f4', fontSize: 24 }} />
                                    Aparência
                                </Typography>

                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    mb: 3,
                                    p: 2,
                                    borderRadius: 2,
                                    background: 'rgba(102, 192, 244, 0.05)',
                                    border: '1px solid rgba(102, 192, 244, 0.2)',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        background: 'rgba(102, 192, 244, 0.1)',
                                        borderColor: 'rgba(102, 192, 244, 0.3)',
                                    }
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{
                                            p: 1,
                                            borderRadius: '50%',
                                            background: isDarkMode ? 'rgba(102, 192, 244, 0.2)' : 'rgba(255, 193, 7, 0.2)',
                                            transition: 'all 0.3s ease'
                                        }}>
                                            {isDarkMode ?
                                                <Brightness4 sx={{ color: '#66c0f4', fontSize: 20 }} /> :
                                                <Brightness7 sx={{ color: '#ffc107', fontSize: 20 }} />
                                            }
                                        </Box>
                                        <Box>
                                            <Typography sx={{ color: '#ffffff', fontWeight: 600, fontSize: '0.95rem' }}>
                                                {isDarkMode ? 'Tema Escuro' : 'Tema Claro'}
                                            </Typography>
                                            <Typography sx={{ color: '#c7d5e0', fontSize: '0.8rem' }}>
                                                {isDarkMode ? 'Interface escura para ambientes com pouca luz' : 'Interface clara para melhor visibilidade'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Switch
                                        checked={isDarkMode}
                                        onChange={toggleTheme}
                                        color="primary"
                                        sx={{
                                            '& .MuiSwitch-switchBase.Mui-checked': {
                                                color: '#66c0f4',
                                                '& + .MuiSwitch-track': {
                                                    backgroundColor: '#66c0f4',
                                                },
                                            },
                                            '& .MuiSwitch-track': {
                                                backgroundColor: '#ffc107',
                                            }
                                        }}
                                    />
                                </Box>

                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    mb: 3,
                                    p: 2,
                                    borderRadius: 2,
                                    background: 'rgba(102, 192, 244, 0.05)',
                                    border: '1px solid rgba(102, 192, 244, 0.2)',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        background: 'rgba(102, 192, 244, 0.1)',
                                        borderColor: 'rgba(102, 192, 244, 0.3)',
                                    }
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{
                                            p: 1,
                                            borderRadius: '50%',
                                            background: settings.compactView ? 'rgba(102, 192, 244, 0.2)' : 'rgba(199, 213, 224, 0.1)',
                                            transition: 'all 0.3s ease'
                                        }}>
                                            <FilterList sx={{ color: settings.compactView ? '#66c0f4' : '#c7d5e0', fontSize: 20 }} />
                                        </Box>
                                        <Box>
                                            <Typography sx={{ color: '#ffffff', fontWeight: 600, fontSize: '0.95rem' }}>
                                                Vista Compacta
                                            </Typography>
                                            <Typography sx={{ color: '#c7d5e0', fontSize: '0.8rem' }}>
                                                Interface mais densa com menos espaçamento
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <Switch
                                        checked={settings.compactView}
                                        onChange={(e) => handleSettingChange('compactView', e.target.checked)}
                                        color="primary"
                                        sx={{
                                            '& .MuiSwitch-switchBase.Mui-checked': {
                                                color: '#66c0f4',
                                                '& + .MuiSwitch-track': {
                                                    backgroundColor: '#66c0f4',
                                                },
                                            },
                                        }}
                                    />
                                </Box>

                                <Box sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    background: 'rgba(102, 192, 244, 0.05)',
                                    border: '1px solid rgba(102, 192, 244, 0.2)',
                                }}>
                                    <Typography sx={{ color: '#ffffff', fontWeight: 600, mb: 1, fontSize: '0.95rem' }}>
                                        Máximo de Recomendações
                                    </Typography>
                                    <Typography sx={{ color: '#c7d5e0', fontSize: '0.8rem', mb: 2 }}>
                                        Quantos jogos mostrar por vez na página inicial
                                    </Typography>
                                    <FormControl fullWidth>
                                        <Select
                                            value={settings.maxRecommendations}
                                            onChange={(e) => handleSettingChange('maxRecommendations', e.target.value)}
                                            displayEmpty
                                            sx={{
                                                color: '#ffffff',
                                                background: 'rgba(27, 40, 56, 0.5)',
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: 'rgba(102, 192, 244, 0.3)',
                                                },
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#66c0f4',
                                                },
                                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#8ed8ff',
                                                },
                                                '& .MuiSelect-icon': {
                                                    color: '#66c0f4',
                                                }
                                            }}
                                        >
                                            <MenuItem value={6} sx={{ color: '#1b2838' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography>🎯</Typography>
                                                    <Typography>6 jogos - Seleção focada</Typography>
                                                </Box>
                                            </MenuItem>
                                            <MenuItem value={12} sx={{ color: '#1b2838' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography>⚖️</Typography>
                                                    <Typography>12 jogos - Padrão balanceado</Typography>
                                                </Box>
                                            </MenuItem>
                                            <MenuItem value={18} sx={{ color: '#1b2838' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography>📚</Typography>
                                                    <Typography>18 jogos - Mais opções</Typography>
                                                </Box>
                                            </MenuItem>
                                            <MenuItem value={24} sx={{ color: '#1b2838' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography>🌊</Typography>
                                                    <Typography>24 jogos - Exploração máxima</Typography>
                                                </Box>
                                            </MenuItem>
                                        </Select>
                                    </FormControl>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Notificações e Comportamento */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Card
                            sx={{
                                background: 'linear-gradient(135deg, #2a475e 0%, #1b2838 100%)',
                                border: '1px solid #66c0f4',
                                borderRadius: 3,
                                height: '100%',
                                transition: 'all 0.3s ease-in-out',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 8px 25px rgba(102, 192, 244, 0.3)',
                                    borderColor: '#8ed8ff',
                                }
                            }}
                        >
                            <CardContent>
                                <Typography variant="h6" sx={{ color: '#ffffff', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Notifications sx={{ color: '#66c0f4' }} />
                                    Notificações
                                </Typography>

                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography sx={{ color: '#c7d5e0' }}>Notificações do Sistema</Typography>
                                    <Switch
                                        checked={settings.notifications}
                                        onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                                        color="primary"
                                        sx={{
                                            '& .MuiSwitch-switchBase.Mui-checked': {
                                                color: '#66c0f4',
                                                '& + .MuiSwitch-track': {
                                                    backgroundColor: '#66c0f4',
                                                },
                                            },
                                        }}
                                    />
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography sx={{ color: '#c7d5e0' }}>Efeitos Sonoros</Typography>
                                    <Switch
                                        checked={settings.soundEffects}
                                        onChange={(e) => handleSettingChange('soundEffects', e.target.checked)}
                                        color="primary"
                                        sx={{
                                            '& .MuiSwitch-switchBase.Mui-checked': {
                                                color: '#66c0f4',
                                                '& + .MuiSwitch-track': {
                                                    backgroundColor: '#66c0f4',
                                                },
                                            },
                                        }}
                                    />
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography sx={{ color: '#c7d5e0' }}>Lembrar Filtros</Typography>
                                    <Switch
                                        checked={settings.filterRemember}
                                        onChange={(e) => handleSettingChange('filterRemember', e.target.checked)}
                                        color="primary"
                                        sx={{
                                            '& .MuiSwitch-switchBase.Mui-checked': {
                                                color: '#66c0f4',
                                                '& + .MuiSwitch-track': {
                                                    backgroundColor: '#66c0f4',
                                                },
                                            },
                                        }}
                                    />
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Typography sx={{ color: '#c7d5e0' }}>Atualização Automática</Typography>
                                    <Switch
                                        checked={settings.autoRefresh}
                                        onChange={(e) => handleSettingChange('autoRefresh', e.target.checked)}
                                        color="primary"
                                        sx={{
                                            '& .MuiSwitch-switchBase.Mui-checked': {
                                                color: '#66c0f4',
                                                '& + .MuiSwitch-track': {
                                                    backgroundColor: '#66c0f4',
                                                },
                                            },
                                        }}
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Privacidade e Conteúdo */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Card
                            sx={{
                                background: 'linear-gradient(135deg, #2a475e 0%, #1b2838 100%)',
                                border: '1px solid #66c0f4',
                                borderRadius: 3,
                                height: '100%',
                                transition: 'all 0.3s ease-in-out',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 8px 25px rgba(102, 192, 244, 0.3)',
                                    borderColor: '#8ed8ff',
                                }
                            }}
                        >
                            <CardContent>
                                <Typography variant="h6" sx={{ color: '#ffffff', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Security sx={{ color: '#66c0f4' }} />
                                    Privacidade
                                </Typography>

                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography sx={{ color: '#c7d5e0' }}>Conteúdo Adulto</Typography>
                                    <Switch
                                        checked={settings.adultContent}
                                        onChange={(e) => handleSettingChange('adultContent', e.target.checked)}
                                        color="primary"
                                        sx={{
                                            '& .MuiSwitch-switchBase.Mui-checked': {
                                                color: '#66c0f4',
                                                '& + .MuiSwitch-track': {
                                                    backgroundColor: '#66c0f4',
                                                },
                                            },
                                        }}
                                    />
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography sx={{ color: '#c7d5e0' }}>Mostrar Spoilers</Typography>
                                    <Switch
                                        checked={settings.showSpoilers}
                                        onChange={(e) => handleSettingChange('showSpoilers', e.target.checked)}
                                        color="primary"
                                        sx={{
                                            '& .MuiSwitch-switchBase.Mui-checked': {
                                                color: '#66c0f4',
                                                '& + .MuiSwitch-track': {
                                                    backgroundColor: '#66c0f4',
                                                },
                                            },
                                        }}
                                    />
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                                    <Typography sx={{ color: '#c7d5e0' }}>Modo Privado</Typography>
                                    <Switch
                                        checked={settings.privacyMode}
                                        onChange={(e) => handleSettingChange('privacyMode', e.target.checked)}
                                        color="primary"
                                        sx={{
                                            '& .MuiSwitch-switchBase.Mui-checked': {
                                                color: '#66c0f4',
                                                '& + .MuiSwitch-track': {
                                                    backgroundColor: '#66c0f4',
                                                },
                                            },
                                        }}
                                    />
                                </Box>

                                <FormControl fullWidth>
                                    <InputLabel sx={{ color: '#c7d5e0' }}>Idioma</InputLabel>
                                    <Select
                                        value={settings.language}
                                        onChange={(e) => handleSettingChange('language', e.target.value)}
                                        label="Idioma"
                                        sx={{
                                            color: '#ffffff',
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#66c0f4',
                                            },
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#8ed8ff',
                                            },
                                        }}
                                    >
                                        <MenuItem value="pt-BR">🇧🇷 Português (Brasil)</MenuItem>
                                        <MenuItem value="en-US">🇺🇸 English (US)</MenuItem>
                                        <MenuItem value="es-ES">🇪🇸 Español</MenuItem>
                                    </Select>
                                </FormControl>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Gerenciar Dados */}
                    <Grid size={{ xs: 12 }}>
                        <Card
                            sx={{
                                background: 'linear-gradient(135deg, #2a475e 0%, #1b2838 100%)',
                                border: '1px solid #66c0f4',
                                borderRadius: 3,
                                transition: 'all 0.3s ease-in-out',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 8px 25px rgba(102, 192, 244, 0.3)',
                                    borderColor: '#8ed8ff',
                                }
                            }}
                        >
                            <CardContent>
                                <Typography variant="h6" sx={{ color: '#ffffff', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <History sx={{ color: '#66c0f4' }} />
                                    Gerenciar Dados
                                </Typography>

                                <Grid container spacing={3}>
                                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                        <Box sx={{
                                            p: 2,
                                            borderRadius: 2,
                                            background: 'rgba(102, 192, 244, 0.05)',
                                            border: '1px solid rgba(102, 192, 244, 0.2)',
                                            textAlign: 'center',
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                background: 'rgba(102, 192, 244, 0.1)',
                                                borderColor: 'rgba(102, 192, 244, 0.4)',
                                                transform: 'translateY(-2px)',
                                            }
                                        }}>
                                            <Box sx={{ mb: 2 }}>
                                                <Box sx={{
                                                    width: 48,
                                                    height: 48,
                                                    borderRadius: '50%',
                                                    background: 'rgba(102, 192, 244, 0.2)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    mx: 'auto',
                                                    mb: 1
                                                }}>
                                                    <Typography sx={{ fontSize: '1.5rem' }}>📁</Typography>
                                                </Box>
                                                <Typography variant="body2" sx={{ color: '#ffffff', fontWeight: 600 }}>
                                                    Exportar Dados
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#c7d5e0', fontSize: '0.75rem' }}>
                                                    Backup completo
                                                </Typography>
                                            </Box>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                fullWidth
                                                onClick={handleExportData}
                                                sx={{
                                                    borderColor: '#66c0f4',
                                                    color: '#66c0f4',
                                                    fontSize: '0.8rem',
                                                    py: 0.5,
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(102, 192, 244, 0.15)',
                                                        borderColor: '#8ed8ff',
                                                    }
                                                }}
                                            >
                                                Exportar
                                            </Button>
                                        </Box>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                        <Box sx={{
                                            p: 2,
                                            borderRadius: 2,
                                            background: 'rgba(255, 193, 7, 0.05)',
                                            border: '1px solid rgba(255, 193, 7, 0.2)',
                                            textAlign: 'center',
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                background: 'rgba(255, 193, 7, 0.1)',
                                                borderColor: 'rgba(255, 193, 7, 0.4)',
                                                transform: 'translateY(-2px)',
                                            }
                                        }}>
                                            <Box sx={{ mb: 2 }}>
                                                <Box sx={{
                                                    width: 48,
                                                    height: 48,
                                                    borderRadius: '50%',
                                                    background: 'rgba(255, 193, 7, 0.2)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    mx: 'auto',
                                                    mb: 1
                                                }}>
                                                    <Typography sx={{ fontSize: '1.5rem' }}>🧹</Typography>
                                                </Box>
                                                <Typography variant="body2" sx={{ color: '#ffffff', fontWeight: 600 }}>
                                                    Limpar Histórico
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#c7d5e0', fontSize: '0.75rem' }}>
                                                    Remove recomendações
                                                </Typography>
                                            </Box>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                fullWidth
                                                onClick={handleClearHistory}
                                                sx={{
                                                    borderColor: '#ffc107',
                                                    color: '#ffc107',
                                                    fontSize: '0.8rem',
                                                    py: 0.5,
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(255, 193, 7, 0.15)',
                                                        borderColor: '#ffcd38',
                                                    }
                                                }}
                                            >
                                                Limpar
                                            </Button>
                                        </Box>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                        <Box sx={{
                                            p: 2,
                                            borderRadius: 2,
                                            background: 'rgba(102, 192, 244, 0.05)',
                                            border: '1px solid rgba(102, 192, 244, 0.2)',
                                            textAlign: 'center',
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                background: 'rgba(102, 192, 244, 0.1)',
                                                borderColor: 'rgba(102, 192, 244, 0.4)',
                                                transform: 'translateY(-2px)',
                                            }
                                        }}>
                                            <Box sx={{ mb: 2 }}>
                                                <Box sx={{
                                                    width: 48,
                                                    height: 48,
                                                    borderRadius: '50%',
                                                    background: 'rgba(102, 192, 244, 0.2)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    mx: 'auto',
                                                    mb: 1
                                                }}>
                                                    <Logout sx={{ color: '#66c0f4', fontSize: 24 }} />
                                                </Box>
                                                <Typography variant="body2" sx={{ color: '#ffffff', fontWeight: 600 }}>
                                                    Fazer Logout
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#c7d5e0', fontSize: '0.75rem' }}>
                                                    Sair da conta
                                                </Typography>
                                            </Box>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                fullWidth
                                                onClick={handleLogout}
                                                sx={{
                                                    borderColor: '#66c0f4',
                                                    color: '#66c0f4',
                                                    fontSize: '0.8rem',
                                                    py: 0.5,
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(102, 192, 244, 0.15)',
                                                        borderColor: '#8ed8ff',
                                                    }
                                                }}
                                            >
                                                Sair
                                            </Button>
                                        </Box>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                        <Box sx={{
                                            p: 2,
                                            borderRadius: 2,
                                            background: 'rgba(244, 67, 54, 0.05)',
                                            border: '1px solid rgba(244, 67, 54, 0.2)',
                                            textAlign: 'center',
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                background: 'rgba(244, 67, 54, 0.1)',
                                                borderColor: 'rgba(244, 67, 54, 0.4)',
                                                transform: 'translateY(-2px)',
                                            }
                                        }}>
                                            <Box sx={{ mb: 2 }}>
                                                <Box sx={{
                                                    width: 48,
                                                    height: 48,
                                                    borderRadius: '50%',
                                                    background: 'rgba(244, 67, 54, 0.2)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    mx: 'auto',
                                                    mb: 1
                                                }}>
                                                    <Delete sx={{ color: '#f44336', fontSize: 24 }} />
                                                </Box>
                                                <Typography variant="body2" sx={{ color: '#ffffff', fontWeight: 600 }}>
                                                    Excluir Conta
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#c7d5e0', fontSize: '0.75rem' }}>
                                                    ⚠️ Irreversível
                                                </Typography>
                                            </Box>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                fullWidth
                                                onClick={handleDeleteAccount}
                                                color="error"
                                                sx={{
                                                    fontSize: '0.8rem',
                                                    py: 0.5,
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(244, 67, 54, 0.15)',
                                                    }
                                                }}
                                            >
                                                Excluir
                                            </Button>
                                        </Box>
                                    </Grid>
                                </Grid>

                                <Box sx={{
                                    mt: 4,
                                    p: 3,
                                    borderRadius: 2,
                                    background: 'linear-gradient(135deg, rgba(102, 192, 244, 0.1) 0%, rgba(142, 216, 255, 0.05) 100%)',
                                    border: '1px solid rgba(102, 192, 244, 0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                }}>
                                    <Box sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: '50%',
                                        background: 'rgba(102, 192, 244, 0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                    }}>
                                        <Typography sx={{ fontSize: '1.2rem' }}>💡</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" sx={{ color: '#ffffff', fontWeight: 600, mb: 0.5 }}>
                                            Dica Importante
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#c7d5e0', fontSize: '0.9rem' }}>
                                            Exporte seus dados regularmente para manter um backup das suas preferências e histórico de recomendações. Seus dados ficam salvos localmente no navegador.
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};
