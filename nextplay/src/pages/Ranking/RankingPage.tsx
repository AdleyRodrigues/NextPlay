import React, { useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Card,
    CardContent,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Alert,
    Grid,
    Paper,
    Chip,
    Divider,
} from '@mui/material';
import {
    PlayArrow,
    EmojiEvents,
    Star,
    Refresh,
} from '@mui/icons-material';
import { RankingList } from '../../components/RankingList/RankingList';
import { useRanking, getModeDescription, getModeIcon } from '../../api/ranking';

type RankingMode = 'jogar' | 'terminar' | 'zerar' | 'platinar';

export const RankingPage: React.FC = () => {
    const [steamId64, setSteamId64] = useState('76561198000000000'); // Mock Steam ID
    const [mode, setMode] = useState<RankingMode>('jogar');
    const [limit, setLimit] = useState(5);

    const { loading, error, ranking, getTopGames } = useRanking();

    const handleGetRanking = async () => {
        if (!steamId64.trim()) {
            return;
        }

        await getTopGames({
            steamId64: steamId64.trim(),
            mode,
            limit,
        });
    };

    const modeOptions = [
        { value: 'jogar', label: 'Jogar', description: 'Começar algo novo', icon: '🎮' },
        { value: 'terminar', label: 'Terminar', description: 'Continuar jogos em andamento', icon: '▶️' },
        { value: 'zerar', label: 'Zerar', description: 'Finalizar campanhas', icon: '🏁' },
        { value: 'platinar', label: 'Platinar', description: '100% conquistas', icon: '🏆' },
    ] as const;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h3" component="h1" gutterBottom align="center">
                🎯 Algoritmo de Ranqueamento NextPlay
            </Typography>

            <Typography variant="h6" color="text.secondary" align="center" sx={{ mb: 4 }}>
                Top 5 jogos da sua biblioteca Steam baseado no modo selecionado
            </Typography>

            {/* Controles */}
            <Card sx={{ mb: 4 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Configurações do Ranqueamento
                    </Typography>

                    <Grid container spacing={3} alignItems="center">
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <FormControl fullWidth>
                                <InputLabel>Steam ID64</InputLabel>
                                <Select
                                    value={steamId64}
                                    onChange={(e) => setSteamId64(e.target.value)}
                                    label="Steam ID64"
                                >
                                    <MenuItem value="76561198000000000">
                                        Usuário Demo (Mock)
                                    </MenuItem>
                                    <MenuItem value="76561198000000001">
                                        Usuário Teste 1
                                    </MenuItem>
                                    <MenuItem value="76561198000000002">
                                        Usuário Teste 2
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <FormControl fullWidth>
                                <InputLabel>Modo</InputLabel>
                                <Select
                                    value={mode}
                                    onChange={(e) => setMode(e.target.value as RankingMode)}
                                    label="Modo"
                                >
                                    {modeOptions.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <span>{option.icon}</span>
                                                <Box>
                                                    <Typography variant="body2" fontWeight="bold">
                                                        {option.label}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {option.description}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                            <FormControl fullWidth>
                                <InputLabel>Limite</InputLabel>
                                <Select
                                    value={limit}
                                    onChange={(e) => setLimit(Number(e.target.value))}
                                    label="Limite"
                                >
                                    <MenuItem value={3}>Top 3</MenuItem>
                                    <MenuItem value={5}>Top 5</MenuItem>
                                    <MenuItem value={10}>Top 10</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={handleGetRanking}
                                disabled={loading || !steamId64.trim()}
                                startIcon={loading ? <Refresh className="animate-spin" /> : <PlayArrow />}
                                fullWidth
                                sx={{ height: 56 }}
                            >
                                {loading ? 'Analisando...' : 'Gerar Ranking'}
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Explicação do algoritmo */}
            <Paper sx={{ p: 3, mb: 4, backgroundColor: '#f8f9fa' }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Star color="primary" />
                    Como funciona o algoritmo
                </Typography>

                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            📊 Fontes de Qualidade
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                            <Chip label="Steam Wilson Score" size="small" color="primary" variant="outlined" />
                            <Chip label="Metacritic" size="small" color="secondary" variant="outlined" />
                            <Chip label="OpenCritic" size="small" color="success" variant="outlined" />
                        </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            🎮 Sinais de Uso
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                            <Chip label="Novelty" size="small" color="info" variant="outlined" />
                            <Chip label="Recency" size="small" color="warning" variant="outlined" />
                            <Chip label="Progress" size="small" color="success" variant="outlined" />
                        </Box>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Typography variant="body2" color="text.secondary">
                    <strong>Modo {getModeIcon(mode)} {getModeDescription(mode)}:</strong> O algoritmo combina qualidade externa (55-50%),
                    sinais de progresso específicos do modo (30-40%), e recência (10-15%) para selecionar os jogos
                    que maximizam sua satisfação hoje.
                </Typography>
            </Paper>

            {/* Erro */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Resultados */}
            {ranking && (
                <Box>
                    <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmojiEvents color="primary" />
                        Resultados do Ranqueamento
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Analisados {ranking.totalGamesAnalyzed} jogos da biblioteca Steam
                    </Typography>

                    <RankingList
                        items={ranking.items}
                        mode={ranking.mode}
                        loading={loading}
                    />
                </Box>
            )}

            {/* Instruções */}
            {!ranking && !loading && (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6" gutterBottom>
                        🚀 Pronto para começar?
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Selecione um modo e clique em "Gerar Ranking" para ver o Top 5 jogos
                        da sua biblioteca Steam baseado no algoritmo de ranqueamento do NextPlay.
                    </Typography>
                </Paper>
            )}
        </Container>
    );
};