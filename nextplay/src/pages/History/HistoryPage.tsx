import {
    Box,
    Typography,
    Grid,
    CircularProgress,
    Chip,
} from '@mui/material';
import { GameCard } from '../../components/GameCard/GameCard';
import { GameDetailsModal } from '../../components/GameDetailsModal/GameDetailsModal';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { useRefresh } from '../../hooks/useApi';
// import { useToast } from '../../hooks/useToast';
import { formatDate } from '../../utils/format';
import { useState } from 'react';

export const HistoryPage = () => {
    // const { showToast } = useToast();
    const [selectedGame, setSelectedGame] = useState<any>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    const refreshMutation = useRefresh();



    const handleViewDetails = (game: any) => {
        setSelectedGame(game);
        setIsDetailsModalOpen(true);
    };

    const handleCloseDetails = () => {
        setIsDetailsModalOpen(false);
        setSelectedGame(null);
    };

    const renderContent = () => {
        if (refreshMutation.isPending) {
            return (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: 400,
                    }}
                >
                    <CircularProgress />
                </Box>
            );
        }

        if (refreshMutation.error) {
            return (
                <EmptyState
                    title="Erro ao carregar histórico"
                    description="Não foi possível carregar seu histórico de jogos. Tente novamente."
                    showRefresh
                    onRefresh={() => refreshMutation.mutate('76561198000000000')}
                />
            );
        }

        if (!refreshMutation.data || !('games' in refreshMutation.data) || !refreshMutation.data.games || refreshMutation.data.games.length === 0) {
            return (
                <EmptyState
                    title="Nenhum jogo encontrado"
                    description="Parece que você ainda não tem jogos no seu perfil Steam ou eles não foram carregados."
                    showRefresh
                    onRefresh={() => refreshMutation.mutate('76561198000000000')}
                />
            );
        }

        // Agrupar jogos por data de último jogo
        const gamesByDate = (refreshMutation.data as any).games.reduce((acc: Record<string, any[]>, game: any) => {
            if (game.lastPlayed) {
                const date = formatDate(game.lastPlayed);
                if (!acc[date]) {
                    acc[date] = [];
                }
                acc[date].push(game);
            } else {
                if (!acc['Sem data']) {
                    acc['Sem data'] = [];
                }
                acc['Sem data'].push(game);
            }
            return acc;
        }, {} as Record<string, any[]>);

        return (
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Seu Histórico de Jogos
                </Typography>

                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Total de jogos: {(refreshMutation.data as any).games.length}
                </Typography>

                {Object.entries(gamesByDate).map(([date, games]) => (
                    <Box key={date} sx={{ mb: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" sx={{ mr: 2 }}>
                                {date}
                            </Typography>
                            <Chip label={(games as any[]).length} size="small" />
                        </Box>

                        <Grid container spacing={3}>
                            {(games as any[]).map((game) => (
                                <Grid key={game.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                    <GameCard
                                        game={game}
                                        onViewDetails={handleViewDetails}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                ))}
            </Box>
        );
    };

    return (
        <>
            {renderContent()}
            <GameDetailsModal
                open={isDetailsModalOpen}
                onClose={handleCloseDetails}
                game={selectedGame}
            />
        </>
    );
};
