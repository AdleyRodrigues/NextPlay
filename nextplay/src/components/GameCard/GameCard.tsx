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
    IconButton,
    Fade,
} from '@mui/material';
import {
    Visibility,
    PlayArrow,
    Star,
    TrendingUp,
    EmojiEvents,
} from '@mui/icons-material';
import { formatHours } from '../../utils/format';
import type { Game } from '../../api/schemas';

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

    const getProgressColor = () => {
        const progress = game.hoursPlayed || 0;
        const estimated = game.hltbMain || 20;
        const percentage = (progress / estimated) * 100;

        if (percentage >= 80) return '#48bb78';
        if (percentage >= 50) return '#ed8936';
        if (percentage >= 20) return '#4299e1';
        return '#9f7aea';
    };

    const getProgressText = () => {
        const progress = game.hoursPlayed || 0;
        const estimated = game.hltbMain || 20;
        const percentage = (progress / estimated) * 100;

        if (percentage >= 100) return 'Completado!';
        if (percentage >= 80) return 'Quase terminado!';
        if (percentage >= 50) return 'Bem avançado';
        if (percentage >= 20) return 'Em progresso';
        if (progress > 0) return 'Recém começado';
        return 'Não jogado';
    };

    return (
        <Card
            sx={{
                position: 'relative',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4)',
                    borderColor: 'rgba(102, 126, 234, 0.3)',
                },
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Game Image with Hover Overlay */}
            <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: 200,
                        background: 'rgba(0, 0, 0, 0.1)',
                    }}
                >
                    <CardMedia
                        component="img"
                        image={game.coverImage}
                        alt={game.name}
                        sx={{
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                            padding: '8px',
                            transition: 'transform 0.3s ease-in-out',
                            '&:hover': {
                                transform: 'scale(1.05)',
                            },
                        }}
                    />
                </Box>

                {/* Hover Overlay with Steam Button */}
                <Fade in={isHovered} timeout={200}>
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.8)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backdropFilter: 'blur(5px)',
                        }}
                    >
                        <Button
                            variant="contained"
                            startIcon={<PlayArrow />}
                            onClick={(e) => {
                                e.stopPropagation();
                                window.open(`https://store.steampowered.com/app/${game.id}`, '_blank');
                            }}
                            sx={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: '#ffffff',
                                fontWeight: 700,
                                px: 3,
                                py: 1.5,
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
                            VER NO STEAM
                        </Button>
                    </Box>
                </Fade>

            </Box>

            <CardContent sx={{ p: 3 }}>
                <Stack spacing={2}>
                    {/* Game Title */}
                    <Typography
                        variant="h6"
                        sx={{
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '1.1rem',
                            lineHeight: 1.3,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            minHeight: '2.6em',
                        }}
                    >
                        {game.name}
                    </Typography>

                    {/* Scores */}
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {game.metaScore && (
                            <Chip
                                label={`Meta: ${game.metaScore}`}
                                size="small"
                                sx={{
                                    backgroundColor: getScoreColor(game.metaScore),
                                    color: '#ffffff',
                                    fontWeight: 600,
                                    fontSize: '0.75rem',
                                    height: 24,
                                }}
                            />
                        )}
                        {game.steamScore && (
                            <Chip
                                icon={<Star sx={{ fontSize: '0.8rem' }} />}
                                label={`${game.steamScore}%`}
                                size="small"
                                sx={{
                                    backgroundColor: '#4299e1',
                                    color: '#ffffff',
                                    fontWeight: 600,
                                    fontSize: '0.75rem',
                                    height: 24,
                                }}
                            />
                        )}
                    </Stack>

                    {/* Progress Info */}
                    <Box>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="body2" sx={{ color: '#a0aec0', fontSize: '0.8rem' }}>
                                {formatHours(game.hoursPlayed || 0)} jogadas
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: getProgressColor(),
                                    fontWeight: 600,
                                    fontSize: '0.8rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                }}
                            >
                                <TrendingUp sx={{ fontSize: '0.9rem' }} />
                                {getProgressText()}
                            </Typography>
                        </Stack>

                        {/* Progress Bar */}
                        <Box sx={{
                            width: '100%',
                            height: 6,
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: 3,
                            overflow: 'hidden',
                        }}>
                            <Box
                                sx={{
                                    width: `${Math.min(((game.hoursPlayed || 0) / (game.hltbMain || 20)) * 100, 100)}%`,
                                    height: '100%',
                                    background: `linear-gradient(90deg, ${getProgressColor()} 0%, ${getProgressColor()}dd 100%)`,
                                    borderRadius: 3,
                                    transition: 'width 0.3s ease-in-out',
                                }}
                            />
                        </Box>
                    </Box>

                    {/* Achievements (if available) */}
                    {game.achievementsTotal && game.achievementsTotal > 0 && (
                        <Box>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <EmojiEvents sx={{ fontSize: '1rem', color: '#ed8936' }} />
                                <Typography variant="body2" sx={{ color: '#a0aec0', fontSize: '0.8rem' }}>
                                    {game.achievementsUnlocked || 0}/{game.achievementsTotal} conquistas
                                </Typography>
                            </Stack>
                        </Box>
                    )}

                    {/* Action Button */}
                    <Button
                        variant="outlined"
                        startIcon={<Visibility />}
                        onClick={() => onViewDetails(game)}
                        sx={{
                            borderColor: 'rgba(102, 126, 234, 0.3)',
                            color: '#667eea',
                            fontWeight: 600,
                            py: 1.5,
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontSize: '0.9rem',
                            '&:hover': {
                                borderColor: '#667eea',
                                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                color: '#ffffff',
                                transform: 'translateY(-1px)',
                            },
                            transition: 'all 0.2s ease-in-out',
                        }}
                    >
                        Ver Detalhes
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
};