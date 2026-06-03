import React from 'react';
import {
    Box,
    Typography,
    Chip,
    Stack,
    Tooltip,
} from '@mui/material';
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
    { value: 'paciencia', label: 'Paciência', icon: '🧘', tooltip: 'Treina resiliência, tolerância à frustração e persistência diante de desafios.' },
    { value: 'estrategia', label: 'Estratégia', icon: '♟️', tooltip: 'Aprimora o planejamento a longo prazo, gerenciamento de recursos e táticas.' },
    { value: 'cooperacao', label: 'Cooperação', icon: '🤝', tooltip: 'Foca em trabalho em equipe, comunicação eficiente e empatia.' },
];

const timeOptions = [
    { value: 'curto', label: 'Curto (< 1h/dia)', icon: '⏱️', tooltip: 'Jogos diretos ao ponto, ideais para sessões rápidas e curtas.' },
    { value: 'medio', label: 'Médio (1-2h/dia)', icon: '⏰', tooltip: 'Jogos com um bom ritmo, que você consegue progredir jogando um pouco por dia.' },
    { value: 'longo', label: 'Longo (3h+/dia)', icon: '🕐', tooltip: 'Mundos massivos e complexos (RPGs) perfeitos para quem tem horas para maratonar.' },
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
        onFilterChange(key, newArray as any);
    };

    return (
        <Stack spacing={4}>
            {/* Platform Section */}
            <Box>
                <Typography variant="h6" sx={{ color: '#ffffff', mb: 2, fontWeight: 600 }}>
                    1. Onde você joga?
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {platformOptions.map((option) => (
                        <Tooltip key={option.value} title={option.tooltip} arrow placement="top" disableInteractive>
                            <Chip
                                label={`${option.icon} ${option.label}`}
                                onClick={() => onFilterChange('platformId', option.value)}
                                color={filters.platformId === option.value ? 'primary' : 'default'}
                                variant={filters.platformId === option.value ? 'filled' : 'outlined'}
                                sx={{
                                    backgroundColor: filters.platformId === option.value
                                        ? 'rgba(102, 126, 234, 0.2)'
                                        : 'rgba(255, 255, 255, 0.1)',
                                    color: filters.platformId === option.value
                                        ? '#667eea'
                                        : '#a0aec0',
                                    border: `1px solid ${filters.platformId === option.value
                                        ? 'rgba(102, 126, 234, 0.3)'
                                        : 'rgba(255, 255, 255, 0.2)'}`,
                                    '&:hover': {
                                        backgroundColor: filters.platformId === option.value
                                            ? 'rgba(102, 126, 234, 0.3)'
                                            : 'rgba(255, 255, 255, 0.15)',
                                    },
                                    transition: 'all 0.2s ease-in-out',
                                }}
                            />
                        </Tooltip>
                    ))}
                </Stack>
            </Box>

            {/* Skill Section */}
            <Box>
                <Typography variant="h6" sx={{ color: '#ffffff', mb: 2, fontWeight: 600 }}>
                    2. O que você quer desenvolver?
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {skillOptions.map((option) => (
                        <Tooltip key={option.value} title={option.tooltip} arrow placement="top" disableInteractive>
                            <Chip
                                label={`${option.icon} ${option.label}`}
                                onClick={() => onFilterChange('skill', option.value)}
                                color={filters.skill === option.value ? 'secondary' : 'default'}
                                variant={filters.skill === option.value ? 'filled' : 'outlined'}
                                sx={{
                                    backgroundColor: filters.skill === option.value
                                        ? 'rgba(255, 119, 198, 0.2)'
                                        : 'rgba(255, 255, 255, 0.1)',
                                    color: filters.skill === option.value
                                        ? '#ff77c6'
                                        : '#a0aec0',
                                    border: `1px solid ${filters.skill === option.value
                                        ? 'rgba(255, 119, 198, 0.3)'
                                        : 'rgba(255, 255, 255, 0.2)'}`,
                                    '&:hover': {
                                        backgroundColor: filters.skill === option.value
                                            ? 'rgba(255, 119, 198, 0.3)'
                                            : 'rgba(255, 255, 255, 0.15)',
                                    },
                                    transition: 'all 0.2s ease-in-out',
                                }}
                            />
                        </Tooltip>
                    ))}
                </Stack>
            </Box>

            {/* Time Section */}
            <Box>
                <Typography variant="h6" sx={{ color: '#ffffff', mb: 2, fontWeight: 600 }}>
                    3. Quanto tempo você tem para jogar diariamente? (Opcional)
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {timeOptions.map((option) => (
                        <Tooltip key={option.value} title={option.tooltip} arrow placement="top" disableInteractive>
                            <Chip
                                label={`${option.icon} ${option.label}`}
                                onClick={() => toggleArrayFilter('time', option.value)}
                                color={filters.time?.includes(option.value) ? 'primary' : 'default'}
                                variant={filters.time?.includes(option.value) ? 'filled' : 'outlined'}
                                sx={{
                                    backgroundColor: filters.time?.includes(option.value)
                                        ? 'rgba(118, 75, 162, 0.2)'
                                        : 'rgba(255, 255, 255, 0.1)',
                                    color: filters.time?.includes(option.value)
                                        ? '#764ba2'
                                        : '#a0aec0',
                                    border: `1px solid ${filters.time?.includes(option.value)
                                        ? 'rgba(118, 75, 162, 0.3)'
                                        : 'rgba(255, 255, 255, 0.2)'}`,
                                    '&:hover': {
                                        backgroundColor: filters.time?.includes(option.value)
                                            ? 'rgba(118, 75, 162, 0.3)'
                                            : 'rgba(255, 255, 255, 0.15)',
                                    },
                                    transition: 'all 0.2s ease-in-out',
                                }}
                            />
                        </Tooltip>
                    ))}
                </Stack>
            </Box>
        </Stack>
    );
};