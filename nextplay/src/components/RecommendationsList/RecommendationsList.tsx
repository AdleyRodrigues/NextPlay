import React, { useState } from 'react';
import {
    Box,
    Grid,
    Typography,
} from '@mui/material';
import { GameCard } from '../GameCard/GameCard';
import { GameDetailsModal } from '../GameDetailsModal/GameDetailsModal';
import type { Game } from '../../api/schemas';

interface RecommendationsListProps {
    games: Game[];
}

export const RecommendationsList: React.FC<RecommendationsListProps> = ({
    games,
}) => {
    const [selectedGame, setSelectedGame] = useState<Game | null>(null);

    const handleViewDetails = (game: Game) => {
        setSelectedGame(game);
    };

    const handleCloseDetails = () => {
        setSelectedGame(null);
    };

    const renderContent = () => {
        // Empty state
        if (!games || games.length === 0) {
            return (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" sx={{ color: '#a0aec0', mb: 2 }}>
                        Nenhuma recomendação encontrada
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#a0aec0' }}>
                        Tente ajustar seus filtros ou conectar sua conta Steam
                    </Typography>
                </Box>
            );
        }

        // Success state
        return (
            <Grid container spacing={3}>
                {games.map((game) => (
                    <Grid key={game.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                        <GameCard
                            game={game}
                            onViewDetails={handleViewDetails}
                        />
                    </Grid>
                ))}
            </Grid>
        );
    };

    return (
        <Box>
            {renderContent()}

            {/* Game Details Modal */}
            {selectedGame && (
                <GameDetailsModal
                    open={!!selectedGame}
                    onClose={handleCloseDetails}
                    game={selectedGame}
                />
            )}
        </Box>
    );
};