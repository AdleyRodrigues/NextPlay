import React from 'react';
import {
    Box,
    Typography,
    Chip,
    ToggleButtonGroup,
    ToggleButton,
    FormControlLabel,
    Radio,
    Switch,
    Paper,
    Grid,
    Divider,
} from '@mui/material';
import type { LandingFilters, LanguageOption } from '../../hooks/useLandingState';

interface LandingFilterProps {
    filters: LandingFilters;
    onFilterChange: <K extends keyof LandingFilters>(key: K, value: LandingFilters[K]) => void;
    onFlavorToggle: (flavor: string) => void;
}

const vibeOptions = [
    { value: 'relax', label: 'Relaxar', icon: '😌' },
    { value: 'historia', label: 'História', icon: '📚' },
    { value: 'raiva', label: 'Descarregar raiva', icon: '😤' },
    { value: 'intelecto', label: 'Usar o cérebro', icon: '🧠' },
    { value: 'competitivo', label: 'Competir', icon: '🏆' },
    { value: 'coop', label: 'Jogar junto', icon: '🤝' },
    { value: 'explorar', label: 'Explorar mundos', icon: '🗺️' },
    { value: 'nostalgia', label: 'Nostalgia', icon: '💝' },
    { value: 'dificil', label: 'Desafio difícil', icon: '💪' },
    { value: 'casual_rapido', label: 'Algo rápido', icon: '⚡' },
] as const;

const durationOptions = [
    { value: 'rapido', label: 'Rapidinho', subtitle: 'Menos de 2h' },
    { value: 'medio', label: 'Médio', subtitle: '2 a 8 horas' },
    { value: 'longo', label: 'Longo', subtitle: '8 a 30 horas' },
    { value: 'muito_longo', label: 'Muito Longo', subtitle: 'Mais de 30h' },
    { value: 'tanto_faz', label: 'Tanto faz', subtitle: 'Qualquer duração' },
] as const;

const flavorOptions = [
    'Ação', 'RPG', 'Estratégia', 'Quebra-cabeça', 'Plataforma', 'Corrida',
    'Simulação', 'Esportes', 'Aventura', 'Terror', 'Indie', 'Roguelike'
];

export const LandingFilter: React.FC<LandingFilterProps> = ({
    filters,
    onFilterChange,
    onFlavorToggle,
}) => {
    return (
        <Paper sx={{
            p: 1.5,
            background: 'linear-gradient(135deg, #2a475e 0%, #1b2838 100%)',
            border: '1px solid #66c0f4',
            borderRadius: 2,
        }}>
            {/* Linha 1: Como você quer se sentir jogando? */}
            <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ color: '#ffffff', mb: 0.5, fontSize: '1rem', fontWeight: 600 }}>
                    😊 Como você quer se sentir jogando? * <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>(pode escolher várias opções)</span>
                </Typography>
                <Typography variant="body2" sx={{ color: '#c7d5e0', mb: 1, fontSize: '0.75rem', fontStyle: 'italic' }}>
                    🏆 Sempre buscamos os melhores jogos dos últimos 10 anos para você
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {vibeOptions.map((option) => (
                        <Chip
                            key={option.value}
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <span style={{ fontSize: '0.9rem' }}>{option.icon}</span>
                                    <span style={{ fontSize: '0.8rem' }}>{option.label}</span>
                                </Box>
                            }
                            clickable
                            size="small"
                            color={(filters.vibe && Array.isArray(filters.vibe) ? filters.vibe.includes(option.value) : filters.vibe === option.value) ? 'primary' : 'default'}
                            variant={(filters.vibe && Array.isArray(filters.vibe) ? filters.vibe.includes(option.value) : filters.vibe === option.value) ? 'filled' : 'outlined'}
                            onClick={() => {
                                const currentVibes = Array.isArray(filters.vibe) ? filters.vibe : filters.vibe ? [filters.vibe] : [];
                                const isSelected = currentVibes.includes(option.value);

                                if (isSelected) {
                                    // Remove se já está selecionado
                                    const newVibes = currentVibes.filter(v => v !== option.value);
                                    onFilterChange('vibe', newVibes.length > 0 ? newVibes : undefined);
                                } else {
                                    // Adiciona à seleção
                                    onFilterChange('vibe', [...currentVibes, option.value]);
                                }
                            }}
                            sx={{ height: 32 }}
                        />
                    ))}
                </Box>
            </Box>

            <Divider sx={{ borderColor: '#66c0f4', opacity: 0.3, my: 1.5 }} />

            {/* Linha 2: Tempo + Energia + Social */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
                {/* Quanto tempo você tem? */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Typography variant="subtitle1" sx={{ color: '#ffffff', mb: 1, fontSize: '1rem', fontWeight: 600 }}>
                        ⏰ Quanto tempo você tem para jogar? *
                    </Typography>
                    <ToggleButtonGroup
                        value={filters.duration}
                        exclusive
                        onChange={(_, value) => value && onFilterChange('duration', value)}
                        size="small"
                        sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}
                    >
                        {durationOptions.map((option) => (
                            <ToggleButton
                                key={option.value}
                                value={option.value}
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    minWidth: 80,
                                    p: 1,
                                    fontSize: '0.75rem',
                                    '&.Mui-selected': {
                                        bgcolor: 'primary.main',
                                        color: 'primary.contrastText',
                                    },
                                }}
                            >
                                <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem', lineHeight: 1.2 }}>
                                    {option.label}
                                </Typography>
                                <Typography variant="caption" sx={{ fontSize: '0.65rem', opacity: 0.8, lineHeight: 1.1 }}>
                                    {option.subtitle}
                                </Typography>
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                </Grid>

                {/* Quanta energia você tem? */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Typography variant="subtitle1" sx={{ color: '#ffffff', mb: 1, fontSize: '1rem', fontWeight: 600 }}>
                        ⚡ Quanta energia você tem?
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {[
                            { value: 'baixa', label: 'Pouca (tô cansado)' },
                            { value: 'normal', label: 'Normal' },
                            { value: 'alta', label: 'Muita (tô animado!)' }
                        ].map((energy) => (
                            <FormControlLabel
                                key={energy.value}
                                control={
                                    <Radio
                                        size="small"
                                        checked={filters.energy === energy.value}
                                        onChange={() => onFilterChange('energy', energy.value as any)}
                                        sx={{ p: 0.2 }}
                                    />
                                }
                                label={
                                    <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#c7d5e0' }}>
                                        {energy.label}
                                    </Typography>
                                }
                                sx={{ m: 0 }}
                            />
                        ))}
                    </Box>
                </Grid>

                {/* Quer jogar sozinho ou com outros? */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Typography variant="subtitle1" sx={{ color: '#ffffff', mb: 1, fontSize: '1rem', fontWeight: 600 }}>
                        👥 Quer jogar sozinho ou com outros?
                    </Typography>
                    <ToggleButtonGroup
                        value={filters.social}
                        exclusive
                        onChange={(_, value) => value && onFilterChange('social', value)}
                        size="small"
                        sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}
                    >
                        <ToggleButton value="solo" sx={{ px: 1.5, py: 0.5, fontSize: '0.8rem', justifyContent: 'flex-start' }}>
                            Sozinho
                        </ToggleButton>
                        <ToggleButton value="coop" sx={{ px: 1.5, py: 0.5, fontSize: '0.8rem', justifyContent: 'flex-start' }}>
                            Com amigos
                        </ToggleButton>
                        <ToggleButton value="pvp" sx={{ px: 1.5, py: 0.5, fontSize: '0.8rem', justifyContent: 'flex-start' }}>
                            Contra outros
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Grid>
            </Grid>

            <Divider sx={{ borderColor: '#66c0f4', opacity: 0.3, my: 1 }} />

            {/* Linha 3: História + Controle + Idioma + Estrutura */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
                {/* Que tipo de história? */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant="subtitle1" sx={{ color: '#ffffff', mb: 1, fontSize: '1rem', fontWeight: 600 }}>
                        📖 Que tipo de história?
                    </Typography>
                    <ToggleButtonGroup
                        value={filters.contentTone}
                        exclusive
                        onChange={(_, value) => value && onFilterChange('contentTone', value)}
                        size="small"
                        sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}
                    >
                        <ToggleButton value="evitar_pesado" sx={{ px: 1.5, py: 0.5, fontSize: '0.8rem', justifyContent: 'flex-start' }}>
                            Alegre
                        </ToggleButton>
                        <ToggleButton value="indiferente" sx={{ px: 1.5, py: 0.5, fontSize: '0.8rem', justifyContent: 'flex-start' }}>
                            Tanto faz
                        </ToggleButton>
                        <ToggleButton value="topa_pesado" sx={{ px: 1.5, py: 0.5, fontSize: '0.8rem', justifyContent: 'flex-start' }}>
                            Séria
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Grid>

                {/* Prefere controle? */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant="subtitle1" sx={{ color: '#ffffff', mb: 1, fontSize: '1rem', fontWeight: 600 }}>
                        🎮 Controle
                    </Typography>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={filters.controllerPreferred || false}
                                onChange={(e) => onFilterChange('controllerPreferred', e.target.checked)}
                                size="small"
                            />
                        }
                        label={
                            <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#c7d5e0' }}>
                                Prefiro controle
                            </Typography>
                        }
                        sx={{ m: 0 }}
                    />
                </Grid>

                {/* Preferência de idioma */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant="subtitle1" sx={{ color: '#ffffff', mb: 1, fontSize: '1rem', fontWeight: 600 }}>
                        🇧🇷 Idioma
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#c7d5e0', mb: 1, fontSize: '0.7rem', display: 'block' }}>
                        Selecione suas preferências
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {(['dublado', 'legendado', 'indiferente'] as LanguageOption[]).map((option) => (
                            <FormControlLabel
                                key={option}
                                control={
                                    <Switch
                                        size="small"
                                        checked={filters.lang?.includes(option) || false}
                                        onChange={() => {
                                            const currentLang = filters.lang || [];
                                            if (currentLang.includes(option)) {
                                                onFilterChange('lang', currentLang.filter(l => l !== option));
                                            } else {
                                                onFilterChange('lang', [...currentLang, option]);
                                            }
                                        }}
                                    />
                                }
                                label={
                                    <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#c7d5e0' }}>
                                        {option === 'dublado' ? '🎭 Dublado' :
                                            option === 'legendado' ? '📝 Legendado' :
                                                '🌍 Tanto faz'}
                                    </Typography>
                                }
                                sx={{ m: 0 }}
                            />
                        ))}
                    </Box>
                </Grid>

                {/* Que tipo de jogo? */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Typography variant="subtitle1" sx={{ color: '#ffffff', mb: 1, fontSize: '1rem', fontWeight: 600 }}>
                        🎯 Estrutura
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#c7d5e0', mb: 1, fontSize: '0.7rem', display: 'block' }}>
                        História ou mecânicas
                    </Typography>
                    <ToggleButtonGroup
                        value={filters.structure}
                        exclusive
                        onChange={(_, value) => value && onFilterChange('structure', value)}
                        size="small"
                        sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}
                    >
                        <ToggleButton value="campaign" sx={{ px: 1.5, py: 0.5, fontSize: '0.8rem', justifyContent: 'flex-start' }}>
                            Com história
                        </ToggleButton>
                        <ToggleButton value="replay" sx={{ px: 1.5, py: 0.5, fontSize: '0.8rem', justifyContent: 'flex-start' }}>
                            Para repetir
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Grid>
            </Grid>

            {/* Linha 4: Tipos de jogos favoritos */}
            <Box sx={{ mt: 1 }}>
                <Typography variant="body2" sx={{ color: '#ffffff', mb: 0.5, fontSize: '0.8rem' }}>
                    🎮 Que tipos de jogos você gosta? (opcional)
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.4 }}>
                    {flavorOptions.map((flavor) => (
                        <Chip
                            key={flavor}
                            label={flavor}
                            clickable
                            size="small"
                            color={filters.flavors?.includes(flavor) ? 'primary' : 'default'}
                            variant={filters.flavors?.includes(flavor) ? 'filled' : 'outlined'}
                            onClick={() => onFlavorToggle(flavor)}
                            sx={{
                                fontSize: '0.7rem',
                                height: 26,
                                '& .MuiChip-label': { px: 1 }
                            }}
                        />
                    ))}
                </Box>
            </Box>
        </Paper>
    );
};