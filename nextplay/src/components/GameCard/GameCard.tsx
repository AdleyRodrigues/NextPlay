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
    Star,
    TrendingUp,
    Search,
} from '@mui/icons-material';
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
                height: '100%', // Garantir que todos os cards tenham a mesma altura
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4)',
                    borderColor: 'rgba(102, 126, 234, 0.3)',
                },
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Posição da Recomendação */}
            {game.position && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        zIndex: 2,
                    }}
                >
                    <Chip
                        label={`#${game.position}`}
                        size="small"
                        sx={{
                            background: 'rgba(102, 126, 234, 0.9)',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                        }}
                    />
                </Box>
            )}
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
                            startIcon={<Search />}
                            onClick={(e) => {
                                e.stopPropagation();
                                window.open(`https://www.google.com/search?q=${encodeURIComponent(game.name + ' game')}`, '_blank');
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
                            PESQUISAR JOGO
                        </Button>
                    </Box>
                </Fade>

            </Box>

            <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Stack spacing={2} sx={{ flex: 1 }}>
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
                            height: '2.6em', // Altura fixa para simetria
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

                    {/* Recommendation Reasons */}
                    <Box sx={{ minHeight: '80px' }}> {/* Altura mínima fixa para simetria */}
                        {game.reasons && game.reasons.length > 0 && (
                            <Box>
                                <Typography variant="body2" sx={{
                                    color: '#a0aec0',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    mb: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                }}>
                                    <TrendingUp sx={{ fontSize: '0.8rem' }} />
                                    Por que recomendamos:
                                </Typography>
                                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                                    {game.reasons.map((reason, index) => (
                                        <Chip
                                            key={index}
                                            label={reason}
                                            size="small"
                                            sx={{
                                                backgroundColor: 'rgba(102, 126, 234, 0.2)',
                                                color: '#a0aec0',
                                                border: '1px solid rgba(102, 126, 234, 0.3)',
                                                fontWeight: 500,
                                                fontSize: '0.7rem',
                                                height: 20,
                                                mb: 0.5,
                                                '& .MuiChip-label': {
                                                    px: 1,
                                                },
                                            }}
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
                    sx={{
                        borderColor: 'rgba(102, 126, 234, 0.3)',
                        color: '#667eea',
                        fontWeight: 600,
                        py: 1.5,
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontSize: '0.9rem',
                        mt: 2, // Espaçamento do conteúdo acima
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
            </CardContent>
        </Card>
    );
};