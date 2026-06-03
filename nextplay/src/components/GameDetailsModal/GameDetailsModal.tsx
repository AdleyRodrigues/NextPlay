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
import * as S from './GameDetailsModal.styles';

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

    function EstimatePlaytimeFromGenres(genres: string[]): number {
        if (!genres || genres.length === 0) return 20;

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
            PaperProps={{ sx: S.dialogPaper }}
            BackdropProps={{ sx: S.dialogBackdrop }}
        >
            <DialogTitle sx={S.dialogTitle}>
                <Box sx={S.titleBox}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="h3" sx={S.titleText}>
                                {game.name}
                            </Typography>
                        </Box>
                        <IconButton onClick={onClose} sx={S.closeButton}>
                            <Close />
                        </IconButton>
                    </Stack>
                </Box>
            </DialogTitle>

            <DialogContent sx={S.dialogContent}>
                <Box sx={S.mainInfoBox}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
                        <Box sx={{ flex: { xs: '1', md: '0 0 40%' } }}>
                            <Paper sx={S.imagePaper}>
                                <Box
                                    component="img"
                                    src={game.coverImage}
                                    alt={game.name}
                                    sx={S.image}
                                />
                                <Box sx={S.imageOverlay}>
                                    <Button
                                        variant="contained"
                                        startIcon={<Search />}
                                        onClick={handleSearchGame}
                                        sx={S.searchButton}
                                    >
                                        Pesquisar Jogo
                                    </Button>
                                </Box>
                            </Paper>
                        </Box>

                        <Box sx={{ flex: 1 }}>
                            <Stack spacing={3}>
                                <Box>
                                    <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                                        {game.metaScore && (
                                            <Chip
                                                label={`Meta: ${game.metaScore}`}
                                                sx={S.getScoreChip(getScoreColor(game.metaScore))}
                                            />
                                        )}
                                        {game.openCriticScore && (
                                            <Chip
                                                label={`OC: ${game.openCriticScore}`}
                                                sx={S.getScoreChip(getScoreColor(game.openCriticScore))}
                                            />
                                        )}
                                    </Stack>
                                </Box>

                                {estimatedHours > 0 && (
                                    <Box>
                                        <Typography variant="h6" sx={S.sectionTitle}>
                                            Duração
                                        </Typography>
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <AccessTime sx={S.accessTimeIcon} />
                                            <Box>
                                                <Typography variant="body1" sx={S.durationText}>
                                                    ~{estimatedHours}h para completar
                                                </Typography>
                                                {!game.hltbMain && (
                                                    <Typography variant="body2" sx={S.durationSubtitle}>
                                                        (estimativa baseada no gênero)
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Stack>
                                    </Box>
                                )}

                                {game.genres && game.genres.length > 0 && (
                                    <Box>
                                        <Typography variant="h6" sx={S.sectionTitle}>
                                            Gêneros
                                        </Typography>
                                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                            {game.genres.map((genre, index) => (
                                                <Chip
                                                    key={index}
                                                    label={genre}
                                                    size="small"
                                                    sx={S.genreChip}
                                                />
                                            ))}
                                        </Stack>
                                    </Box>
                                )}
                            </Stack>
                        </Box>
                    </Stack>
                </Box>

                {game.reasons && game.reasons.length > 0 && (
                    <Box sx={S.reasonsSection}>
                        <Card sx={S.reasonsCard}>
                            <CardContent sx={S.reasonsCardContent}>
                                <Stack spacing={3}>
                                    <Typography variant="h5" sx={S.reasonsTitle}>
                                        <Lightbulb sx={S.reasonsLightbulb} />
                                        Por que recomendamos
                                    </Typography>

                                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                        {game.reasons.map((reason, index) => (
                                            <Chip
                                                key={index}
                                                label={reason}
                                                sx={S.reasonItemChip}
                                            />
                                        ))}
                                    </Stack>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={S.dialogActions}>
                <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
                    <Button
                        onClick={onClose}
                        variant="outlined"
                        sx={S.closeFooterButton}
                    >
                        Fechar
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Search />}
                        onClick={handleSearchGame}
                        sx={S.searchFooterButton}
                    >
                        Pesquisar Jogo
                    </Button>
                </Stack>
            </DialogActions>
        </Dialog>
    );
};