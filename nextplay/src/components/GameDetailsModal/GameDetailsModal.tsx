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
} from '@mui/material';
import {
    Close,
    AccessTime,
    Star,
    PlayArrow,
} from '@mui/icons-material';
import { formatHours } from '../../utils/format';
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
        if (progressPercentage >= 100) return { text: 'Completado!', color: '#4caf50' };
        if (progressPercentage >= 80) return { text: 'Quase terminado!', color: '#ff9800' };
        if (progressPercentage >= 50) return { text: 'Bem avançado', color: '#2196f3' };
        if (progressPercentage >= 20) return { text: 'Em progresso', color: '#9c27b0' };
        if (playtimeHours > 0) return { text: 'Recém começado', color: '#607d8b' };
        return { text: 'Não jogado', color: '#f44336' };
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
                color: '#ff9800'
            });
        }

        // Análise de qualidade
        if (game.metaScore && game.metaScore >= 85) {
            analysis.push({
                icon: '🏆',
                title: 'Obra-Prima',
                description: `Metacritic ${game.metaScore} - Este é um dos melhores jogos já feitos!`,
                color: '#4caf50'
            });
        }

        // Análise de tempo
        if (playtimeHours > 0 && playtimeHours < 5) {
            analysis.push({
                icon: '🚀',
                title: 'Potencial Inexplorado',
                description: 'Você mal começou a explorar este mundo incrível!',
                color: '#2196f3'
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
                    color: '#9c27b0'
                });
            }
        }

        return analysis;
    };

    const gameAnalysis = getGameAnalysis();

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: {
                    backgroundColor: '#1b2838',
                    color: '#ffffff',
                    borderRadius: '20px',
                    border: '1px solid rgba(102, 192, 244, 0.3)',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                    background: 'linear-gradient(135deg, #1b2838 0%, #2a475e 100%)',
                }
            }}
        >
            <DialogTitle sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid rgba(102, 192, 244, 0.2)',
                pb: 3,
                pt: 3,
                px: 4,
                background: 'linear-gradient(90deg, rgba(102, 192, 244, 0.1) 0%, transparent 100%)',
            }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#66c0f4', mb: 0.5 }}>
                        {game.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#c7d5e0', opacity: 0.8 }}>
                        Análise detalhada do jogo
                    </Typography>
                </Box>
                <IconButton
                    onClick={onClose}
                    sx={{
                        color: '#c7d5e0',
                        backgroundColor: 'rgba(102, 192, 244, 0.1)',
                        '&:hover': {
                            backgroundColor: 'rgba(102, 192, 244, 0.2)',
                            color: '#66c0f4',
                        },
                        transition: 'all 0.2s ease-in-out',
                    }}
                >
                    <Close />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                    {/* Imagem do Jogo */}
                    <Box sx={{ flex: { xs: '1', md: '0 0 33%' } }}>
                        <Box
                            component="img"
                            src={game.coverImage}
                            alt={game.name}
                            sx={{
                                width: '100%',
                                height: 200,
                                objectFit: 'contain',
                                backgroundColor: '#2a475e',
                                borderRadius: '8px',
                                border: '1px solid #66c0f4',
                            }}
                        />
                    </Box>

                    {/* Informações Básicas */}
                    <Box sx={{ flex: { xs: '1', md: '0 0 67%' } }}>
                        <Box sx={{ mb: 2 }}>
                            {/* Scores */}
                            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                                {game.metaScore && (
                                    <Chip
                                        label={`Meta: ${game.metaScore}`}
                                        sx={{
                                            bgcolor: game.metaScore >= 75 ? '#a1d44a' : '#ff6b6b',
                                            color: '#1b2838',
                                            fontWeight: 600,
                                        }}
                                    />
                                )}
                                {game.openCriticScore && (
                                    <Chip
                                        label={`OC: ${game.openCriticScore}`}
                                        sx={{
                                            bgcolor: game.openCriticScore >= 75 ? '#a1d44a' : '#ff6b6b',
                                            color: '#1b2838',
                                            fontWeight: 600,
                                        }}
                                    />
                                )}
                                {game.steamScore && (
                                    <Chip
                                        icon={<Star sx={{ fontSize: '16px !important' }} />}
                                        label={`${game.steamScore}%`}
                                        sx={{
                                            bgcolor: '#66c0f4',
                                            color: '#1b2838',
                                            fontWeight: 600,
                                        }}
                                    />
                                )}
                            </Box>

                            {/* Duração */}
                            {estimatedHours > 0 && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <AccessTime sx={{ color: '#c7d5e0' }} />
                                    <Typography variant="body2" sx={{ color: '#c7d5e0' }}>
                                        ~{estimatedHours}h para completar o jogo
                                        {!game.hltbMain && <span style={{ opacity: 0.7 }}> (estimativa baseada no gênero)</span>}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Box>

                {/* Progresso do Jogo */}
                <Box sx={{ mt: 3 }}>
                    <Card sx={{
                        backgroundColor: 'rgba(42, 71, 94, 0.6)',
                        border: '1px solid rgba(102, 192, 244, 0.3)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '16px',
                    }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ mb: 3, color: '#66c0f4', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                📊 Progresso do Jogo
                            </Typography>

                            <Box sx={{ mb: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography variant="body2" sx={{ color: '#c7d5e0' }}>
                                        Tempo jogado: {formatHours(game.hoursPlayed || 0)}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: progressStatus.color, fontWeight: 600 }}>
                                        {progressStatus.text}
                                    </Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={Math.min(progressPercentage, 100)}
                                    sx={{
                                        height: 10,
                                        borderRadius: 5,
                                        backgroundColor: 'rgba(102, 192, 244, 0.2)',
                                        '& .MuiLinearProgress-bar': {
                                            backgroundColor: progressStatus.color,
                                            borderRadius: 5,
                                        },
                                    }}
                                />
                                <Typography variant="caption" sx={{ color: '#c7d5e0', mt: 1, display: 'block' }}>
                                    {progressPercentage.toFixed(1)}% completo
                                    {estimatedHours > 0 && ` (estimativa: ~${estimatedHours}h para completar)`}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Box sx={{ flex: 1, textAlign: 'center', p: 2, backgroundColor: 'rgba(102, 192, 244, 0.1)', borderRadius: '12px' }}>
                                    <Typography variant="h4" sx={{ color: '#66c0f4', fontWeight: 700 }}>
                                        {playtimeHours.toFixed(1)}h
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#c7d5e0' }}>
                                        Tempo jogado
                                    </Typography>
                                </Box>
                                <Box sx={{ flex: 1, textAlign: 'center', p: 2, backgroundColor: 'rgba(255, 152, 0, 0.1)', borderRadius: '12px' }}>
                                    <Typography variant="h6" sx={{ color: '#ff9800', fontWeight: 700, fontSize: '1.2rem' }}>
                                        {getLastPlayedText()}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#c7d5e0' }}>
                                        Último jogo
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>

                {/* Conquistas */}
                <Box sx={{ mt: 3 }}>
                    <Card sx={{
                        backgroundColor: 'rgba(42, 71, 94, 0.6)',
                        border: '1px solid rgba(102, 192, 244, 0.3)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '16px',
                    }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ mb: 3, color: '#66c0f4', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                🏆 Conquistas
                            </Typography>

                            {totalAchievements > 0 ? (
                                <>
                                    <Box sx={{ mb: 3 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2" sx={{ color: '#c7d5e0' }}>
                                                {unlockedAchievements} de {totalAchievements} conquistas
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#4caf50', fontWeight: 600 }}>
                                                {Math.round((unlockedAchievements / totalAchievements) * 100)}% completo
                                            </Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={(unlockedAchievements / totalAchievements) * 100}
                                            sx={{
                                                height: 10,
                                                borderRadius: 5,
                                                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                                                '& .MuiLinearProgress-bar': {
                                                    backgroundColor: '#4caf50',
                                                    borderRadius: 5,
                                                },
                                            }}
                                        />
                                    </Box>

                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                        <Box sx={{ flex: 1, textAlign: 'center', p: 2, backgroundColor: 'rgba(76, 175, 80, 0.1)', borderRadius: '12px' }}>
                                            <Typography variant="h4" sx={{ color: '#4caf50', fontWeight: 700 }}>
                                                {unlockedAchievements}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#c7d5e0' }}>
                                                Desbloqueadas
                                            </Typography>
                                        </Box>
                                        <Box sx={{ flex: 1, textAlign: 'center', p: 2, backgroundColor: 'rgba(255, 152, 0, 0.1)', borderRadius: '12px' }}>
                                            <Typography variant="h4" sx={{ color: '#ff9800', fontWeight: 700 }}>
                                                {remainingAchievements}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#c7d5e0' }}>
                                                Restantes
                                            </Typography>
                                        </Box>
                                        <Box sx={{ flex: 1, textAlign: 'center', p: 2, backgroundColor: 'rgba(102, 192, 244, 0.1)', borderRadius: '12px' }}>
                                            <Typography variant="h4" sx={{ color: '#66c0f4', fontWeight: 700 }}>
                                                {totalAchievements}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#c7d5e0' }}>
                                                Total
                                            </Typography>
                                        </Box>
                                    </Box>
                                </>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <Typography variant="h6" sx={{ color: '#c7d5e0', mb: 1 }}>
                                        📊 Dados de conquistas não disponíveis
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#c7d5e0', opacity: 0.7 }}>
                                        Este jogo pode não ter conquistas ou os dados ainda não foram carregados
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Box>

                {/* Análise Gamer */}
                {gameAnalysis.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                        <Card sx={{ backgroundColor: '#2a475e', border: '1px solid #66c0f4' }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 2, color: '#66c0f4', fontWeight: 600 }}>
                                    🎮 Análise Gamer
                                </Typography>

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {gameAnalysis.map((analysis, index) => (
                                        <Box key={index} sx={{
                                            p: 2,
                                            backgroundColor: 'rgba(102, 192, 244, 0.1)',
                                            borderRadius: '8px',
                                            border: `1px solid ${analysis.color}`,
                                        }}>
                                            <Typography variant="h6" sx={{ color: analysis.color, mb: 1 }}>
                                                {analysis.icon} {analysis.title}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#c7d5e0' }}>
                                                {analysis.description}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>
                )}

                {/* Razões da Recomendação */}
                {game.reasons && game.reasons.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                        <Card sx={{ backgroundColor: '#2a475e', border: '1px solid #66c0f4' }}>
                            <CardContent>
                                <Typography variant="h6" sx={{ mb: 2, color: '#66c0f4', fontWeight: 600 }}>
                                    💡 Por que recomendamos
                                </Typography>

                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {game.reasons.map((reason, index) => (
                                        <Chip
                                            key={index}
                                            label={reason}
                                            variant="outlined"
                                            sx={{
                                                borderColor: '#66c0f4',
                                                color: '#66c0f4',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(102, 192, 244, 0.1)',
                                                },
                                            }}
                                        />
                                    ))}
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{
                p: 4,
                borderTop: '1px solid rgba(102, 192, 244, 0.2)',
                background: 'linear-gradient(90deg, transparent 0%, rgba(102, 192, 244, 0.05) 100%)',
                gap: 2,
            }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    sx={{
                        borderColor: 'rgba(199, 213, 224, 0.3)',
                        color: '#c7d5e0',
                        px: 4,
                        py: 1.5,
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': {
                            backgroundColor: 'rgba(199, 213, 224, 0.1)',
                            borderColor: '#c7d5e0',
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
                        backgroundColor: '#66c0f4',
                        color: '#1b2838',
                        fontWeight: 700,
                        px: 4,
                        py: 1.5,
                        borderRadius: '12px',
                        textTransform: 'none',
                        boxShadow: '0 4px 12px rgba(102, 192, 244, 0.3)',
                        '&:hover': {
                            backgroundColor: '#8ed8ff',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 16px rgba(102, 192, 244, 0.4)',
                        },
                        transition: 'all 0.2s ease-in-out',
                    }}
                >
                    Jogar no Steam
                </Button>
            </DialogActions>
        </Dialog >
    );
};
