import React from 'react';
import {
    Box,
    Typography,
    Chip,
    Stack,
} from '@mui/material';
import type { LandingFilters } from '../../hooks/useLandingState';

interface LandingFilterProps {
    filters: LandingFilters;
    onFilterChange: <K extends keyof LandingFilters>(key: K, value: LandingFilters[K]) => void;
}

const vibeOptions = [
    { value: 'relaxar', label: 'Relaxar', icon: '😌' },
    { value: 'historia', label: 'História', icon: '📚' },
    { value: 'acao', label: 'Ação', icon: '⚔️' },
    { value: 'estrategia', label: 'Estratégia', icon: '🧠' },
    { value: 'aventura', label: 'Aventura', icon: '🗺️' },
];

const timeOptions = [
    { value: 'curto', label: 'Curto (1-3h)', icon: '⏱️' },
    { value: 'medio', label: 'Médio (3-8h)', icon: '⏰' },
    { value: 'longo', label: 'Longo (8h+)', icon: '🕐' },
];

const energyOptions = [
    { value: 'baixa', label: 'Baixa', icon: '😴' },
    { value: 'media', label: 'Média', icon: '😊' },
    { value: 'alta', label: 'Alta', icon: '🔥' },
];

const langOptions = [
    { value: 'dublado', label: 'Dublado', icon: '🎭' },
    { value: 'legendado', label: 'Legendado', icon: '📝' },
    { value: 'indiferente', label: 'Indiferente', icon: '🌍' },
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
            {/* Vibe Section */}
            <Box>
                <Typography variant="h6" sx={{ color: '#ffffff', mb: 2, fontWeight: 600 }}>
                    Como você quer se sentir?
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {vibeOptions.map((option) => (
                        <Chip
                            key={option.value}
                            label={`${option.icon} ${option.label}`}
                            onClick={() => toggleArrayFilter('vibe', option.value)}
                            color={filters.vibe?.includes(option.value) ? 'primary' : 'default'}
                            variant={filters.vibe?.includes(option.value) ? 'filled' : 'outlined'}
                            sx={{
                                backgroundColor: filters.vibe?.includes(option.value)
                                    ? 'rgba(102, 126, 234, 0.2)'
                                    : 'rgba(255, 255, 255, 0.1)',
                                color: filters.vibe?.includes(option.value)
                                    ? '#667eea'
                                    : '#a0aec0',
                                border: `1px solid ${filters.vibe?.includes(option.value)
                                    ? 'rgba(102, 126, 234, 0.3)'
                                    : 'rgba(255, 255, 255, 0.2)'}`,
                                '&:hover': {
                                    backgroundColor: filters.vibe?.includes(option.value)
                                        ? 'rgba(102, 126, 234, 0.3)'
                                        : 'rgba(255, 255, 255, 0.15)',
                                },
                                transition: 'all 0.2s ease-in-out',
                            }}
                        />
                    ))}
                </Stack>
            </Box>

            {/* Time Section */}
            <Box>
                <Typography variant="h6" sx={{ color: '#ffffff', mb: 2, fontWeight: 600 }}>
                    Quanto tempo você tem?
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {timeOptions.map((option) => (
                        <Chip
                            key={option.value}
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
                    ))}
                </Stack>
            </Box>

            {/* Energy Section */}
            <Box>
                <Typography variant="h6" sx={{ color: '#ffffff', mb: 2, fontWeight: 600 }}>
                    Qual seu nível de energia?
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {energyOptions.map((option) => (
                        <Chip
                            key={option.value}
                            label={`${option.icon} ${option.label}`}
                            onClick={() => toggleArrayFilter('energy', option.value)}
                            color={filters.energy?.includes(option.value) ? 'primary' : 'default'}
                            variant={filters.energy?.includes(option.value) ? 'filled' : 'outlined'}
                            sx={{
                                backgroundColor: filters.energy?.includes(option.value)
                                    ? 'rgba(255, 119, 198, 0.2)'
                                    : 'rgba(255, 255, 255, 0.1)',
                                color: filters.energy?.includes(option.value)
                                    ? '#ff77c6'
                                    : '#a0aec0',
                                border: `1px solid ${filters.energy?.includes(option.value)
                                    ? 'rgba(255, 119, 198, 0.3)'
                                    : 'rgba(255, 255, 255, 0.2)'}`,
                                '&:hover': {
                                    backgroundColor: filters.energy?.includes(option.value)
                                        ? 'rgba(255, 119, 198, 0.3)'
                                        : 'rgba(255, 255, 255, 0.15)',
                                },
                                transition: 'all 0.2s ease-in-out',
                            }}
                        />
                    ))}
                </Stack>
            </Box>

            {/* Language Section */}
            <Box>
                <Typography variant="h6" sx={{ color: '#ffffff', mb: 2, fontWeight: 600 }}>
                    Preferência de idioma
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {langOptions.map((option) => (
                        <Chip
                            key={option.value}
                            label={`${option.icon} ${option.label}`}
                            onClick={() => toggleArrayFilter('lang', option.value)}
                            color={filters.lang?.includes(option.value) ? 'primary' : 'default'}
                            variant={filters.lang?.includes(option.value) ? 'filled' : 'outlined'}
                            sx={{
                                backgroundColor: filters.lang?.includes(option.value)
                                    ? 'rgba(120, 219, 255, 0.2)'
                                    : 'rgba(255, 255, 255, 0.1)',
                                color: filters.lang?.includes(option.value)
                                    ? '#78dbff'
                                    : '#a0aec0',
                                border: `1px solid ${filters.lang?.includes(option.value)
                                    ? 'rgba(120, 219, 255, 0.3)'
                                    : 'rgba(255, 255, 255, 0.2)'}`,
                                '&:hover': {
                                    backgroundColor: filters.lang?.includes(option.value)
                                        ? 'rgba(120, 219, 255, 0.3)'
                                        : 'rgba(255, 255, 255, 0.15)',
                                },
                                transition: 'all 0.2s ease-in-out',
                            }}
                        />
                    ))}
                </Stack>
            </Box>
        </Stack>
    );
};