import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    Container,
    Paper,
    Snackbar,
    Alert,
    Card,
    CardContent,
} from '@mui/material';
import {
    Search,
    SportsEsports,
    Lightbulb,
    PersonalVideo,
    Info,
    ExpandMore,
    ExpandLess,
    OpenInNew,
} from '@mui/icons-material';
import { LandingFilter } from '../../components/LandingFilter/LandingFilter';
import { RecommendationsList } from '../../components/RecommendationsList/RecommendationsList';
import { useLandingState } from '../../hooks/useLandingState';
import { useSteam } from '../../context/SteamContext';
import { apiClient } from '../../api/client';
import type { Game } from '../../api/schemas';

export const LandingPage = () => {
    const { steamId64, setSteamId64 } = useSteam();
    const { filters, updateFilter, toggleFlavor, isValid, buildPayload } = useLandingState();

    const [recommendations, setRecommendations] = useState<Game[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    const [tempSteamId, setTempSteamId] = useState(steamId64 || '');
    const [showInstructions, setShowInstructions] = useState(() => {
        // Recuperar preferência do usuário da sessão
        return sessionStorage.getItem('showSteamInstructions') === 'true';
    });

    // Sincronizar estado temporário com Steam ID
    useEffect(() => {
        setTempSteamId(steamId64 || '');
    }, [steamId64]);

    // Salvar preferência do usuário na sessão
    const handleToggleInstructions = () => {
        const newValue = !showInstructions;
        setShowInstructions(newValue);
        sessionStorage.setItem('showSteamInstructions', newValue.toString());
    };



    // Snackbar states
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error' | 'info' | 'warning';
    }>({
        open: false,
        message: '',
        severity: 'info',
    });

    const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'info') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const handleSearch = async () => {
        // Validação para recomendações Steam
        if (!isValid || !steamId64) {
            const message = !steamId64
                ? 'Conecte sua conta Steam para continuar'
                : 'Selecione uma vibe e duração para continuar';
            showSnackbar(message, 'warning');
            return;
        }

        try {
            setIsLoading(true);
            setIsError(false);
            setError(null);

            const payload = buildPayload(steamId64!);
            const response = await apiClient.recommendByVibe(payload);

            setRecommendations(response.games);
            setHasSearched(true);

            showSnackbar(`${response.games.length} recomendações encontradas!`, 'success');
        } catch (err) {
            console.error('Erro ao buscar recomendações:', err);
            setIsError(true);
            setError(err instanceof Error ? err : new Error('Erro desconhecido'));
            showSnackbar('Erro ao buscar recomendações. Tente novamente.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = () => {
        handleSearch();
    };

    const handleLike = async (gameId: string) => {
        try {
            // Optimistic update - não remove da lista para likes
            showSnackbar('Obrigado pelo feedback! 👍', 'success');

            // Simular chamada de API
            await apiClient.feedback({
                gameId,
                rating: 5,
                comment: 'Usuário curtiu a recomendação',
            });
        } catch (err) {
            console.error('Erro ao enviar feedback:', err);
            showSnackbar('Erro ao enviar feedback', 'error');
        }
    };

    const handleDislike = async (gameId: string) => {
        try {
            // Optimistic update - remove da lista imediatamente
            setRecommendations(prev => prev.filter(game => game.id !== gameId));
            showSnackbar('Recomendação removida da lista', 'info');

            // Simular chamada de API
            await apiClient.feedback({
                gameId,
                rating: 1,
                comment: 'Usuário não curtiu a recomendação',
            });
        } catch (err) {
            console.error('Erro ao enviar feedback:', err);
            // Reverter otimistic update em caso de erro
            handleRefresh();
            showSnackbar('Erro ao enviar feedback', 'error');
        }
    };

    const handlePlay = (gameId: string) => {
        const game = recommendations.find(g => g.id === gameId);
        if (game) {
            showSnackbar(`Redirecionando para ${game.name}...`, 'info');
            // Aqui seria o redirecionamento para Steam/loja
            setTimeout(() => {
                window.open(`https://store.steampowered.com/search/?term=${encodeURIComponent(game.name)}`, '_blank');
            }, 1000);
        }
    };

    const handleSnooze = async (gameId: string) => {
        try {
            // Remove da lista atual (usuário verá novamente mais tarde)
            setRecommendations(prev => prev.filter(game => game.id !== gameId));
            showSnackbar('Jogo adicionado à lista para mais tarde 💤', 'info');

            // Simular chamada de API para marcar como "snooze"
            await apiClient.feedback({
                gameId,
                rating: 3,
                comment: 'Usuário quer ver mais tarde',
            });
        } catch (err) {
            console.error('Erro ao fazer snooze:', err);
            showSnackbar('Erro ao processar solicitação', 'error');
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #1b2838 0%, #2a475e 100%)',
                pt: 2,
                pb: 2,
            }}
        >
            <Container maxWidth="lg">
                {/* Hero Section Compacto */}
                <Paper
                    sx={{
                        p: 2.5,
                        mb: 3,
                        background: 'linear-gradient(135deg, #2a475e 0%, #1b2838 100%)',
                        border: '1px solid #66c0f4',
                        borderRadius: 2,
                        textAlign: 'center',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 1 }}>
                        <Box
                            sx={{
                                width: 50,
                                height: 50,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #66c0f4 0%, #8ed8ff 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Lightbulb sx={{ fontSize: 28, color: '#1b2838' }} />
                        </Box>
                        <Typography
                            variant="h4"
                            sx={{
                                color: '#ffffff',
                                fontWeight: 700,
                            }}
                        >
                            Qual vai ser o seu próximo jogo?
                        </Typography>
                    </Box>
                    <Typography
                        variant="body1"
                        sx={{
                            color: '#c7d5e0',
                            fontSize: '0.95rem',
                        }}
                    >
                        Responda algumas perguntas e descubra jogos perfeitos para o seu momento atual
                    </Typography>

                    {/* Steam Status Info */}
                    {!steamId64 && (
                        <Box
                            sx={{
                                mt: 2,
                                p: 2,
                                backgroundColor: 'rgba(102, 192, 244, 0.1)',
                                borderRadius: 2,
                                border: '1px solid rgba(102, 192, 244, 0.3)'
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Info sx={{ color: '#66c0f4', fontSize: 20 }} />
                                <Typography variant="body2" sx={{ color: '#66c0f4', fontWeight: 600 }}>
                                    Steam não conectado
                                </Typography>
                            </Box>
                            <Typography variant="caption" sx={{ color: '#8fb9d3', display: 'block' }}>
                                A funcionalidade <strong>"Descobrir Jogos"</strong> está em desenvolvimento. Conecte sua Steam para receber recomendações personalizadas.
                            </Typography>
                        </Box>
                    )}
                </Paper>

                {/* Steam ID Input Section - Primeiro e mais destacado */}
                <Paper sx={{
                    p: 3,
                    mb: 3,
                    background: 'linear-gradient(135deg, rgba(102, 192, 244, 0.08) 0%, rgba(26, 40, 56, 0.9) 100%)',
                    border: '2px solid rgba(102, 192, 244, 0.3)',
                    borderRadius: 4,
                    boxShadow: '0 8px 32px rgba(102, 192, 244, 0.15)'
                }}>
                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                        <Box sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, rgba(102, 192, 244, 0.2) 0%, rgba(102, 192, 244, 0.1) 100%)',
                            border: '2px solid rgba(102, 192, 244, 0.4)',
                            mb: 2,
                            boxShadow: '0 4px 20px rgba(102, 192, 244, 0.2)'
                        }}>
                            <PersonalVideo sx={{ fontSize: 32, color: '#66c0f4' }} />
                        </Box>
                        <Typography variant="h6" sx={{ color: '#ffffff', mb: 1, fontWeight: 700, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                            {steamId64 ? 'Editar Steam ID' : 'Conecte sua Conta Steam'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#c7d5e0', maxWidth: 500, mx: 'auto', lineHeight: 1.4, fontSize: '1rem' }}>
                            {steamId64
                                ? 'Edite seu Steam ID64 ou conecte uma nova conta para receber recomendações personalizadas.'
                                : 'Para receber recomendações personalizadas baseadas na sua biblioteca, precisamos do seu Steam ID64. Você pode encontrá-lo facilmente!'
                            }
                        </Typography>
                    </Box>

                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1.5,
                        maxWidth: 700,
                        mx: 'auto'
                    }}>
                        {/* Label */}
                        <Typography variant="body2" sx={{ color: '#66c0f4', fontWeight: 600, fontSize: '1rem', textAlign: { xs: 'center', sm: 'left' } }}>
                            Steam ID64:
                        </Typography>

                        {/* Input e Botão em linha */}
                        <Box sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            gap: 2,
                            alignItems: 'stretch'
                        }}>
                            {/* Input Field */}
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <input
                                    type="text"
                                    placeholder="Ex: 76561198000000000"
                                    value={tempSteamId}
                                    onChange={(e) => {
                                        const value = e.target.value.trim();
                                        setTempSteamId(value);

                                        if (value && (value.length < 17 || !/^\d+$/.test(value))) {
                                            if (!showInstructions) {
                                                setTimeout(() => {
                                                    if (tempSteamId !== value) {
                                                        showSnackbar('💡 Dica: Use o card de instruções para encontrar seu SteamID64 correto', 'info');
                                                    }
                                                }, 1000);
                                            }
                                        }
                                    }}
                                    style={{
                                        width: '100%',
                                        height: '48px',
                                        padding: '0 16px',
                                        fontSize: '16px',
                                        backgroundColor: 'rgba(26, 40, 56, 0.95)',
                                        border: '2px solid rgba(102, 192, 244, 0.4)',
                                        borderRadius: '8px',
                                        color: '#ffffff',
                                        outline: 'none',
                                        transition: 'all 0.2s ease',
                                        fontWeight: '500',
                                        boxSizing: 'border-box'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#66c0f4';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(102, 192, 244, 0.15)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = 'rgba(102, 192, 244, 0.4)';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </Box>

                            {/* Botão */}
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={<PersonalVideo />}
                                onClick={() => {
                                    if (tempSteamId && tempSteamId.length >= 17) {
                                        setSteamId64(tempSteamId);
                                        showSnackbar('Steam ID conectado com sucesso! 🎮', 'success');
                                    } else {
                                        showSnackbar('Por favor, insira um Steam ID válido (17 dígitos)', 'warning');
                                    }
                                }}
                                disabled={!tempSteamId || tempSteamId.length < 17}
                                sx={{
                                    height: '48px',
                                    px: 3,
                                    py: 0,
                                    fontSize: '0.95rem',
                                    fontWeight: 600,
                                    backgroundColor: tempSteamId && tempSteamId.length >= 17 ? '#66c0f4' : 'rgba(102, 192, 244, 0.3)',
                                    color: tempSteamId && tempSteamId.length >= 17 ? '#1b2838' : 'rgba(27, 40, 56, 0.5)',
                                    borderRadius: '8px',
                                    border: '2px solid transparent',
                                    transition: 'all 0.2s ease',
                                    whiteSpace: 'nowrap',
                                    minWidth: { xs: '100%', sm: '180px' },
                                    '&:hover': {
                                        backgroundColor: tempSteamId && tempSteamId.length >= 17 ? '#8ed8ff' : 'rgba(102, 192, 244, 0.3)',
                                        transform: 'translateY(-1px)',
                                        boxShadow: '0 4px 12px rgba(102, 192, 244, 0.25)',
                                    },
                                    '&:disabled': {
                                        backgroundColor: 'rgba(102, 192, 244, 0.3)',
                                        color: 'rgba(27, 40, 56, 0.5)',
                                        transform: 'none',
                                        boxShadow: 'none',
                                    },
                                }}
                            >
                                {steamId64 ? 'Atualizar Steam ID' : 'Conectar Steam'}
                            </Button>
                        </Box>
                    </Box>

                    {/* Card de Aviso - Como encontrar SteamID64 */}
                    <Box sx={{ mt: 3 }}>
                        <Card
                            variant="outlined"
                            sx={{
                                backgroundColor: 'rgba(33, 150, 243, 0.08)',
                                borderColor: 'rgba(33, 150, 243, 0.4)',
                                borderRadius: 2,
                                overflow: 'visible',
                                borderWidth: '1px'
                            }}
                        >
                            <CardContent sx={{ p: 1.5 }}>
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    cursor: 'pointer',
                                    mb: showInstructions ? 1.5 : 0
                                }}
                                    onClick={handleToggleInstructions}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Info sx={{ color: '#2196f3', fontSize: 18 }} />
                                        <Typography variant="body2" sx={{ color: '#2196f3', fontWeight: 600 }}>
                                            Como encontrar seu SteamID?
                                        </Typography>
                                    </Box>
                                    <Button
                                        size="small"
                                        variant="text"
                                        endIcon={showInstructions ? <ExpandLess /> : <ExpandMore />}
                                        sx={{
                                            color: '#2196f3',
                                            minWidth: 'auto',
                                            p: 0.5
                                        }}
                                    >
                                        {showInstructions ? 'Ocultar' : 'Mostrar instruções'}
                                    </Button>
                                </Box>

                                {showInstructions && (
                                    <Box sx={{
                                        animation: 'fadeIn 0.3s ease-in-out',
                                        '@keyframes fadeIn': {
                                            '0%': { opacity: 0, transform: 'translateY(-10px)' },
                                            '100%': { opacity: 1, transform: 'translateY(0)' }
                                        }
                                    }}>
                                        <Typography variant="body2" sx={{ color: '#1976d2', mb: 1.5, lineHeight: 1.5, fontSize: '0.9rem' }}>
                                            1. Acesse seu perfil da Steam no navegador.<br />
                                            2. Copie a URL do perfil (ex.: https://steamcommunity.com/id/seunome/).<br />
                                            3. Cole essa URL no site <strong>steamid.io</strong> para obter seu SteamID64.<br />
                                            4. Copie o número SteamID64 e cole no campo acima.
                                        </Typography>

                                        <Box sx={{
                                            p: 1.5,
                                            backgroundColor: 'rgba(255, 193, 7, 0.1)',
                                            borderRadius: 1,
                                            border: '1px solid rgba(255, 193, 7, 0.2)',
                                            mb: 1.5
                                        }}>
                                            <Typography variant="caption" sx={{ color: '#f57c00', fontWeight: 500, fontSize: '0.8rem' }}>
                                                💡 <strong>Dica:</strong> Seu SteamID64 é sempre um número muito grande (17 dígitos).
                                            </Typography>
                                        </Box>

                                        <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={<OpenInNew />}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                window.open('https://steamid.io/', '_blank');
                                            }}
                                            sx={{
                                                borderColor: '#2196f3',
                                                color: '#2196f3',
                                                fontSize: '0.8rem',
                                                py: 0.5,
                                                '&:hover': {
                                                    borderColor: '#1976d2',
                                                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                                                }
                                            }}
                                        >
                                            Ver tutorial
                                        </Button>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    </Box>
                </Paper>

                {/* Filter Section - Após o Steam ID */}
                <Box sx={{ mb: 2 }}>
                    <LandingFilter
                        filters={filters}
                        onFilterChange={updateFilter}
                        onFlavorToggle={toggleFlavor}
                    />
                </Box>

                {/* Recomendações Steam - MVP simplificado */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                        mb: 1.5
                    }}>
                        <PersonalVideo sx={{ color: '#66c0f4', fontSize: 20 }} />
                        <Typography variant="h6" sx={{ color: '#c7d5e0', fontWeight: 600, fontSize: '1.1rem' }}>
                            Recomendações Personalizadas Steam
                        </Typography>
                    </Box>

                    <Typography variant="body2" sx={{ color: '#8fb9d3', textAlign: 'center', maxWidth: 500, mb: 1.5, fontSize: '0.9rem' }}>
                        {steamId64
                            ? "✅ Steam conectado! Seus filtros serão aplicados à sua biblioteca pessoal."
                            : "🔗 Conecte sua conta Steam acima para receber recomendações baseadas na sua biblioteca e histórico de jogos."
                        }
                    </Typography>
                </Box>

                {/* Search Button + Validation */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<Search />}
                        onClick={handleSearch}
                        disabled={!isValid || isLoading || !steamId64}
                        sx={{
                            px: 4,
                            py: 1.2,
                            fontSize: '1rem',
                            fontWeight: 600,
                            backgroundColor: isValid ? '#66c0f4' : 'rgba(102, 192, 244, 0.3)',
                            color: isValid ? '#1b2838' : 'rgba(27, 40, 56, 0.5)',
                            '&:hover': {
                                backgroundColor: isValid ? '#8ed8ff' : 'rgba(102, 192, 244, 0.3)',
                            },
                            '&:disabled': {
                                backgroundColor: 'rgba(102, 192, 244, 0.3)',
                                color: 'rgba(27, 40, 56, 0.5)',
                            },
                        }}
                    >
                        {isLoading ? 'Buscando...' : 'Ver Recomendações'}
                    </Button>

                    {/* Validation Message Inline */}
                    {!isValid && (
                        <Typography
                            variant="body2"
                            sx={{
                                color: '#ffc107',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                fontSize: '0.8rem',
                            }}
                        >
                            <SportsEsports sx={{ fontSize: 16 }} />
                            Selecione como quer se sentir e quanto tempo tem para continuar
                        </Typography>
                    )}
                </Box>

                {/* Recommendations Section */}
                {hasSearched && (
                    <RecommendationsList
                        games={recommendations}
                        isLoading={isLoading}
                        isError={isError}
                        error={error}
                        onRefresh={handleRefresh}
                        onLike={handleLike}
                        onDislike={handleDislike}
                        onPlay={handlePlay}
                        onSnooze={handleSnooze}
                    />
                )}

                {/* Snackbar for notifications */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={4000}
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert
                        onClose={handleCloseSnackbar}
                        severity={snackbar.severity}
                        sx={{ width: '100%' }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Container>
        </Box>
    );
};
