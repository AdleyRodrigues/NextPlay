import { useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Container,
    Snackbar,
    Alert,
    Card,
    CardContent,
    Fade,
    Slide,
    Stack,
    Chip,
} from '@mui/material';
import {
    Lightbulb,
    Star,
    Timer,
    Gamepad,
} from '@mui/icons-material';
import { LandingFilter } from '../../components/LandingFilter/LandingFilter';
import { RecommendationsList } from '../../components/RecommendationsList/RecommendationsList';
import { useLandingState } from '../../hooks/useLandingState';
import { apiClient } from '../../api/client';
import type { Game } from '../../api/schemas';

export const LandingPage = () => {
    const { filters, updateFilter, buildPayload, isValid } = useLandingState();
    const [isLoading, setIsLoading] = useState(false);
    const [recommendations, setRecommendations] = useState<Game[]>([]);
    const [showRecommendations, setShowRecommendations] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGetRecommendations = async () => {
        if (!isValid) {
            setError('Selecione uma plataforma e uma habilidade primeiro');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const payload = buildPayload();
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

    const getSkillName = (skill: string) => {
        const skills: Record<string, string> = {
            'logica': 'Lógica',
            'reflexos': 'Reflexos',
            'paciencia': 'Paciência',
            'estrategia': 'Estratégia',
            'cooperacao': 'Cooperação',
        };
        return skills[skill] || skill;
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
                            Desenvolva Habilidades Jogando
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
                            Transforme seu tempo de jogo em desenvolvimento pessoal. Escolha o que você quer melhorar e nós encontramos o jogo perfeito.
                        </Typography>
                    </Box>
                </Fade>

                {/* Filters Section */}
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
                        <CardContent sx={{ p: 4 }}>
                            <LandingFilter
                                filters={filters}
                                onFilterChange={updateFilter}
                            />

                            {/* Selected Filters Display */}
                            {(filters.platformId || filters.skill || (filters.time?.length || 0) > 0) && (
                                <Fade in timeout={500}>
                                    <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                        <Typography variant="h6" sx={{ color: '#ffffff', mb: 2, fontWeight: 600 }}>
                                            Seu plano de treino gamer:
                                        </Typography>
                                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                            {filters.platformId && (
                                                <Chip
                                                    label={`Plataforma selecionada`}
                                                    icon={<Gamepad sx={{ fontSize: '1.2rem' }} />}
                                                    sx={{
                                                        backgroundColor: 'rgba(102, 126, 234, 0.2)',
                                                        color: '#ffffff',
                                                        border: '1px solid rgba(102, 126, 234, 0.3)',
                                                    }}
                                                />
                                            )}
                                            {filters.skill && (
                                                <Chip
                                                    label={`Habilidade: ${getSkillName(filters.skill)}`}
                                                    icon={<Lightbulb sx={{ fontSize: '1.2rem' }} />}
                                                    sx={{
                                                        backgroundColor: 'rgba(255, 119, 198, 0.2)',
                                                        color: '#ffffff',
                                                        border: '1px solid rgba(255, 119, 198, 0.3)',
                                                    }}
                                                />
                                            )}
                                            {filters.time?.map((time) => (
                                                <Chip
                                                    key={time}
                                                    label={`Duração: ${time}`}
                                                    icon={<Timer sx={{ fontSize: '1.2rem' }} />}
                                                    sx={{
                                                        backgroundColor: 'rgba(118, 75, 162, 0.2)',
                                                        color: '#ffffff',
                                                        border: '1px solid rgba(118, 75, 162, 0.3)',
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
                <Slide direction="up" in timeout={1200}>
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Button
                            variant="contained"
                            onClick={handleGetRecommendations}
                            disabled={isLoading || !isValid}
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
                            {isLoading ? 'Montando plano de treino...' : 'Gerar Recomendações'}
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
                                Jogos Recomendados
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
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
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