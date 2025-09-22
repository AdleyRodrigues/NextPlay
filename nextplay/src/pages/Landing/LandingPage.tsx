import { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    TextField,
    Container,
    Snackbar,
    Alert,
    Card,
    CardContent,
    Fade,
    Slide,
    Stack,
    Chip,
    Avatar,
    IconButton,
    Collapse,
} from '@mui/material';
import {
    SportsEsports,
    Lightbulb,
    PersonalVideo,
    ExpandMore,
    ExpandLess,
    OpenInNew,
    Gamepad,
    Star,
    TrendingUp,
    Timer,
    Psychology,
    Palette,
    Schedule,
    Public,
    Language,
} from '@mui/icons-material';
import { LandingFilter } from '../../components/LandingFilter/LandingFilter';
import { RecommendationsList } from '../../components/RecommendationsList/RecommendationsList';
import { useLandingState } from '../../hooks/useLandingState';
import { useSteam } from '../../hooks/useSteam';
import { apiClient } from '../../api/client';
import type { Game } from '../../api/schemas';

export const LandingPage = () => {
    const { steamId64, playerInfo, setSteamId64, setPlayerInfo } = useSteam();
    const { filters, updateFilter, buildPayload } = useLandingState();
    const [steamId, setSteamId] = useState(steamId64 || '');
    const [isLoading, setIsLoading] = useState(false);
    const [recommendations, setRecommendations] = useState<Game[]>([]);
    const [showRecommendations, setShowRecommendations] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showUserInfo, setShowUserInfo] = useState(false);

    const isValidSteamId = (id: string): boolean => {
        const trimmed = id.trim();
        if (!trimmed) return false;

        // Steam ID64 (17 dígitos)
        if (/^\d{17}$/.test(trimmed)) return true;

        // Steam ID (STEAM_0:1:XXXXXXX)
        if (/^STEAM_[01]:[01]:\d+$/.test(trimmed)) return true;

        // Steam ID3 ([U:1:XXXXXXX])
        if (/^\[U:1:\d+\]$/.test(trimmed)) return true;

        return false;
    };

    const handleConnectSteam = async () => {
        if (!isValidSteamId(steamId)) {
            setError('Por favor, insira um Steam ID válido');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            console.log('🔗 Connecting to Steam with ID:', steamId);

            const response = await apiClient.refresh(steamId);
            console.log('🔗 Steam connection response:', response);

            if (response.gamesFound !== undefined) {
                setSteamId64(steamId);
                setPlayerInfo(response.playerInfo || null);
                setError(null);
            } else {
                setError(response.message || 'Erro ao conectar com Steam');
            }
        } catch (err) {
            console.error('❌ Steam connection error:', err);
            setError('Erro ao conectar com Steam. Verifique seu ID e tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGetRecommendations = async () => {
        if (!steamId64) {
            setError('Conecte sua conta Steam primeiro');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const payload = buildPayload(steamId64);
            console.log('🎯 Recommendation payload:', payload);

            const response = await apiClient.recommend(payload);
            console.log('🎯 Recommendations response:', response);

            setRecommendations(response.games);
            setShowRecommendations(true);
        } catch (err) {
            console.error('❌ Recommendation error:', err);
            setError('Erro ao buscar recomendações. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };


    const getVibeIcon = (vibe: string) => {
        const icons: { [key: string]: React.ReactElement } = {
            'relaxar': <Psychology sx={{ fontSize: '1.2rem' }} />,
            'historia': <PersonalVideo sx={{ fontSize: '1.2rem' }} />,
            'acao': <SportsEsports sx={{ fontSize: '1.2rem' }} />,
            'estrategia': <Lightbulb sx={{ fontSize: '1.2rem' }} />,
            'aventura': <OpenInNew sx={{ fontSize: '1.2rem' }} />,
        };
        return icons[vibe] || <Gamepad sx={{ fontSize: '1.2rem' }} />;
    };

    const getTimeIcon = (time: string) => {
        const icons: { [key: string]: React.ReactElement } = {
            'curto': <Timer sx={{ fontSize: '1.2rem' }} />,
            'medio': <Schedule sx={{ fontSize: '1.2rem' }} />,
            'longo': <TrendingUp sx={{ fontSize: '1.2rem' }} />,
        };
        return icons[time] || <Timer sx={{ fontSize: '1.2rem' }} />;
    };

    const getEnergyIcon = (energy: string) => {
        const icons: { [key: string]: React.ReactElement } = {
            'baixa': <Palette sx={{ fontSize: '1.2rem' }} />,
            'media': <Star sx={{ fontSize: '1.2rem' }} />,
            'alta': <SportsEsports sx={{ fontSize: '1.2rem' }} />,
        };
        return icons[energy] || <Star sx={{ fontSize: '1.2rem' }} />;
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #0f1419 0%, #1a1f2e 50%, #2d3748 100%)',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Background Pattern */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: `
                        radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%),
                        radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.1) 0%, transparent 50%)
                    `,
                    zIndex: 0,
                }}
            />

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: 4 }}>
                {/* Hero Section */}
                <Fade in timeout={800}>
                    <Box sx={{ textAlign: 'center', mb: 6 }}>
                        <Typography
                            variant="h2"
                            sx={{
                                fontWeight: 800,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                mb: 2,
                                fontSize: { xs: '2.5rem', md: '3.5rem' },
                                lineHeight: 1.2,
                            }}
                        >
                            Qual vai ser o seu próximo jogo?
                        </Typography>
                        <Typography
                            variant="h5"
                            sx={{
                                color: '#a0aec0',
                                mb: 4,
                                fontSize: { xs: '1.1rem', md: '1.3rem' },
                                maxWidth: '600px',
                                mx: 'auto',
                                lineHeight: 1.6,
                            }}
                        >
                            Descubra jogos perfeitos para seu humor e tempo disponível com nossa IA especializada
                        </Typography>
                    </Box>
                </Fade>

                {/* Steam Connection Section */}
                <Slide direction="up" in timeout={1000}>
                    <Card
                        sx={{
                            mb: 4,
                            background: 'rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '20px',
                            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                        }}
                    >
                        <CardContent sx={{ p: 3 }}>
                            <Stack spacing={2}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography
                                        variant="h4"
                                        sx={{
                                            color: '#ffffff',
                                            fontWeight: 700,
                                            mb: 0.5,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 2,
                                        }}
                                    >
                                        <Gamepad sx={{ fontSize: '2rem', color: '#667eea' }} />
                                        Conecte sua Conta Steam
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        sx={{ color: '#a0aec0', maxWidth: '500px', mx: 'auto' }}
                                    >
                                        Conecte sua biblioteca Steam para receber recomendações personalizadas baseadas nos seus jogos
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'stretch', flexDirection: { xs: 'column', sm: 'row' } }}>
                                    <TextField
                                        fullWidth
                                        value={steamId}
                                        onChange={(e) => setSteamId(e.target.value)}
                                        placeholder="Cole seu Steam ID aqui (qualquer formato)"
                                        variant="outlined"
                                        sx={{
                                            flex: 1,
                                            '& .MuiOutlinedInput-root': {
                                                height: '56px',
                                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                                border: '2px solid rgba(255, 255, 255, 0.1)',
                                                borderRadius: '12px',
                                                '& fieldset': {
                                                    borderColor: 'transparent',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: 'rgba(255, 255, 255, 0.2)',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#667eea',
                                                },
                                            },
                                            '& .MuiInputBase-input': {
                                                color: '#ffffff',
                                                fontSize: '16px',
                                                padding: '16px 20px',
                                            },
                                        }}
                                    />
                                    <Button
                                        variant="contained"
                                        onClick={handleConnectSteam}
                                        disabled={isLoading || !steamId.trim()}
                                        sx={{
                                            height: '56px',
                                            px: 4,
                                            borderRadius: '12px',
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            color: '#ffffff',
                                            fontWeight: 700,
                                            fontSize: '1.1rem',
                                            textTransform: 'none',
                                            boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)',
                                            minWidth: { xs: '100%', sm: '180px' },
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 12px 25px rgba(102, 126, 234, 0.5)',
                                            },
                                            '&:disabled': {
                                                background: 'rgba(255, 255, 255, 0.1)',
                                                color: 'rgba(255, 255, 255, 0.3)',
                                                transform: 'none',
                                                boxShadow: 'none',
                                            },
                                        }}
                                    >
                                        {isLoading ? 'Conectando...' : 'Conectar Steam'}
                                    </Button>
                                </Box>

                                {/* User Info Display */}
                                {playerInfo && (
                                    <Fade in timeout={500}>
                                        <Box
                                            sx={{
                                                p: 3,
                                                background: 'rgba(102, 126, 234, 0.1)',
                                                borderRadius: '16px',
                                                border: '1px solid rgba(102, 126, 234, 0.2)',
                                            }}
                                        >
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Avatar
                                                    src={playerInfo.avatar}
                                                    sx={{
                                                        width: 60,
                                                        height: 60,
                                                        border: '3px solid #667eea',
                                                    }}
                                                />
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography
                                                        variant="h6"
                                                        sx={{ color: '#ffffff', fontWeight: 600 }}
                                                    >
                                                        {playerInfo.personaName}
                                                    </Typography>
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <Chip
                                                            label={playerInfo.isOnline ? 'Online' : 'Offline'}
                                                            size="small"
                                                            sx={{
                                                                backgroundColor: playerInfo.isOnline ? '#48bb78' : '#a0aec0',
                                                                color: '#ffffff',
                                                                fontWeight: 600,
                                                            }}
                                                        />
                                                        {playerInfo.countryCode && (
                                                            <Chip
                                                                label={playerInfo.countryCode}
                                                                size="small"
                                                                icon={<Public sx={{ fontSize: '1rem' }} />}
                                                                sx={{
                                                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                                    color: '#ffffff',
                                                                }}
                                                            />
                                                        )}
                                                    </Stack>
                                                </Box>
                                                <IconButton
                                                    onClick={() => setShowUserInfo(!showUserInfo)}
                                                    sx={{ color: '#667eea' }}
                                                >
                                                    {showUserInfo ? <ExpandLess /> : <ExpandMore />}
                                                </IconButton>
                                            </Stack>

                                            <Collapse in={showUserInfo}>
                                                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                                    <Stack spacing={1}>
                                                        <Typography variant="body2" sx={{ color: '#a0aec0' }}>
                                                            Steam ID64: {steamId64}
                                                        </Typography>
                                                        {playerInfo.createdDate && (
                                                            <Typography variant="body2" sx={{ color: '#a0aec0' }}>
                                                                Membro desde: {new Date(playerInfo.createdDate).toLocaleDateString()}
                                                            </Typography>
                                                        )}
                                                    </Stack>
                                                </Box>
                                            </Collapse>
                                        </Box>
                                    </Fade>
                                )}

                                <Box sx={{ textAlign: 'center' }}>
                                    <Typography variant="body2" sx={{ color: '#a0aec0', mb: 2 }}>
                                        Não sabe seu Steam ID? Acesse{' '}
                                        <a
                                            href="https://steamid.io"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ color: '#667eea', textDecoration: 'none' }}
                                        >
                                            steamid.io
                                        </a>{' '}
                                        e cole qualquer link do seu perfil
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Slide>

                {/* Filters Section */}
                <Slide direction="up" in timeout={1200}>
                    <Card
                        sx={{
                            mb: 4,
                            background: 'rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '20px',
                            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                        }}
                    >
                        <CardContent sx={{ p: 4 }}>
                            <Typography
                                variant="h5"
                                sx={{
                                    color: '#ffffff',
                                    fontWeight: 700,
                                    mb: 3,
                                    textAlign: 'center',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 2,
                                }}
                            >
                                <Lightbulb sx={{ fontSize: '1.8rem', color: '#667eea' }} />
                                Como você quer se sentir hoje?
                            </Typography>

                            <LandingFilter
                                filters={filters}
                                onFilterChange={updateFilter}
                            />

                            {/* Selected Filters Display */}
                            {((filters.vibe?.length || 0) > 0 || (filters.time?.length || 0) > 0 || (filters.energy?.length || 0) > 0 || (filters.lang?.length || 0) > 0) && (
                                <Fade in timeout={500}>
                                    <Box sx={{ mt: 3 }}>
                                        <Typography variant="h6" sx={{ color: '#ffffff', mb: 2, fontWeight: 600 }}>
                                            Filtros selecionados:
                                        </Typography>
                                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                            {filters.vibe?.map((vibe) => (
                                                <Chip
                                                    key={vibe}
                                                    label={vibe}
                                                    icon={getVibeIcon(vibe)}
                                                    onDelete={() => updateFilter('vibe', filters.vibe?.filter(v => v !== vibe) || [])}
                                                    sx={{
                                                        backgroundColor: 'rgba(102, 126, 234, 0.2)',
                                                        color: '#ffffff',
                                                        border: '1px solid rgba(102, 126, 234, 0.3)',
                                                        '& .MuiChip-deleteIcon': { color: '#ffffff' },
                                                    }}
                                                />
                                            ))}
                                            {filters.time?.map((time) => (
                                                <Chip
                                                    key={time}
                                                    label={time}
                                                    icon={getTimeIcon(time)}
                                                    onDelete={() => updateFilter('time', filters.time?.filter(t => t !== time) || [])}
                                                    sx={{
                                                        backgroundColor: 'rgba(118, 75, 162, 0.2)',
                                                        color: '#ffffff',
                                                        border: '1px solid rgba(118, 75, 162, 0.3)',
                                                        '& .MuiChip-deleteIcon': { color: '#ffffff' },
                                                    }}
                                                />
                                            ))}
                                            {filters.energy?.map((energy) => (
                                                <Chip
                                                    key={energy}
                                                    label={energy}
                                                    icon={getEnergyIcon(energy)}
                                                    onDelete={() => updateFilter('energy', filters.energy?.filter(e => e !== energy) || [])}
                                                    sx={{
                                                        backgroundColor: 'rgba(255, 119, 198, 0.2)',
                                                        color: '#ffffff',
                                                        border: '1px solid rgba(255, 119, 198, 0.3)',
                                                        '& .MuiChip-deleteIcon': { color: '#ffffff' },
                                                    }}
                                                />
                                            ))}
                                            {filters.lang?.map((lang) => (
                                                <Chip
                                                    key={lang}
                                                    label={lang}
                                                    icon={<Language sx={{ fontSize: '1.2rem' }} />}
                                                    onDelete={() => updateFilter('lang', filters.lang?.filter(l => l !== lang) || [])}
                                                    sx={{
                                                        backgroundColor: 'rgba(120, 219, 255, 0.2)',
                                                        color: '#ffffff',
                                                        border: '1px solid rgba(120, 219, 255, 0.3)',
                                                        '& .MuiChip-deleteIcon': { color: '#ffffff' },
                                                    }}
                                                />
                                            ))}
                                        </Stack>
                                    </Box>
                                </Fade>
                            )}
                        </CardContent>
                    </Card>
                </Slide>

                {/* Get Recommendations Button */}
                <Slide direction="up" in timeout={1400}>
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Button
                            variant="contained"
                            onClick={handleGetRecommendations}
                            disabled={isLoading || !steamId64}
                            sx={{
                                px: 6,
                                py: 3,
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: '#ffffff',
                                fontWeight: 800,
                                fontSize: '1.3rem',
                                textTransform: 'none',
                                boxShadow: '0 12px 30px rgba(102, 126, 234, 0.4)',
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                                    transform: 'translateY(-3px)',
                                    boxShadow: '0 16px 35px rgba(102, 126, 234, 0.5)',
                                },
                                '&:disabled': {
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    color: 'rgba(255, 255, 255, 0.5)',
                                    transform: 'none',
                                    boxShadow: 'none',
                                },
                                transition: 'all 0.3s ease',
                            }}
                        >
                            {isLoading ? 'Buscando recomendações...' : 'Ver Recomendações'}
                        </Button>
                    </Box>
                </Slide>

                {/* Recommendations Section */}
                {showRecommendations && (
                    <Fade in timeout={600}>
                        <Box>
                            <Typography
                                variant="h4"
                                sx={{
                                    color: '#ffffff',
                                    fontWeight: 700,
                                    mb: 3,
                                    textAlign: 'center',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 2,
                                }}
                            >
                                <Star sx={{ fontSize: '2rem', color: '#667eea' }} />
                                Suas Recomendações
                            </Typography>
                            <RecommendationsList
                                games={recommendations}
                            />
                        </Box>
                    </Fade>
                )}

                {/* Error Snackbar */}
                <Snackbar
                    open={!!error}
                    autoHideDuration={6000}
                    onClose={() => setError(null)}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                    <Alert
                        onClose={() => setError(null)}
                        severity="error"
                        sx={{
                            background: 'rgba(239, 68, 68, 0.9)',
                            color: '#ffffff',
                            borderRadius: '12px',
                            '& .MuiAlert-icon': { color: '#ffffff' },
                        }}
                    >
                        {error}
                    </Alert>
                </Snackbar>
            </Container>
        </Box>
    );
};