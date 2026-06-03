import React from 'react';
import {
    Box,
    Typography,
    Chip,
    Stack,
    Tooltip,
    Slider,
    Switch,
    FormControlLabel,
    Paper,
    Divider,
} from '@mui/material';
import {
    VideogameAsset,
    Psychology,
    AccessTime,
    DateRange,
    People,
    Mood,
} from '@mui/icons-material';
import type { LandingFilters } from '../../hooks/useLandingState';

interface LandingFilterProps {
    filters: LandingFilters;
    onFilterChange: <K extends keyof LandingFilters>(key: K, value: LandingFilters[K]) => void;
}

const platformOptions = [
    { value: 4, label: 'PC', icon: '💻', tooltip: 'Jogos disponíveis para Windows ou Steam.' },
    { value: 187, label: 'PlayStation 5', icon: '🎮', tooltip: 'Jogos otimizados para a nova geração do PS5.' },
    { value: 186, label: 'Xbox Series X/S', icon: '🟢', tooltip: 'Jogos do ecossistema Xbox e Game Pass.' },
    { value: 7, label: 'Nintendo Switch', icon: '🔴', tooltip: 'Títulos para jogar em casa ou em qualquer lugar.' },
];

const skillOptions = [
    { value: 'logica', label: 'Lógica', icon: '🧠', tooltip: 'Desenvolve raciocínio, resolução de quebra-cabeças e pensamento lateral.' },
    { value: 'reflexos', label: 'Reflexos', icon: '⚡', tooltip: 'Melhora o tempo de resposta, coordenação motora e tomada de decisão sob pressão.' },
    { value: 'resiliencia', label: 'Resiliência', icon: '🛡️', tooltip: 'Treina o controle emocional, tolerância à frustração e persistência diante de desafios.' },
    { value: 'estrategia', label: 'Estratégia', icon: '♟️', tooltip: 'Aprimora o planejamento a longo prazo, gerenciamento de recursos e táticas.' },
    { value: 'cooperacao', label: 'Cooperação', icon: '🤝', tooltip: 'Foca em trabalho em equipe, comunicação eficiente e empatia.' },
    { value: 'criatividade', label: 'Criatividade', icon: '🎨', tooltip: 'Estimula a imaginação livre, autoexpressão e resolução criativa de problemas.' },
    { value: 'decisao', label: 'Decisão', icon: '⚖️', tooltip: 'Exercita o pensamento crítico e a ponderação de dilemas e consequências morais.' },
    { value: 'memoria', label: 'Memória', icon: '🧩', tooltip: 'Fortalece a atenção aos detalhes, retenção espacial e reconhecimento de padrões.' },
    { value: 'foco', label: 'Foco', icon: '🧘‍♂️', tooltip: 'Promove relaxamento ativo, atenção plena (mindfulness) e estado de flow.' },
    { value: 'lideranca', label: 'Liderança', icon: '🗣️', tooltip: 'Desenvolve coordenação de equipes, comunicação tática e tomada de decisão em grupo.' },
    { value: 'gestao', label: 'Gestão de Crise', icon: '📊', tooltip: 'Aprimora a administração de recursos sob pressão e sobrevivência em cenários adversos.' },
    { value: 'coordenacao', label: 'Coord. Motora Fina', icon: '🎯', tooltip: 'Exige movimentos precisos, sincronia perfeita e execução milimétrica.' },
];

const vibeOptions = [
    { value: 'relax', label: 'Relaxante', icon: '🌿', tooltip: 'Jogos casuais, sem pressão de tempo ou punições severas, ideais para desestressar.' },
    { value: 'historia', label: 'História', icon: '📖', tooltip: 'Foco pesado em narrativa, diálogos profundos e desenvolvimento de personagens.' },
    { value: 'raiva', label: 'Frenético', icon: '💥', tooltip: 'Ação rápida, muitos inimigos e adrenalina alta constantes na tela.' },
    { value: 'intelecto', label: 'Quebra-Cabeça', icon: '🧩', tooltip: 'Desafios lógicos e mentais que exigem observação e raciocínio.' },
    { value: 'competitivo', label: 'Competitivo', icon: '🏆', tooltip: 'Jogos para enfrentar outras pessoas reais, medindo habilidades.' },
    { value: 'explorar', label: 'Exploração', icon: '🗺️', tooltip: 'Mundos vastos e abertos focados em descoberta e sobrevivência.' },
    { value: 'nostalgia', label: 'Retrô', icon: '👾', tooltip: 'Visual pixelado, inspiração em fliperamas e mecânicas clássicas dos anos 80/90.' },
    { value: 'dificil', label: 'Desafiador', icon: '💀', tooltip: 'Jogos implacáveis (tipo Dark Souls) onde cada erro custa caro.' },
];

export const LandingFilter: React.FC<LandingFilterProps> = ({
    filters,
    onFilterChange,
}) => {
    const toggleArrayFilter = (key: keyof LandingFilters, value: string) => {
        const currentArray = (filters[key] as string[]) || [];
        const newArray = currentArray.includes(value)
            ? currentArray.filter(item => item !== value)
            : [...currentArray, value];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onFilterChange(key, newArray as any);
    };

    const handleYearChange = (_event: Event, newValue: number | number[]) => {
        const [min, max] = newValue as number[];
        onFilterChange('minYear', min);
        onFilterChange('maxYear', max);
    };

    const currentYear = new Date().getFullYear();

    return (
        <Paper
            elevation={0}
            sx={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '24px',
                p: 4,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
        >
            <Stack spacing={5}>
                {/* 1. Platform */}
                <Box>
                    <Typography variant="h6" sx={{ color: '#ffffff', mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <VideogameAsset sx={{ color: '#667eea' }} /> Onde você joga?
                    </Typography>
                    <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                        {platformOptions.map((option) => (
                            <Tooltip key={option.value} title={option.tooltip} arrow placement="top">
                                <Chip
                                    label={`${option.icon} ${option.label}`}
                                    onClick={() => onFilterChange('platformId', option.value)}
                                    sx={{
                                        px: 1,
                                        py: 2.5,
                                        borderRadius: '12px',
                                        fontSize: '0.95rem',
                                        fontWeight: 600,
                                        backgroundColor: filters.platformId === option.value
                                            ? 'rgba(102, 126, 234, 0.2)'
                                            : 'rgba(255, 255, 255, 0.05)',
                                        color: filters.platformId === option.value
                                            ? '#667eea'
                                            : '#a0aec0',
                                        border: `1px solid ${filters.platformId === option.value
                                            ? 'rgba(102, 126, 234, 0.5)'
                                            : 'transparent'}`,
                                        '&:hover': {
                                            backgroundColor: filters.platformId === option.value
                                                ? 'rgba(102, 126, 234, 0.3)'
                                                : 'rgba(255, 255, 255, 0.1)',
                                        },
                                        transition: 'background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1), color 0.2s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    }}
                                />
                            </Tooltip>
                        ))}
                    </Stack>
                </Box>

                {/* 2. Skills */}
                <Box>
                    <Typography variant="h6" sx={{ color: '#ffffff', mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Psychology sx={{ color: '#ff77c6' }} /> O que quer desenvolver?
                    </Typography>
                    <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                        {skillOptions.map((option) => (
                            <Tooltip key={option.value} title={option.tooltip} arrow placement="top">
                                <Chip
                                    label={`${option.icon} ${option.label}`}
                                    onClick={() => onFilterChange('skill', option.value)}
                                    sx={{
                                        px: 1,
                                        py: 2.5,
                                        borderRadius: '12px',
                                        fontSize: '0.95rem',
                                        fontWeight: 600,
                                        backgroundColor: filters.skill === option.value
                                            ? 'rgba(255, 119, 198, 0.2)'
                                            : 'rgba(255, 255, 255, 0.05)',
                                        color: filters.skill === option.value
                                            ? '#ff77c6'
                                            : '#a0aec0',
                                        border: `1px solid ${filters.skill === option.value
                                            ? 'rgba(255, 119, 198, 0.5)'
                                            : 'transparent'}`,
                                        '&:hover': {
                                            backgroundColor: filters.skill === option.value
                                                ? 'rgba(255, 119, 198, 0.3)'
                                                : 'rgba(255, 255, 255, 0.1)',
                                        },
                                        transition: 'background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1), color 0.2s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    }}
                                />
                            </Tooltip>
                        ))}
                    </Stack>

                    {/* Psychological Benefit Box */}
                    {filters.skill && (
                        <Box sx={{
                            mt: 3,
                            p: 2,
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, rgba(255, 119, 198, 0.1) 0%, rgba(102, 126, 234, 0.05) 100%)',
                            border: '1px solid rgba(255, 119, 198, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            animation: 'fadeIn 0.5s ease',
                            '@keyframes fadeIn': {
                                from: { opacity: 0, transform: 'translateY(-10px)' },
                                to: { opacity: 1, transform: 'translateY(0)' }
                            }
                        }}>
                            <Typography sx={{ fontSize: '2.5rem', lineHeight: 1 }}>
                                {skillOptions.find(o => o.value === filters.skill)?.icon}
                            </Typography>
                            <Box>
                                <Typography variant="subtitle2" sx={{ color: '#ff77c6', fontWeight: 800, mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem' }}>
                                    Benefício Psicológico e Cognitivo
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#e2e8f0', lineHeight: 1.5, fontSize: '0.9rem' }}>
                                    {skillOptions.find(o => o.value === filters.skill)?.tooltip}
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </Box>

                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                {/* 3. Vibes (New) */}
                <Box>
                    <Typography variant="h6" sx={{ color: '#ffffff', mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Mood sx={{ color: '#48bb78' }} /> Qual a sua Vibe de hoje?
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {vibeOptions.map((option) => (
                            <Tooltip key={option.value} title={option.tooltip} arrow placement="top">
                                <Chip
                                    label={`${option.icon} ${option.label}`}
                                    onClick={() => toggleArrayFilter('vibes', option.value)}
                                    sx={{
                                        px: 0.5,
                                        py: 2,
                                        borderRadius: '10px',
                                        fontSize: '0.85rem',
                                        fontWeight: 500,
                                        backgroundColor: filters.vibes?.includes(option.value)
                                            ? 'rgba(72, 187, 120, 0.2)'
                                            : 'rgba(255, 255, 255, 0.05)',
                                        color: filters.vibes?.includes(option.value)
                                            ? '#48bb78'
                                            : '#a0aec0',
                                        border: `1px solid ${filters.vibes?.includes(option.value)
                                            ? 'rgba(72, 187, 120, 0.5)'
                                            : 'transparent'}`,
                                        '&:hover': {
                                            backgroundColor: filters.vibes?.includes(option.value)
                                                ? 'rgba(72, 187, 120, 0.3)'
                                                : 'rgba(255, 255, 255, 0.1)',
                                        },
                                        transition: 'background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease',
                                    }}
                                />
                            </Tooltip>
                        ))}
                    </Stack>
                </Box>

                {/* 4. Release Year Slider (New) */}
                <Box>
                    <Typography variant="h6" sx={{ color: '#ffffff', mb: 4, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DateRange sx={{ color: '#ed8936' }} /> Era do Jogo
                    </Typography>
                    <Box sx={{ px: 2 }}>
                        <Slider
                            value={[filters.minYear || 1990, filters.maxYear || currentYear]}
                            onChange={handleYearChange}
                            valueLabelDisplay="on"
                            min={1985}
                            max={currentYear}
                            sx={{
                                color: '#ed8936',
                                '& .MuiSlider-thumb': {
                                    backgroundColor: '#ffffff',
                                    border: '2px solid currentColor',
                                    boxShadow: '0 0 10px rgba(237, 137, 54, 0.5)',
                                },
                                '& .MuiSlider-valueLabel': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                    borderRadius: '8px',
                                }
                            }}
                        />
                    </Box>
                    <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                        <Typography variant="body2" sx={{ color: '#a0aec0' }}>Retrô</Typography>
                        <Typography variant="body2" sx={{ color: '#a0aec0' }}>Nova Geração</Typography>
                    </Stack>
                </Box>

                {/* 5. Multiplayer & Time */}
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ color: '#ffffff', mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <People sx={{ color: '#4299e1' }} /> Experiência
                        </Typography>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={filters.isMultiplayer || false}
                                    onChange={(e) => onFilterChange('isMultiplayer', e.target.checked ? true : undefined)}
                                    color="primary"
                                />
                            }
                            label={
                                <Typography sx={{ color: filters.isMultiplayer ? '#ffffff' : '#a0aec0', fontWeight: 500 }}>
                                    {filters.isMultiplayer ? "🌐 Focado em Multiplayer" : "👤 Mostrar todos (Single/Multi)"}
                                </Typography>
                            }
                        />
                    </Box>

                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ color: '#ffffff', mb: 2, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AccessTime sx={{ color: '#9f7aea' }} /> Duração (Tempo para zerar)
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {['Curto', 'Médio', 'Longo'].map((timeStr) => (
                                <Chip
                                    key={timeStr}
                                    label={timeStr}
                                    onClick={() => toggleArrayFilter('time', timeStr.toLowerCase())}
                                    sx={{
                                        backgroundColor: filters.time?.includes(timeStr.toLowerCase())
                                            ? 'rgba(159, 122, 234, 0.2)'
                                            : 'rgba(255, 255, 255, 0.05)',
                                        color: filters.time?.includes(timeStr.toLowerCase())
                                            ? '#9f7aea'
                                            : '#a0aec0',
                                        border: `1px solid ${filters.time?.includes(timeStr.toLowerCase())
                                            ? 'rgba(159, 122, 234, 0.5)'
                                            : 'transparent'}`,
                                    }}
                                />
                            ))}
                        </Stack>
                    </Box>
                </Stack>

            </Stack>
        </Paper>
    );
};