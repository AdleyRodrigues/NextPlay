import { useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Button,
    Chip,
    CardMedia,
    Tooltip,
    IconButton,
    Divider,
} from '@mui/material';
import {
    ThumbUp,
    ThumbDown,
    SnoozeRounded,
    AccessTime,
    Star,
    OpenInNew,
    Storage,
} from '@mui/icons-material';
import { formatHours } from '../../utils/format';
import type { Game } from '../../api/schemas';

interface GameCardProps {
    game: Game;
    onLike: (gameId: string) => void;
    onDislike: (gameId: string) => void;
    onPlay: (gameId: string) => void;
    onSnooze?: (gameId: string) => void;
    showPlayTime?: boolean;
    rank?: number; // Posição no ranking
}

export const GameCard = ({
    game,
    onLike,
    onDislike,
    onPlay,
    onSnooze,
    showPlayTime = false,
    rank
}: GameCardProps) => {
    const [imageError, setImageError] = useState(false);

    const handleLike = () => onLike(game.id);
    const handleDislike = () => onDislike(game.id);
    const handlePlay = () => onPlay(game.id);
    const handleSnooze = () => onSnooze?.(game.id);

    const getImageSrc = () => {
        if (imageError) {
            return `https://via.placeholder.com/460x215/2a475e/66c0f4?text=${encodeURIComponent(game.name)}`;
        }
        return game.coverImage;
    };

    // Função para determinar estilo do ranking inline
    const getRankingChip = () => {
        if (!rank) return null;

        const getRankingStyle = () => {
            if (rank === 1) return {
                bg: 'linear-gradient(135deg, #FFD700, #FFA500)',
                color: '#1b2838',
                text: '🏆 TOP 1',
                shadow: '0 2px 8px rgba(255, 215, 0, 0.4)'
            };
            if (rank === 2) return {
                bg: 'linear-gradient(135deg, #C0C0C0, #A8A8A8)',
                color: '#1b2838',
                text: '🥈 TOP 2',
                shadow: '0 2px 8px rgba(192, 192, 192, 0.4)'
            };
            if (rank === 3) return {
                bg: 'linear-gradient(135deg, #CD7F32, #B87333)',
                color: '#ffffff',
                text: '🥉 TOP 3',
                shadow: '0 2px 8px rgba(205, 127, 50, 0.4)'
            };

            return {
                bg: 'linear-gradient(135deg, #66c0f4, #4A9EFF)',
                color: '#ffffff',
                text: `#${rank}`,
                shadow: '0 2px 8px rgba(102, 192, 244, 0.4)'
            };
        };

        const style = getRankingStyle();

        return (
            <Chip
                label={style.text}
                size="small"
                sx={{
                    background: style.bg,
                    color: style.color,
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    height: 24,
                    boxShadow: style.shadow,
                    '& .MuiChip-label': {
                        px: 1,
                        fontWeight: 700,
                    },
                    animation: rank <= 3 ? 'glow 2s ease-in-out infinite alternate' : 'none',
                    '@keyframes glow': {
                        from: { boxShadow: style.shadow },
                        to: { boxShadow: style.shadow.replace('0.4', '0.8') }
                    }
                }}
            />
        );
    };

    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                position: 'relative',
                animation: rank ? `slideInUp 0.8s ease-out ${(rank - 1) * 0.15}s both` : 'none',
                '@keyframes slideInUp': {
                    '0%': {
                        transform: 'translateY(30px)',
                        opacity: 0,
                        filter: 'blur(5px)'
                    },
                    '100%': {
                        transform: 'translateY(0)',
                        opacity: 1,
                        filter: 'blur(0px)'
                    }
                },
                flexDirection: 'column',
                background: 'linear-gradient(135deg, #2a475e 0%, #1b2838 100%)',
                border: '1px solid #66c0f4',
                borderRadius: '12px',
                overflow: 'hidden',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: '0 12px 40px rgba(102, 192, 244, 0.25)',
                    borderColor: '#8ed8ff',
                    '& .game-image': {
                        transform: 'scale(1.08)',
                    },
                },
            }}
        >
            {/* Game Image */}
            <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                <CardMedia
                    component="img"
                    height="200"
                    image={getImageSrc()}
                    alt={game.name}
                    className="game-image"
                    sx={{
                        objectFit: 'contain',
                        backgroundColor: '#1b2838',
                        transition: 'transform 0.3s ease-in-out',
                        cursor: 'pointer',
                        padding: '8px',
                    }}
                    onClick={handlePlay}
                    onError={() => {
                        if (!imageError) {
                            setImageError(true);
                        }
                    }}
                />
            </Box>

            <CardContent sx={{ flexGrow: 1, p: 2.5, display: 'flex', flexDirection: 'column' }}>
                {/* Game Title */}
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 700,
                        color: '#ffffff',
                        mb: 1.5,
                        lineHeight: 1.3,
                        cursor: 'pointer',
                        fontSize: '1.1rem',
                        transition: 'color 0.3s ease',
                        '&:hover': {
                            color: '#66c0f4',
                            textShadow: '0 0 8px rgba(102, 192, 244, 0.5)'
                        },
                    }}
                    onClick={handlePlay}
                >
                    {game.name}
                </Typography>

                {/* Ranking & Scores Section */}
                <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                        {/* Ranking Chip */}
                        {getRankingChip()}
                        {game.metaScore && (
                            <Tooltip title="Nota da crítica especializada (Metacritic)">
                                <Chip
                                    label={`Meta: ${game.metaScore}`}
                                    size="small"
                                    sx={{
                                        bgcolor: game.metaScore >= 75 ? '#a1d44a' : game.metaScore >= 50 ? '#ffd700' : '#ff6b6b',
                                        color: '#1b2838',
                                        fontWeight: 600,
                                        fontSize: '0.7rem',
                                    }}
                                />
                            </Tooltip>
                        )}
                        {game.openCriticScore && (
                            <Tooltip title="Nota da crítica especializada (OpenCritic)">
                                <Chip
                                    label={`OC: ${game.openCriticScore}`}
                                    size="small"
                                    sx={{
                                        bgcolor: game.openCriticScore >= 75 ? '#a1d44a' : game.openCriticScore >= 50 ? '#ffd700' : '#ff6b6b',
                                        color: '#1b2838',
                                        fontWeight: 600,
                                        fontSize: '0.7rem',
                                    }}
                                />
                            </Tooltip>
                        )}
                        {game.steamScore && (
                            <Tooltip title="Avaliação dos usuários do Steam">
                                <Chip
                                    icon={<Star sx={{ fontSize: '14px !important' }} />}
                                    label={`${game.steamScore}%`}
                                    size="small"
                                    sx={{
                                        bgcolor: '#66c0f4',
                                        color: '#1b2838',
                                        fontWeight: 600,
                                        fontSize: '0.7rem',
                                    }}
                                />
                            </Tooltip>
                        )}

                        {/* Critic Rating (for discovery) */}
                        {game.criticRating && !game.metaScore && !game.openCriticScore && (
                            <Tooltip title={`Avaliação da crítica (${game.store})`}>
                                <Chip
                                    label={`${game.store}: ${Math.round(game.criticRating)}`}
                                    size="small"
                                    sx={{
                                        bgcolor: game.criticRating >= 75 ? '#a1d44a' : game.criticRating >= 50 ? '#ffd700' : '#ff6b6b',
                                        color: '#1b2838',
                                        fontWeight: 600,
                                        fontSize: '0.7rem',
                                    }}
                                />
                            </Tooltip>
                        )}

                        {/* Store Source (for discovery) */}
                        {game.store && game.store !== 'Steam' && (
                            <Tooltip title={`Dados obtidos de ${game.store === 'IGDB' ? 'Internet Game Database' : 'RAWG Video Games Database'}`}>
                                <Chip
                                    icon={<Storage sx={{ fontSize: '12px !important' }} />}
                                    label={game.store}
                                    size="small"
                                    sx={{
                                        bgcolor: game.store === 'IGDB' ? 'rgba(76,175,80,0.2)' : 'rgba(33,150,243,0.2)',
                                        color: game.store === 'IGDB' ? '#4caf50' : '#2196f3',
                                        borderColor: game.store === 'IGDB' ? '#4caf50' : '#2196f3',
                                        fontWeight: 600,
                                        fontSize: '0.65rem',
                                        border: '1px solid',
                                    }}
                                />
                            </Tooltip>
                        )}
                    </Box>

                    {/* HLTB Duration */}
                    {game.hltbMain && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                            <AccessTime sx={{ fontSize: 16, color: '#c7d5e0' }} />
                            <Typography variant="body2" sx={{ color: '#c7d5e0', fontSize: '0.8rem' }}>
                                ~{game.hltbMain}h para completar
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* Reasons (Porquês) */}
                {game.reasons && game.reasons.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ color: '#c7d5e0', mb: 1, fontWeight: 600 }}>
                            Por que recomendamos:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {game.reasons.slice(0, 3).map((reason, index) => (
                                <Chip
                                    key={index}
                                    label={reason}
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                        borderColor: '#66c0f4',
                                        color: '#66c0f4',
                                        fontSize: '0.7rem',
                                    }}
                                />
                            ))}
                        </Box>
                    </Box>
                )}

                {/* Play Time (only for user's games) */}
                {showPlayTime && (
                    <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" sx={{ color: '#c7d5e0' }}>
                                Tempo jogado:
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#ffffff' }}>
                                {formatHours(game.hoursPlayed)}
                            </Typography>
                        </Box>
                        {game.lastPlayed && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" sx={{ color: '#c7d5e0' }}>
                                    Último jogo:
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#ffffff' }}>
                                    {new Date(game.lastPlayed).toLocaleDateString('pt-BR')}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                )}

                <Divider sx={{ my: 1, borderColor: '#66c0f4' }} />

                {/* Action Buttons - Simplified */}
                <Box sx={{ display: 'flex', gap: 1, mt: 'auto', alignItems: 'center' }}>
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ThumbUp />}
                        onClick={handleLike}
                        sx={{
                            flex: 1,
                            borderColor: '#a1d44a',
                            color: '#a1d44a',
                            fontSize: '0.75rem',
                            '&:hover': {
                                backgroundColor: 'rgba(161, 212, 74, 0.1)',
                                borderColor: '#a1d44a',
                            },
                        }}
                    >
                        GOSTEI
                    </Button>
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ThumbDown />}
                        onClick={handleDislike}
                        sx={{
                            flex: 1,
                            borderColor: '#ff6b6b',
                            color: '#ff6b6b',
                            fontSize: '0.75rem',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                                borderColor: '#ff6b6b',
                            },
                        }}
                    >
                        NÃO GOSTEI
                    </Button>
                    {onSnooze && (
                        <Tooltip title="Lembrar mais tarde">
                            <IconButton
                                size="small"
                                onClick={handleSnooze}
                                sx={{
                                    color: '#ffd700',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 215, 0, 0.1)',
                                    },
                                }}
                            >
                                <SnoozeRounded />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>

                {/* External Links */}
                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                    {/* Steam/Play Button */}
                    <Button
                        variant="text"
                        size="small"
                        onClick={handlePlay}
                        sx={{
                            flex: game.storeUrl ? 1 : 'auto',
                            width: game.storeUrl ? 'auto' : '100%',
                            color: '#66c0f4',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            '&:hover': {
                                backgroundColor: 'rgba(102, 192, 244, 0.1)',
                                color: '#8ed8ff',
                            },
                        }}
                    >
                        {game.store === 'Steam' || !game.store ? 'VER NO STEAM' : 'BUSCAR'}
                    </Button>

                    {/* External Store Link */}
                    {game.storeUrl && game.store && game.store !== 'Steam' && (
                        <Tooltip title={`Ver no ${game.store === 'IGDB' ? 'IGDB' : 'RAWG'}`}>
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<OpenInNew sx={{ fontSize: '14px !important' }} />}
                                onClick={() => window.open(game.storeUrl, '_blank')}
                                sx={{
                                    flex: 1,
                                    borderColor: game.store === 'IGDB' ? '#4caf50' : '#2196f3',
                                    color: game.store === 'IGDB' ? '#4caf50' : '#2196f3',
                                    fontSize: '0.75rem',
                                    '&:hover': {
                                        backgroundColor: game.store === 'IGDB' ? 'rgba(76,175,80,0.1)' : 'rgba(33,150,243,0.1)',
                                        borderColor: game.store === 'IGDB' ? '#4caf50' : '#2196f3',
                                    },
                                }}
                            >
                                {game.store}
                            </Button>
                        </Tooltip>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};