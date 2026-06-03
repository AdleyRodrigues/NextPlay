import React from 'react';
import {
    Box,
    Typography,
    Chip,
    Stack,
    Tooltip,
    Slider,
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
import * as S from './LandingFilter.styles';

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
        <Paper elevation={0} sx={S.paperContainer}>
            <Stack spacing={5}>
                {/* 1. Platform */}
                <Box>
                    <Typography variant="h6" sx={S.sectionTitle}>
                        <VideogameAsset sx={{ color: '#667eea' }} /> Onde você joga?
                    </Typography>
                    <Box sx={S.chipsWrap}>
                        {platformOptions.map((option) => (
                            <Tooltip key={option.value} title={option.tooltip} arrow placement="top">
                                <Chip
                                    label={`${option.icon} ${option.label}`}
                                    onClick={() => onFilterChange('platformId', option.value)}
                                    sx={S.getPlatformChipStyle(filters.platformId === option.value)}
                                />
                            </Tooltip>
                        ))}
                    </Box>
                </Box>

                {/* 2. Skills */}
                <Box>
                    <Typography variant="h6" sx={S.sectionTitle}>
                        <Psychology sx={{ color: '#ff77c6' }} /> O que quer desenvolver?
                    </Typography>
                    <Box sx={S.chipsWrap}>
                        {skillOptions.map((option) => (
                            <Tooltip key={option.value} title={option.tooltip} arrow placement="top">
                                <Chip
                                    label={`${option.icon} ${option.label}`}
                                    onClick={() => onFilterChange('skill', option.value)}
                                    sx={S.getSkillChipStyle(filters.skill === option.value)}
                                />
                            </Tooltip>
                        ))}
                    </Box>

                    {/* Psychological Benefit Box */}
                    {filters.skill && (
                        <Box sx={S.benefitBox}>
                            <Typography sx={S.benefitIcon}>
                                {skillOptions.find(o => o.value === filters.skill)?.icon}
                            </Typography>
                            <Box>
                                <Typography variant="subtitle2" sx={S.benefitTitle}>
                                    Benefício Psicológico e Cognitivo
                                </Typography>
                                <Typography variant="body2" sx={S.benefitText}>
                                    {skillOptions.find(o => o.value === filters.skill)?.tooltip}
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </Box>

                <Divider sx={S.divider} />

                {/* 3. Vibes */}
                <Box>
                    <Typography variant="h6" sx={S.sectionTitle}>
                        <Mood sx={{ color: '#48bb78' }} /> Qual a sua Vibe de hoje?
                    </Typography>
                    <Box sx={S.chipsWrap}>
                        {vibeOptions.map((option) => (
                            <Tooltip key={option.value} title={option.tooltip} arrow placement="top">
                                <Chip
                                    label={`${option.icon} ${option.label}`}
                                    onClick={() => toggleArrayFilter('vibes', option.value)}
                                    sx={S.getVibeChipStyle(filters.vibes?.includes(option.value) ?? false)}
                                />
                            </Tooltip>
                        ))}
                    </Box>
                </Box>

                {/* 4. Release Year Slider */}
                <Box>
                    <Typography variant="h6" sx={S.yearSectionTitle}>
                        <DateRange sx={{ color: '#ed8936' }} /> Era do Jogo
                    </Typography>
                    <Box sx={S.sliderContainer}>
                        <Slider
                            value={[filters.minYear || 1990, filters.maxYear || currentYear]}
                            onChange={handleYearChange}
                            valueLabelDisplay="on"
                            min={1985}
                            max={currentYear}
                            sx={S.slider}
                        />
                    </Box>
                    <Stack direction="row" justifyContent="space-between" sx={S.yearLabelsContainer}>
                        <Typography variant="body2" sx={S.yearLabelText}>Retrô</Typography>
                        <Typography variant="body2" sx={S.yearLabelText}>Nova Geração</Typography>
                    </Stack>
                </Box>

                {/* 5. Multiplayer & Time */}
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
                    <Box sx={S.multiplayerSection}>
                        <Typography variant="h6" sx={S.sectionTitle}>
                            <People sx={{ color: '#4299e1' }} /> Experiência
                        </Typography>
                        <Box sx={S.chipsWrap}>
                            {[
                                { value: 'single', label: 'Só Single Player', icon: '👤' },
                                { value: 'multi', label: 'Só Multiplayer', icon: '🌐' },
                                { value: 'both', label: 'Ambos', icon: '👥' },
                            ].map((mode) => (
                                <Chip
                                    key={mode.value}
                                    label={`${mode.icon} ${mode.label}`}
                                    onClick={() => onFilterChange('multiplayerMode', mode.value)}
                                    sx={S.getTimeChipStyle((filters.multiplayerMode || 'both') === mode.value)}
                                />
                            ))}
                        </Box>
                    </Box>

                    <Box sx={S.durationSection}>
                        <Typography variant="h6" sx={S.sectionTitle}>
                            <AccessTime sx={{ color: '#9f7aea' }} /> Duração (Tempo para zerar)
                        </Typography>
                        <Box sx={S.chipsWrap}>
                            {['Curto', 'Médio', 'Longo'].map((timeStr) => (
                                <Chip
                                    key={timeStr}
                                    label={timeStr}
                                    onClick={() => toggleArrayFilter('time', timeStr.toLowerCase())}
                                    sx={S.getTimeChipStyle(filters.time?.includes(timeStr.toLowerCase()) ?? false)}
                                />
                            ))}
                        </Box>
                    </Box>
                </Stack>

            </Stack>
        </Paper>
    );
};