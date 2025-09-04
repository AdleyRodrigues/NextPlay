import React from 'react';
import {
    Box,
    Grid,
    Typography,
    CircularProgress,
    Skeleton,
    Paper,
    Button,
} from '@mui/material';
import { Refresh, TrendingUp, SentimentDissatisfied } from '@mui/icons-material';
import { GameCard } from '../GameCard/GameCard';
import type { Game } from '../../api/schemas';

interface RecommendationsListProps {
    games?: Game[];
    isLoading: boolean;
    isError: boolean;
    error?: Error | null;
    onRefresh: () => void;
    onLike: (gameId: string) => void;
    onDislike: (gameId: string) => void;
    onPlay: (gameId: string) => void;
    onSnooze: (gameId: string) => void;
}

const LoadingSkeleton = () => (
    <Grid container spacing={3}>
        {Array.from({ length: 6 }).map((_, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Paper sx={{ p: 2, height: 400 }}>
                    <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
                    <Skeleton variant="text" height={32} sx={{ mb: 1 }} />
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <Skeleton variant="rounded" width={60} height={24} />
                        <Skeleton variant="rounded" width={60} height={24} />
                        <Skeleton variant="rounded" width={60} height={24} />
                    </Box>
                    <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
                    <Skeleton variant="text" height={20} sx={{ mb: 2 }} />
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <Skeleton variant="rounded" width="48%" height={36} />
                        <Skeleton variant="rounded" width="48%" height={36} />
                    </Box>
                    <Skeleton variant="rounded" width="100%" height={36} />
                </Paper>
            </Grid>
        ))}
    </Grid>
);

const EmptyState = ({ onRefresh }: { onRefresh: () => void }) => (
    <Box
        sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 8,
            px: 3,
        }}
    >
        <Paper
            sx={{
                p: 4,
                textAlign: 'center',
                maxWidth: 400,
                background: 'linear-gradient(135deg, #2a475e 0%, #1b2838 100%)',
                border: '1px solid #66c0f4',
            }}
        >
            <SentimentDissatisfied
                sx={{
                    fontSize: 64,
                    color: '#66c0f4',
                    mb: 2
                }}
            />
            <Typography
                variant="h5"
                sx={{
                    color: '#ffffff',
                    mb: 2,
                    fontWeight: 600,
                }}
            >
                Nenhuma recomendação encontrada
            </Typography>
            <Typography
                variant="body1"
                sx={{
                    color: '#c7d5e0',
                    mb: 3,
                    lineHeight: 1.6,
                }}
            >
                Não encontramos jogos que combinem com suas preferências no momento.
                Tente ajustar os filtros ou tente novamente mais tarde.
            </Typography>
            <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={onRefresh}
                sx={{
                    backgroundColor: '#66c0f4',
                    color: '#1b2838',
                    fontWeight: 600,
                    '&:hover': {
                        backgroundColor: '#8ed8ff',
                    },
                }}
            >
                Tentar Novamente
            </Button>
        </Paper>
    </Box>
);

const ErrorState = ({ error, onRefresh }: { error?: Error | null; onRefresh: () => void }) => (
    <Box
        sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            py: 8,
            px: 3,
        }}
    >
        <Paper
            sx={{
                p: 4,
                textAlign: 'center',
                maxWidth: 400,
                background: 'linear-gradient(135deg, #2a475e 0%, #1b2838 100%)',
                border: '1px solid #ff6b6b',
            }}
        >
            <Box
                sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    backgroundColor: '#ff6b6b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                }}
            >
                <Typography variant="h4" sx={{ color: '#ffffff' }}>!</Typography>
            </Box>
            <Typography
                variant="h5"
                sx={{
                    color: '#ffffff',
                    mb: 2,
                    fontWeight: 600,
                }}
            >
                Erro ao buscar recomendações
            </Typography>
            <Typography
                variant="body1"
                sx={{
                    color: '#c7d5e0',
                    mb: 3,
                    lineHeight: 1.6,
                }}
            >
                {error?.message || 'Ocorreu um erro inesperado. Verifique sua conexão e tente novamente.'}
            </Typography>
            <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={onRefresh}
                sx={{
                    backgroundColor: '#ff6b6b',
                    color: '#ffffff',
                    fontWeight: 600,
                    '&:hover': {
                        backgroundColor: '#ff5252',
                    },
                }}
            >
                Tentar Novamente
            </Button>
        </Paper>
    </Box>
);

export const RecommendationsList: React.FC<RecommendationsListProps> = ({
    games,
    isLoading,
    isError,
    error,
    onRefresh,
    onLike,
    onDislike,
    onPlay,
    onSnooze,
}) => {
    // Loading state
    if (isLoading) {
        return (
            <Box sx={{ py: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
                    <CircularProgress sx={{ color: '#66c0f4', mr: 2 }} />
                    <Typography variant="h6" sx={{ color: '#c7d5e0' }}>
                        Buscando suas recomendações...
                    </Typography>
                </Box>
                <LoadingSkeleton />
            </Box>
        );
    }

    // Error state
    if (isError) {
        return <ErrorState error={error} onRefresh={onRefresh} />;
    }

    // Empty state
    if (!games || games.length === 0) {
        return <EmptyState onRefresh={onRefresh} />;
    }

    // Success state with games
    return (
        <Box sx={{ py: 4 }}>
            {/* Header */}
            <Paper
                sx={{
                    p: 3,
                    mb: 4,
                    background: 'linear-gradient(135deg, #2a475e 0%, #1b2838 100%)',
                    border: '1px solid #66c0f4',
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <TrendingUp sx={{ color: '#66c0f4', fontSize: 32 }} />
                        <Box>
                            <Typography
                                variant="h4"
                                sx={{
                                    color: '#ffffff',
                                    fontWeight: 700,
                                    mb: 0.5,
                                }}
                            >
                                🏆 TOP Recomendações
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: '#66c0f4',
                                    fontWeight: 600,
                                    fontSize: '0.85rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                }}
                            >
                                Ranking personalizado
                            </Typography>
                        </Box>
                    </Box>
                    <Button
                        variant="outlined"
                        startIcon={<Refresh />}
                        onClick={onRefresh}
                        sx={{
                            borderColor: '#66c0f4',
                            color: '#66c0f4',
                            '&:hover': {
                                backgroundColor: 'rgba(102, 192, 244, 0.1)',
                                borderColor: '#8ed8ff',
                            },
                        }}
                    >
                        ATUALIZAR
                    </Button>
                </Box>
                <Typography
                    variant="body1"
                    sx={{
                        color: '#c7d5e0',
                        lineHeight: 1.6,
                    }}
                >
                    Encontramos {games.length} {games.length === 1 ? 'jogo' : 'jogos'} perfeitos para você baseados nas suas preferências
                </Typography>
            </Paper>

            {/* Games Grid */}
            <Grid container spacing={3}>
                {games.map((game, index) => (
                    <Grid key={game.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                        <GameCard
                            game={game}
                            onLike={onLike}
                            onDislike={onDislike}
                            onPlay={onPlay}
                            onSnooze={onSnooze}
                            showPlayTime={false}
                            rank={index + 1}
                        />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};
