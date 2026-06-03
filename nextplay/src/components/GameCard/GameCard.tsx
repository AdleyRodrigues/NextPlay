import React, { useState } from 'react';
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Box,
    Button,
    Chip,
    Stack,
    Fade,
    Tooltip,
} from '@mui/material';
import {
    Visibility,
    TrendingUp,
    Search,
} from '@mui/icons-material';
import type { Game } from '../../api/schemas';
import * as S from './GameCard.styles';

interface GameCardProps {
    game: Game;
    onViewDetails: (game: Game) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onViewDetails }) => {
    const [isHovered, setIsHovered] = useState(false);

    const getScoreColor = (score: number) => {
        if (score >= 80) return '#48bb78';
        if (score >= 60) return '#ed8936';
        return '#e53e3e';
    };


    return (
        <Card
            sx={S.card}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Posição da Recomendação */}
            {game.position && (
                <Box sx={S.positionBadge}>
                    <Chip
                        label={`#${game.position}`}
                        size="small"
                        sx={S.positionChip}
                    />
                </Box>
            )}
            {/* Game Image with Hover Overlay */}
            <Box sx={S.imageContainer}>
                <Box sx={S.imageWrapper}>
                    <CardMedia
                        component="img"
                        image={game.coverImage}
                        alt={game.name}
                        sx={S.media}
                    />
                </Box>

                {/* Hover Overlay with Steam Button */}
                <Fade in={isHovered} timeout={200}>
                    <Box sx={S.hoverOverlay}>
                        <Button
                            variant="contained"
                            startIcon={<Search />}
                            onClick={(e) => {
                                e.stopPropagation();
                                window.open(`https://www.google.com/search?q=${encodeURIComponent(game.name + ' game')}`, '_blank');
                            }}
                            sx={S.searchButton}
                        >
                            PESQUISAR JOGO
                        </Button>
                    </Box>
                </Fade>

            </Box>

            <CardContent sx={S.cardContent}>
                <Stack spacing={2} sx={S.stackContainer}>
                    {/* Game Title */}
                    <Typography variant="h6" sx={S.gameTitle}>
                        {game.name}
                    </Typography>

                    {/* Scores */}
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {game.metaScore && (
                            <Tooltip title="Nota da Crítica Especializada (Metacritic)" arrow placement="top">
                                <Chip
                                    label={`Metacritic: ${game.metaScore}`}
                                    size="small"
                                    sx={S.getMetaScoreChip(getScoreColor(game.metaScore))}
                                />
                            </Tooltip>
                        )}
                        {game.criticRating && (
                            <Tooltip title="Avaliação Geral (Jogadores e Crítica)" arrow placement="top">
                                <Chip
                                    label={`Avaliação: ${game.criticRating.toFixed(1)}/5`}
                                    size="small"
                                    sx={S.getMetaScoreChip('#4299e1')}
                                />
                            </Tooltip>
                        )}

                    </Stack>

                    {/* Recommendation Reasons */}
                    <Box sx={S.reasonsContainer}>
                        {game.reasons && game.reasons.length > 0 && (
                            <Box>
                                <Typography variant="body2" sx={S.reasonsTitle}>
                                    <TrendingUp sx={{ fontSize: '0.8rem' }} />
                                    Por que recomendamos:
                                </Typography>
                                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                                    {game.reasons.map((reason, index) => (
                                        <Chip
                                            key={index}
                                            label={reason}
                                            size="small"
                                            sx={S.reasonChip}
                                        />
                                    ))}
                                </Stack>
                            </Box>
                        )}
                    </Box>
                </Stack>

                {/* Action Button - Sempre no final */}
                <Button
                    variant="outlined"
                    startIcon={<Visibility />}
                    onClick={() => onViewDetails(game)}
                    sx={S.actionButton}
                >
                    Ver Detalhes
                </Button>
            </CardContent>
        </Card>
    );
};