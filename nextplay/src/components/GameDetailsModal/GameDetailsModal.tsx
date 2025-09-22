import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Chip,
    LinearProgress,
    Card,
    CardContent,
    IconButton,
    Stack,
    Paper,
} from '@mui/material';
import {
    Close,
    AccessTime,
    Star,
    PlayArrow,
    TrendingUp,
    EmojiEvents,
    Psychology,
    Lightbulb,
} from '@mui/icons-material';
import { formatHours } from '../../utils/format';
import type { Game } from '../../api/schemas';
import { apiClient } from '../../api/client';

interface GameDetailsModalProps {
    open: boolean;
    onClose: () => void;
    game: Game | null;
}

export const GameDetailsModal: React.FC<GameDetailsModalProps> = ({
    open,
    onClose,
    game,
}) => {
    const [reviews, setReviews] = React.useState<Array<{
        author: { steamId: string };
        review: string;
        votedUp: boolean;
        votesUp: number;
        votesFunny: number;
        playtimeAtReview: number;
    }>>([]);
    const [loadingReviews, setLoadingReviews] = React.useState(false);

    const fetchReviews = React.useCallback(async () => {
        if (!game?.id) return;

        setLoadingReviews(true);
        try {
            // Extrair appId do ID do jogo (assumindo que o ID é o appId do Steam)
            const appId = parseInt(game.id);
            if (isNaN(appId)) return;

            const response = await apiClient.getGameReviews(appId);
            if (response?.reviews) {
                setReviews(response.reviews);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
            setReviews([]);
        } finally {
            setLoadingReviews(false);
        }
    }, [game?.id]);

    React.useEffect(() => {
        if (open && game) {
            fetchReviews();
        }
    }, [open, game, fetchReviews]);

    if (!game) return null;

    const playtimeHours = game.hoursPlayed || 0;
    const estimatedHours = game.hltbMain || EstimatePlaytimeFromGenres(game.genres || []);
    const progressPercentage = estimatedHours > 0 ? (playtimeHours / estimatedHours) * 100 : 0;

    // Função para estimar tempo de jogo baseado nos gêneros
    function EstimatePlaytimeFromGenres(genres: string[]): number {
        if (!genres || genres.length === 0) return 20; // Default 20h

        const genreEstimates: { [key: string]: number } = {
            'RPG': 40,
            'Adventure': 15,
            'Action': 12,
            'Shooter': 10,
            'Strategy': 25,
            'Simulation': 30,
            'Puzzle': 8,
            'Racing': 6,
            'Sports': 5,
            'Fighting': 4,
            'Platform': 8,
            'Horror': 8,
            'Stealth': 12,
            'Survival': 20,
            'Open World': 35,
            'Story Rich': 20,
            'Casual': 5,
            'Indie': 8,
            'Arcade': 3,
            'Party': 4
        };

        // Encontrar o gênero com maior estimativa
        let maxEstimate = 20; // Default
        for (const genre of genres) {
            const estimate = genreEstimates[genre] || 20;
            if (estimate > maxEstimate) {
                maxEstimate = estimate;
            }
        }

        return maxEstimate;
    }

    // Dados reais de conquistas (quando disponíveis)
    const totalAchievements = game.achievementsTotal || 0;
    const unlockedAchievements = game.achievementsUnlocked || 0;
    const remainingAchievements = totalAchievements - unlockedAchievements;

    const getProgressStatus = () => {
        if (progressPercentage >= 100) return { text: 'Completado!', color: '#48bb78', icon: '🎉' };
        if (progressPercentage >= 80) return { text: 'Quase terminado!', color: '#ed8936', icon: '🎯' };
        if (progressPercentage >= 50) return { text: 'Bem avançado', color: '#4299e1', icon: '🚀' };
        if (progressPercentage >= 20) return { text: 'Em progresso', color: '#9f7aea', icon: '⚡' };
        if (playtimeHours > 0) return { text: 'Recém começado', color: '#38b2ac', icon: '🌱' };
        return { text: 'Não jogado', color: '#e53e3e', icon: '💤' };
    };

    const progressStatus = getProgressStatus();

    const getLastPlayedText = () => {
        if (!game.lastPlayed) return 'Nunca jogado';

        const lastPlayed = new Date(game.lastPlayed);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - lastPlayed.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Hoje';
        if (diffDays === 1) return 'Ontem';
        if (diffDays < 7) return `${diffDays} dias atrás`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} meses atrás`;
        return `${Math.floor(diffDays / 365)} anos atrás`;
    };

    const getGameAnalysis = () => {
        const analysis = [];

        // Análise de progresso
        if (progressPercentage >= 80 && progressPercentage < 100) {
            analysis.push({
                icon: '🎯',
                title: 'Meta de Conclusão',
                description: `Você está a apenas ${Math.round(estimatedHours - playtimeHours)}h de completar este jogo!`,
                color: '#ed8936'
            });
        }

        // Análise de qualidade
        if (game.metaScore && game.metaScore >= 85) {
            analysis.push({
                icon: '🏆',
                title: 'Obra-Prima',
                description: `Metacritic ${game.metaScore} - Este é um dos melhores jogos já feitos!`,
                color: '#48bb78'
            });
        }

        // Análise de tempo
        if (playtimeHours > 0 && playtimeHours < 5) {
            analysis.push({
                icon: '🚀',
                title: 'Potencial Inexplorado',
                description: 'Você mal começou a explorar este mundo incrível!',
                color: '#4299e1'
            });
        }

        // Análise de recência
        if (game.lastPlayed) {
            const lastPlayed = new Date(game.lastPlayed);
            const daysSince = Math.floor((new Date().getTime() - lastPlayed.getTime()) / (1000 * 60 * 60 * 24));

            if (daysSince > 90) {
                analysis.push({
                    icon: '💎',
                    title: 'Clássico Esquecido',
                    description: 'Este jogo merece uma segunda chance!',
                    color: '#9f7aea'
                });
            }
        }

        return analysis;
    };

    const gameAnalysis = getGameAnalysis();

    const getScoreColor = (score: number) => {
        if (score >= 80) return '#48bb78';
        if (score >= 60) return '#ed8936';
        return '#e53e3e';
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: {
                    background: 'linear-gradient(135deg, #0f1419 0%, #1a1f2e 50%, #2d3748 100%)',
                    color: '#ffffff',
                    borderRadius: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(20px)',
                    overflow: 'hidden',
                }
            }}
            BackdropProps={{
                sx: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    backdropFilter: 'blur(10px)',
                }
            }}
        >
            {/* Header */}
            <DialogTitle sx={{
                p: 0,
                position: 'relative',
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}>
                <Box sx={{ p: 4, pb: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box sx={{ flex: 1 }}>
                            <Typography
                                variant="h3"
                                sx={{
                                    fontWeight: 800,
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    mb: 1,
                                    fontSize: { xs: '1.8rem', md: '2.5rem' },
                                    lineHeight: 1.2,
                                }}
                            >
                                {game.name}
                            </Typography>
                            <Typography
                                variant="h6"
                                sx={{
                                    color: '#a0aec0',
                                    fontWeight: 500,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                }}
                            >
                                <Psychology sx={{ fontSize: '1.2rem' }} />
                                Análise detalhada do jogo
                            </Typography>
                        </Box>
                        <IconButton
                            onClick={onClose}
                            sx={{
                                color: '#a0aec0',
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    color: '#ffffff',
                                    transform: 'scale(1.05)',
                                },
                                transition: 'all 0.2s ease-in-out',
                            }}
                        >
                            <Close />
                        </IconButton>
                    </Stack>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 0 }}>
                {/* Game Image and Basic Info */}
                <Box sx={{ p: 4, pb: 2 }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
                        {/* Game Image */}
                        <Box sx={{ flex: { xs: '1', md: '0 0 40%' } }}>
                            <Paper
                                sx={{
                                    position: 'relative',
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    '&:hover': {
                                        transform: 'scale(1.02)',
                                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                                    },
                                    transition: 'all 0.3s ease-in-out',
                                }}
                            >
                                <Box
                                    component="img"
                                    src={game.coverImage}
                                    alt={game.name}
                                    sx={{
                                        width: '100%',
                                        height: { xs: 200, md: 300 },
                                        objectFit: 'cover',
                                        display: 'block',
                                    }}
                                />
                                {/* Overlay with play button */}
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                        background: 'rgba(0, 0, 0, 0.7)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        opacity: 0,
                                        transition: 'opacity 0.3s ease-in-out',
                                        '&:hover': {
                                            opacity: 1,
                                        },
                                    }}
                                >
                                    <Button
                                        variant="contained"
                                        startIcon={<PlayArrow />}
                                        onClick={() => window.open(`https://store.steampowered.com/app/${game.id}`, '_blank')}
                                        sx={{
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            color: '#ffffff',
                                            fontWeight: 700,
                                            px: 4,
                                            py: 2,
                                            borderRadius: '12px',
                                            textTransform: 'none',
                                            fontSize: '1.1rem',
                                            boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)',
                                            '&:hover': {
                                                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                                                transform: 'translateY(-2px)',
                                                boxShadow: '0 12px 25px rgba(102, 126, 234, 0.5)',
                                            },
                                            transition: 'all 0.2s ease-in-out',
                                        }}
                                    >
                                        Jogar no Steam
                                    </Button>
                                </Box>
                            </Paper>
                        </Box>

                        {/* Game Info */}
                        <Box sx={{ flex: 1 }}>
                            <Stack spacing={3}>
                                {/* Scores */}
                                <Box>
                                    <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                                        {game.metaScore && (
                                            <Chip
                                                label={`Meta: ${game.metaScore}`}
                                                sx={{
                                                    backgroundColor: getScoreColor(game.metaScore),
                                                    color: '#ffffff',
                                                    fontWeight: 700,
                                                    fontSize: '0.9rem',
                                                    px: 2,
                                                    py: 1,
                                                }}
                                            />
                                        )}
                                        {game.openCriticScore && (
                                            <Chip
                                                label={`OC: ${game.openCriticScore}`}
                                                sx={{
                                                    backgroundColor: getScoreColor(game.openCriticScore),
                                                    color: '#ffffff',
                                                    fontWeight: 700,
                                                    fontSize: '0.9rem',
                                                    px: 2,
                                                    py: 1,
                                                }}
                                            />
                                        )}
                                        {game.steamScore && (
                                            <Chip
                                                icon={<Star sx={{ fontSize: '1rem' }} />}
                                                label={`${game.steamScore}%`}
                                                sx={{
                                                    backgroundColor: '#4299e1',
                                                    color: '#ffffff',
                                                    fontWeight: 700,
                                                    fontSize: '0.9rem',
                                                    px: 2,
                                                    py: 1,
                                                }}
                                            />
                                        )}
                                    </Stack>
                                </Box>

                                {/* User Reviews */}
                                <Box>
                                    <Typography variant="h6" sx={{ color: '#ffffff', mb: 2, fontWeight: 600 }}>
                                        Avaliações de Usuários
                                    </Typography>
                                    {loadingReviews ? (
                                        <Box sx={{ textAlign: 'center', py: 3 }}>
                                            <Typography variant="body2" sx={{ color: '#a0aec0' }}>
                                                Carregando avaliações...
                                            </Typography>
                                        </Box>
                                    ) : reviews.length > 0 ? (
                                        <Stack spacing={2}>
                                            {reviews.map((review, index) => (
                                                <Paper
                                                    key={index}
                                                    sx={{
                                                        p: 2,
                                                        background: 'rgba(255, 255, 255, 0.05)',
                                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                                        borderRadius: '12px',
                                                    }}
                                                >
                                                    <Stack direction="row" spacing={2} alignItems="flex-start">
                                                        <Box
                                                            sx={{
                                                                width: 32,
                                                                height: 32,
                                                                borderRadius: '50%',
                                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                color: '#ffffff',
                                                                fontWeight: 600,
                                                                fontSize: '0.8rem',
                                                            }}
                                                        >
                                                            {review.author.steamId.charAt(0).toUpperCase()}
                                                        </Box>
                                                        <Box sx={{ flex: 1 }}>
                                                            <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                                                                <Typography variant="body2" sx={{ color: '#ffffff', fontWeight: 600 }}>
                                                                    Steam User
                                                                </Typography>
                                                                <Stack direction="row" spacing={0.5}>
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <Star
                                                                            key={i}
                                                                            sx={{
                                                                                fontSize: '0.8rem',
                                                                                color: i < (review.votedUp ? 5 : 2) ? '#ffd700' : '#a0aec0',
                                                                            }}
                                                                        />
                                                                    ))}
                                                                </Stack>
                                                                <Chip
                                                                    label={review.votedUp ? 'Recomendado' : 'Não Recomendado'}
                                                                    size="small"
                                                                    sx={{
                                                                        backgroundColor: review.votedUp ? '#48bb78' : '#e53e3e',
                                                                        color: '#ffffff',
                                                                        fontSize: '0.7rem',
                                                                        height: 20,
                                                                    }}
                                                                />
                                                            </Stack>
                                                            <Typography variant="body2" sx={{ color: '#a0aec0', lineHeight: 1.4, mb: 1 }}>
                                                                {review.review}
                                                            </Typography>
                                                            <Stack direction="row" spacing={2} alignItems="center">
                                                                <Typography variant="caption" sx={{ color: '#718096' }}>
                                                                    {review.playtimeAtReview > 0 ? `${Math.round(review.playtimeAtReview / 60)}h jogadas` : 'Recém comprado'}
                                                                </Typography>
                                                                {review.votesUp > 0 && (
                                                                    <Typography variant="caption" sx={{ color: '#718096' }}>
                                                                        👍 {review.votesUp} útil
                                                                    </Typography>
                                                                )}
                                                                {review.votesFunny > 0 && (
                                                                    <Typography variant="caption" sx={{ color: '#718096' }}>
                                                                        😂 {review.votesFunny} engraçado
                                                                    </Typography>
                                                                )}
                                                            </Stack>
                                                        </Box>
                                                    </Stack>
                                                </Paper>
                                            ))}
                                        </Stack>
                                    ) : (
                                        <Box sx={{ textAlign: 'center', py: 3 }}>
                                            <Typography variant="body2" sx={{ color: '#a0aec0' }}>
                                                Nenhuma avaliação em português encontrada para este jogo
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#718096', mt: 1, display: 'block' }}>
                                                Tente novamente mais tarde ou verifique se o jogo tem reviews curtas em português
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>

                                {/* Duration */}
                                {estimatedHours > 0 && (
                                    <Box>
                                        <Typography variant="h6" sx={{ color: '#ffffff', mb: 2, fontWeight: 600 }}>
                                            Duração
                                        </Typography>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <AccessTime sx={{ color: '#667eea', fontSize: '1.5rem' }} />
                                            <Box>
                                                <Typography variant="body1" sx={{ color: '#ffffff', fontWeight: 600 }}>
                                                    ~{estimatedHours}h para completar
                                                </Typography>
                                                {!game.hltbMain && (
                                                    <Typography variant="body2" sx={{ color: '#a0aec0', fontSize: '0.8rem' }}>
                                                        (estimativa baseada no gênero)
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Stack>
                                    </Box>
                                )}

                                {/* Genres */}
                                {game.genres && game.genres.length > 0 && (
                                    <Box>
                                        <Typography variant="h6" sx={{ color: '#ffffff', mb: 2, fontWeight: 600 }}>
                                            Gêneros
                                        </Typography>
                                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                            {game.genres.map((genre, index) => (
                                                <Chip
                                                    key={index}
                                                    label={genre}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: 'rgba(102, 126, 234, 0.2)',
                                                        color: '#667eea',
                                                        border: '1px solid rgba(102, 126, 234, 0.3)',
                                                        fontWeight: 500,
                                                    }}
                                                />
                                            ))}
                                        </Stack>
                                    </Box>
                                )}

                            </Stack>
                        </Box>
                    </Stack>
                </Box>

                {/* Progress Section */}
                <Box sx={{ px: 4, pb: 2 }}>
                    <Card sx={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '20px',
                        backdropFilter: 'blur(10px)',
                    }}>
                        <CardContent sx={{ p: 4 }}>
                            <Stack spacing={3}>
                                <Typography variant="h5" sx={{ color: '#ffffff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <TrendingUp sx={{ fontSize: '1.8rem', color: '#667eea' }} />
                                    Progresso do Jogo
                                </Typography>

                                <Box>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                                        <Typography variant="body1" sx={{ color: '#a0aec0' }}>
                                            Tempo jogado: {formatHours(playtimeHours)}
                                        </Typography>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <Typography variant="body1" sx={{ fontSize: '1.2rem' }}>
                                                {progressStatus.icon}
                                            </Typography>
                                            <Typography variant="body1" sx={{ color: progressStatus.color, fontWeight: 600 }}>
                                                {progressStatus.text}
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                    <LinearProgress
                                        variant="determinate"
                                        value={Math.min(progressPercentage, 100)}
                                        sx={{
                                            height: 12,
                                            borderRadius: 6,
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                            '& .MuiLinearProgress-bar': {
                                                background: `linear-gradient(90deg, ${progressStatus.color} 0%, ${progressStatus.color}dd 100%)`,
                                                borderRadius: 6,
                                            },
                                        }}
                                    />
                                    <Typography variant="body2" sx={{ color: '#a0aec0', mt: 1 }}>
                                        {progressPercentage.toFixed(1)}% completo
                                        {estimatedHours > 0 && ` (estimativa: ~${estimatedHours}h para completar)`}
                                    </Typography>
                                </Box>

                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                    <Paper sx={{
                                        flex: 1,
                                        p: 3,
                                        background: 'rgba(102, 126, 234, 0.1)',
                                        border: '1px solid rgba(102, 126, 234, 0.2)',
                                        borderRadius: '16px',
                                        textAlign: 'center',
                                    }}>
                                        <Typography variant="h4" sx={{ color: '#667eea', fontWeight: 800, mb: 1 }}>
                                            {playtimeHours.toFixed(1)}h
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#a0aec0', fontWeight: 500 }}>
                                            Tempo jogado
                                        </Typography>
                                    </Paper>
                                    <Paper sx={{
                                        flex: 1,
                                        p: 3,
                                        background: 'rgba(118, 75, 162, 0.1)',
                                        border: '1px solid rgba(118, 75, 162, 0.2)',
                                        borderRadius: '16px',
                                        textAlign: 'center',
                                    }}>
                                        <Typography variant="h6" sx={{ color: '#764ba2', fontWeight: 800, mb: 1, fontSize: '1.5rem' }}>
                                            {getLastPlayedText()}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#a0aec0', fontWeight: 500 }}>
                                            Último jogo
                                        </Typography>
                                    </Paper>
                                </Stack>
                            </Stack>
                        </CardContent>
                    </Card>
                </Box>

                {/* Achievements Section */}
                <Box sx={{ px: 4, pb: 2 }}>
                    <Card sx={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '20px',
                        backdropFilter: 'blur(10px)',
                    }}>
                        <CardContent sx={{ p: 4 }}>
                            <Stack spacing={3}>
                                <Typography variant="h5" sx={{ color: '#ffffff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <EmojiEvents sx={{ fontSize: '1.8rem', color: '#ed8936' }} />
                                    Conquistas
                                </Typography>

                                {totalAchievements > 0 ? (
                                    <>
                                        <Box>
                                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                                                <Typography variant="body1" sx={{ color: '#a0aec0' }}>
                                                    {unlockedAchievements} de {totalAchievements} conquistas
                                                </Typography>
                                                <Typography variant="body1" sx={{ color: '#48bb78', fontWeight: 600 }}>
                                                    {Math.round((unlockedAchievements / totalAchievements) * 100)}% completo
                                                </Typography>
                                            </Stack>
                                            <LinearProgress
                                                variant="determinate"
                                                value={(unlockedAchievements / totalAchievements) * 100}
                                                sx={{
                                                    height: 12,
                                                    borderRadius: 6,
                                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                    '& .MuiLinearProgress-bar': {
                                                        background: 'linear-gradient(90deg, #48bb78 0%, #38a169 100%)',
                                                        borderRadius: 6,
                                                    },
                                                }}
                                            />
                                        </Box>

                                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                            <Paper sx={{
                                                flex: 1,
                                                p: 3,
                                                background: 'rgba(72, 187, 120, 0.1)',
                                                border: '1px solid rgba(72, 187, 120, 0.2)',
                                                borderRadius: '16px',
                                                textAlign: 'center',
                                            }}>
                                                <Typography variant="h4" sx={{ color: '#48bb78', fontWeight: 800, mb: 1 }}>
                                                    {unlockedAchievements}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: '#a0aec0', fontWeight: 500 }}>
                                                    Desbloqueadas
                                                </Typography>
                                            </Paper>
                                            <Paper sx={{
                                                flex: 1,
                                                p: 3,
                                                background: 'rgba(237, 137, 54, 0.1)',
                                                border: '1px solid rgba(237, 137, 54, 0.2)',
                                                borderRadius: '16px',
                                                textAlign: 'center',
                                            }}>
                                                <Typography variant="h4" sx={{ color: '#ed8936', fontWeight: 800, mb: 1 }}>
                                                    {remainingAchievements}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: '#a0aec0', fontWeight: 500 }}>
                                                    Restantes
                                                </Typography>
                                            </Paper>
                                            <Paper sx={{
                                                flex: 1,
                                                p: 3,
                                                background: 'rgba(102, 126, 234, 0.1)',
                                                border: '1px solid rgba(102, 126, 234, 0.2)',
                                                borderRadius: '16px',
                                                textAlign: 'center',
                                            }}>
                                                <Typography variant="h4" sx={{ color: '#667eea', fontWeight: 800, mb: 1 }}>
                                                    {totalAchievements}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: '#a0aec0', fontWeight: 500 }}>
                                                    Total
                                                </Typography>
                                            </Paper>
                                        </Stack>
                                    </>
                                ) : (
                                    <Box sx={{ textAlign: 'center', py: 4 }}>
                                        <Typography variant="h6" sx={{ color: '#a0aec0', mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                            <EmojiEvents sx={{ fontSize: '1.5rem' }} />
                                            Dados de conquistas não disponíveis
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#a0aec0', opacity: 0.7 }}>
                                            Este jogo pode não ter conquistas ou os dados ainda não foram carregados
                                        </Typography>
                                    </Box>
                                )}
                            </Stack>
                        </CardContent>
                    </Card>
                </Box>

                {/* Game Analysis */}
                {gameAnalysis.length > 0 && (
                    <Box sx={{ px: 4, pb: 2 }}>
                        <Card sx={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '20px',
                            backdropFilter: 'blur(10px)',
                        }}>
                            <CardContent sx={{ p: 4 }}>
                                <Stack spacing={3}>
                                    <Typography variant="h5" sx={{ color: '#ffffff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Psychology sx={{ fontSize: '1.8rem', color: '#9f7aea' }} />
                                        Análise Gamer
                                    </Typography>

                                    <Stack spacing={2}>
                                        {gameAnalysis.map((analysis, index) => (
                                            <Paper key={index} sx={{
                                                p: 3,
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                border: `1px solid ${analysis.color}40`,
                                                borderRadius: '16px',
                                                '&:hover': {
                                                    background: 'rgba(255, 255, 255, 0.08)',
                                                    transform: 'translateY(-2px)',
                                                },
                                                transition: 'all 0.2s ease-in-out',
                                            }}>
                                                <Stack direction="row" spacing={2} alignItems="flex-start">
                                                    <Typography variant="h4" sx={{ fontSize: '1.5rem' }}>
                                                        {analysis.icon}
                                                    </Typography>
                                                    <Box>
                                                        <Typography variant="h6" sx={{ color: analysis.color, mb: 1, fontWeight: 600 }}>
                                                            {analysis.title}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ color: '#a0aec0', lineHeight: 1.6 }}>
                                                            {analysis.description}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </Paper>
                                        ))}
                                    </Stack>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Box>
                )}

                {/* Recommendation Reasons */}
                {game.reasons && game.reasons.length > 0 && (
                    <Box sx={{ px: 4, pb: 2 }}>
                        <Card sx={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '20px',
                            backdropFilter: 'blur(10px)',
                        }}>
                            <CardContent sx={{ p: 4 }}>
                                <Stack spacing={3}>
                                    <Typography variant="h5" sx={{ color: '#ffffff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Lightbulb sx={{ fontSize: '1.8rem', color: '#ed8936' }} />
                                        Por que recomendamos
                                    </Typography>

                                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                        {game.reasons.map((reason, index) => (
                                            <Chip
                                                key={index}
                                                label={reason}
                                                sx={{
                                                    backgroundColor: 'rgba(102, 126, 234, 0.2)',
                                                    color: '#667eea',
                                                    border: '1px solid rgba(102, 126, 234, 0.3)',
                                                    fontWeight: 500,
                                                    px: 2,
                                                    py: 1,
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(102, 126, 234, 0.3)',
                                                        transform: 'translateY(-1px)',
                                                    },
                                                    transition: 'all 0.2s ease-in-out',
                                                }}
                                            />
                                        ))}
                                    </Stack>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Box>
                )}
            </DialogContent>

            {/* Footer Actions */}
            <DialogActions sx={{
                p: 4,
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            }}>
                <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
                    <Button
                        onClick={onClose}
                        variant="outlined"
                        sx={{
                            borderColor: 'rgba(255, 255, 255, 0.3)',
                            color: '#a0aec0',
                            px: 4,
                            py: 2,
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '1rem',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                borderColor: '#ffffff',
                                color: '#ffffff',
                            },
                            transition: 'all 0.2s ease-in-out',
                        }}
                    >
                        Fechar
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<PlayArrow />}
                        onClick={() => window.open(`https://store.steampowered.com/app/${game.id}`, '_blank')}
                        sx={{
                            flex: 1,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: '#ffffff',
                            fontWeight: 700,
                            px: 4,
                            py: 2,
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontSize: '1rem',
                            boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 12px 25px rgba(102, 126, 234, 0.5)',
                            },
                            transition: 'all 0.2s ease-in-out',
                        }}
                    >
                        Jogar no Steam
                    </Button>
                </Stack>
            </DialogActions>
        </Dialog>
    );
};