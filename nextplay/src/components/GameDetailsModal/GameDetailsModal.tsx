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
    Card,
    CardContent,
    IconButton,
    Stack,
    Paper,
} from '@mui/material';
import {
    Close,
    AccessTime,
    Search,
    Lightbulb,
} from '@mui/icons-material';
import type { Game } from '../../api/schemas';

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
    if (!game) return null;

    const estimatedHours = game.hltbMain || EstimatePlaytimeFromGenres(game.genres || []);

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

        let maxEstimate = 20;
        for (const genre of genres) {
            const estimate = genreEstimates[genre] || 20;
            if (estimate > maxEstimate) {
                maxEstimate = estimate;
            }
        }
        return maxEstimate;
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return '#48bb78';
        if (score >= 60) return '#ed8936';
        return '#e53e3e';
    };

    const handleSearchGame = () => {
        window.open(`https://www.google.com/search?q=${encodeURIComponent(game.name + ' game')}`, '_blank');
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    background: 'linear-gradient(135deg, #0f1419 0%, #1a1f2e 50%, #2d3748 100%)',
                    color: '#ffffff',
                    borderRadius: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
                    overflow: 'hidden',
                }
            }}
            BackdropProps={{
                sx: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
                                        startIcon={<Search />}
                                        onClick={handleSearchGame}
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
                                        Pesquisar Jogo
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

                                    </Stack>
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

                {/* Recommendation Reasons */}
                {game.reasons && game.reasons.length > 0 && (
                    <Box sx={{ px: 4, pb: 2 }}>
                        <Card sx={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '20px',
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
                        startIcon={<Search />}
                        onClick={handleSearchGame}
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
                        Pesquisar Jogo
                    </Button>
                </Stack>
            </DialogActions>
        </Dialog>
    );
};