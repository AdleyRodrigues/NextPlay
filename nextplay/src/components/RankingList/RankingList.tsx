import React from 'react';
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Box,
    Chip,
    LinearProgress,
    Grid,
    Paper,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import {
    PlayArrow,
    TrendingUp,
    EmojiEvents,
    Star,
    AccessTime,
    CheckCircle,
} from '@mui/icons-material';
import { type RankingItem, formatPlaytime, formatLastPlayed, getModeIcon } from '../../api/ranking';

interface RankingListProps {
    items: RankingItem[];
    mode: string;
    loading?: boolean;
}

export const RankingList: React.FC<RankingListProps> = ({ items, mode, loading = false }) => {
    if (loading) {
        return (
            <Box sx={{ width: '100%', mt: 2 }}>
                <LinearProgress />
                <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                    Analisando sua biblioteca Steam...
                </Typography>
            </Box>
        );
    }

    if (!items || items.length === 0) {
        return (
            <Paper sx={{ p: 3, textAlign: 'center', mt: 2 }}>
                <Typography variant="h6" color="text.secondary">
                    Nenhum jogo encontrado na sua biblioteca Steam
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Verifique se sua biblioteca Steam está configurada corretamente
                </Typography>
            </Paper>
        );
    }

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getModeIcon(mode)} Top {items.length} - Modo {mode}
            </Typography>

            <Grid container spacing={2}>
                {items.map((item, index) => (
                    <Grid size={12} key={item.appId}>
                        <RankingCard item={item} rank={index + 1} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

interface RankingCardProps {
    item: RankingItem;
    rank: number;
}

const RankingCard: React.FC<RankingCardProps> = ({ item, rank }) => {
    const getRankColor = (rank: number) => {
        switch (rank) {
            case 1: return '#FFD700'; // Ouro
            case 2: return '#C0C0C0'; // Prata
            case 3: return '#CD7F32'; // Bronze
            default: return '#757575'; // Cinza
        }
    };

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1: return '🥇';
            case 2: return '🥈';
            case 3: return '🥉';
            default: return `#${rank}`;
        }
    };

    return (
        <Card sx={{
            display: 'flex',
            mb: 2,
            border: rank <= 3 ? `2px solid ${getRankColor(rank)}` : '1px solid #e0e0e0',
            '&:hover': {
                boxShadow: 4,
                transform: 'translateY(-2px)',
                transition: 'all 0.2s ease-in-out',
            }
        }}>
            {/* Imagem do jogo */}
            <CardMedia
                component="img"
                sx={{
                    width: 200,
                    height: 150,
                    objectFit: 'cover',
                }}
                image={item.headerImage || `https://cdn.akamai.steamstatic.com/steam/apps/${item.appId}/header.jpg`}
                alt={item.name}
            />

            <CardContent sx={{ flex: 1, p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                        {item.name}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                            label={getRankIcon(rank)}
                            size="small"
                            sx={{
                                backgroundColor: getRankColor(rank),
                                color: 'white',
                                fontWeight: 'bold',
                                minWidth: 40,
                            }}
                        />
                        <Chip
                            label={`${(item.finalScore * 100).toFixed(0)}%`}
                            size="small"
                            color="primary"
                            variant="outlined"
                        />
                    </Box>
                </Box>

                <Grid container spacing={2} sx={{ mb: 2 }}>
                    {/* Qualidade */}
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                                Qualidade
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                <Star fontSize="small" color="warning" />
                                <Typography variant="body2" fontWeight="bold">
                                    {(item.quality.combined * 100).toFixed(0)}%
                                </Typography>
                            </Box>
                            {item.quality.metacritic && (
                                <Typography variant="caption" color="text.secondary">
                                    MC: {item.quality.metacritic}
                                </Typography>
                            )}
                        </Box>
                    </Grid>

                    {/* Tempo de jogo */}
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                                Tempo
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                <AccessTime fontSize="small" color="action" />
                                <Typography variant="body2">
                                    {formatPlaytime(item.usage.playtimeMinutes)}
                                </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                                {formatLastPlayed(item.usage.lastPlayed)}
                            </Typography>
                        </Box>
                    </Grid>

                    {/* Progresso */}
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                                Progresso
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                <CheckCircle fontSize="small" color="success" />
                                <Typography variant="body2">
                                    {item.usage.achievementPercentage.toFixed(0)}%
                                </Typography>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={item.usage.achievementPercentage}
                                sx={{ mt: 0.5, height: 4, borderRadius: 2 }}
                            />
                        </Box>
                    </Grid>

                    {/* Sinais de uso */}
                    <Grid size={{ xs: 6, sm: 3 }}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                                Sinais
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                    <PlayArrow fontSize="small" color="primary" />
                                    <Typography variant="caption">
                                        N: {(item.usage.novelty * 100).toFixed(0)}%
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                    <TrendingUp fontSize="small" color="secondary" />
                                    <Typography variant="caption">
                                        R: {(item.usage.recency * 100).toFixed(0)}%
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 1 }} />

                {/* Razões "Why" */}
                <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <EmojiEvents fontSize="small" color="primary" />
                    Por que este jogo?
                </Typography>

                <List dense sx={{ py: 0 }}>
                    {item.why.map((reason, index) => (
                        <ListItem key={index} sx={{ py: 0.25, px: 0 }}>
                            <ListItemIcon sx={{ minWidth: 20 }}>
                                <Typography variant="body2" color="primary">•</Typography>
                            </ListItemIcon>
                            <ListItemText
                                primary={
                                    <Typography variant="body2" color="text.secondary">
                                        {reason}
                                    </Typography>
                                }
                            />
                        </ListItem>
                    ))}
                </List>
            </CardContent>
        </Card>
    );
};
