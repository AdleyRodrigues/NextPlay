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
    AutoAwesome,
    Timer,
    Gamepad,
    DateRange,
    Mood,
    People,
} from '@mui/icons-material';
import { LandingFilter } from '../../components/LandingFilter/LandingFilter';
import { RecommendationsList } from '../../components/RecommendationsList/RecommendationsList';
import { useLandingState } from '../../hooks/useLandingState';
import { apiClient } from '../../api/client';
import type { Game } from '../../api/schemas';
import * as S from './LandingPage.styles';

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


            const response = await apiClient.recommend(payload);


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
            'resiliencia': 'Resiliência',
            'estrategia': 'Estratégia',
            'cooperacao': 'Cooperação',
            'criatividade': 'Criatividade',
            'decisao': 'Decisão',
            'memoria': 'Memória',
            'foco': 'Foco',
            'lideranca': 'Liderança',
            'gestao': 'Gestão de Crise',
            'coordenacao': 'Coordenação Motora Fina',
        };
        return skills[skill] || skill;
    };

    return (
        <Box sx={S.pageContainer}>
            {/* Background Pattern */}
            <Box sx={S.backgroundPattern} />

            <Container maxWidth="lg" sx={S.contentContainer}>
                {/* Hero Section */}
                <Fade in timeout={800}>
                    <Box sx={S.heroSection}>
                        <Typography variant="h2" sx={S.heroTitle}>
                            Desenvolva Habilidades Jogando
                        </Typography>
                        <Typography variant="h5" sx={S.heroSubtitle}>
                            Transforme seu tempo de jogo em desenvolvimento pessoal. Escolha o que você quer melhorar e nós encontramos o jogo perfeito.
                        </Typography>
                    </Box>
                </Fade>

                {/* Filters Section */}
                <Slide direction="up" in timeout={1000}>
                    <Card sx={S.filtersCard}>
                        <CardContent sx={S.filtersCardContent}>
                            <LandingFilter
                                filters={filters}
                                onFilterChange={updateFilter}
                            />

                            {/* Selected Filters Display */}
                            {(filters.platformId || filters.skill || (filters.time?.length || 0) > 0) && (
                                <Fade in timeout={500}>
                                    <Box sx={S.selectedFiltersContainer}>
                                        <Typography variant="h6" sx={S.selectedFiltersTitle}>
                                            Seu plano de treino gamer:
                                        </Typography>
                                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                            {filters.platformId && (
                                                <Chip
                                                    label={`Plataforma selecionada`}
                                                    icon={<Gamepad sx={{ fontSize: '1.2rem' }} />}
                                                    sx={S.platformChip}
                                                />
                                            )}
                                            {filters.skill && (
                                                <Chip
                                                    label={`Habilidade: ${getSkillName(filters.skill)}`}
                                                    icon={<Lightbulb sx={{ fontSize: '1.2rem' }} />}
                                                    sx={S.skillChip}
                                                />
                                            )}
                                            {filters.time?.map((time) => (
                                                <Chip
                                                    key={time}
                                                    label={`Duração: ${time}`}
                                                    icon={<Timer sx={{ fontSize: '1.2rem' }} />}
                                                    sx={S.timeChip}
                                                />
                                            ))}
                                            {filters.minYear && filters.maxYear && (
                                                <Chip
                                                    label={`${filters.minYear} - ${filters.maxYear}`}
                                                    icon={<DateRange sx={{ fontSize: '1.2rem' }} />}
                                                    sx={S.yearChip}
                                                />
                                            )}
                                            {filters.multiplayerMode && filters.multiplayerMode !== 'both' && (
                                                <Chip
                                                    label={filters.multiplayerMode === 'single' ? "Só Single Player" : "Só Multiplayer"}
                                                    icon={<People sx={{ fontSize: '1.2rem' }} />}
                                                    sx={S.multiplayerChip}
                                                />
                                            )}
                                            {filters.vibes?.map((vibe) => (
                                                <Chip
                                                    key={vibe}
                                                    label={vibe}
                                                    icon={<Mood sx={{ fontSize: '1.2rem' }} />}
                                                    sx={S.vibeChip}
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
                    <Box sx={S.generateButtonContainer}>
                        <Button
                            variant="contained"
                            onClick={handleGetRecommendations}
                            disabled={isLoading}
                            sx={S.generateButton}
                        >
                            {isLoading ? 'Montando plano de treino...' : 'Gerar Recomendações'}
                        </Button>
                    </Box>
                </Slide>

                {/* Recommendations Section */}
                {(isLoading || showRecommendations) && (
                    <Fade in timeout={600}>
                        <Box>
                            <Typography variant="h4" sx={S.recommendationsTitle}>
                                <AutoAwesome sx={S.getAiSparkleIconStyle(isLoading)} />
                                {isLoading ? 'Montando seu plano de treino...' : 'Jogos Recomendados'}
                            </Typography>

                            {isLoading ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6, gap: 2 }}>
                                    <Typography variant="body1" sx={{ color: '#a0aec0', textAlign: 'center' }}>
                                        🤖 Nossa IA está selecionando os melhores jogos para você...
                                    </Typography>
                                </Box>
                            ) : (
                                <RecommendationsList
                                    games={recommendations}
                                />
                            )}
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
                        sx={S.errorAlert}
                    >
                        {error}
                    </Alert>
                </Snackbar>
            </Container>
        </Box>
    );
};