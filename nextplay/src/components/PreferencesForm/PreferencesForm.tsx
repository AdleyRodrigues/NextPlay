import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    OutlinedInput,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import type { Preferences } from '../../api/schemas';

interface PreferencesFormProps {
    initialPreferences?: Preferences;
    onSubmit: (preferences: Preferences) => void;
    isLoading?: boolean;
}

const availableGenres = [
    'Action', 'Adventure', 'RPG', 'Strategy', 'Simulation', 'Sports',
    'Racing', 'Puzzle', 'Indie', 'Casual', 'Shooter', 'Fighting',
    'Platformer', 'Horror', 'Stealth', 'Survival', 'Visual Novel'
];

export const PreferencesForm = ({
    initialPreferences,
    onSubmit,
    isLoading = false
}: PreferencesFormProps) => {
    const [preferences, setPreferences] = useState<Preferences>(
        initialPreferences || {
            genres: [],
            playtime: { min: 0, max: 100 },
            rating: { min: 0, max: 100 },
        }
    );

    const handleGenreChange = (event: SelectChangeEvent<string[]>) => {
        const value = event.target.value;
        setPreferences((prev: Preferences) => ({
            ...prev,
            genres: typeof value === 'string' ? value.split(',') : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(preferences);
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h5" gutterBottom>
                Configurar Preferências
            </Typography>

            <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Gêneros Favoritos</InputLabel>
                <Select
                    multiple
                    value={preferences.genres}
                    onChange={handleGenreChange}
                    input={<OutlinedInput label="Gêneros Favoritos" />}
                    renderValue={(selected: string[]) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selected.map((value: string) => (
                                <Chip key={value} label={value} size="small" />
                            ))}
                        </Box>
                    )}
                >
                    {availableGenres.map((genre) => (
                        <MenuItem key={genre} value={genre}>
                            {genre}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField
                    fullWidth
                    label="Tempo mínimo de jogo (horas)"
                    type="number"
                    value={preferences.playtime.min}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPreferences((prev: Preferences) => ({
                        ...prev,
                        playtime: { ...prev.playtime, min: Number(e.target.value) }
                    }))}
                    inputProps={{ min: 0 }}
                />
                <TextField
                    fullWidth
                    label="Tempo máximo de jogo (horas)"
                    type="number"
                    value={preferences.playtime.max}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPreferences((prev: Preferences) => ({
                        ...prev,
                        playtime: { ...prev.playtime, max: Number(e.target.value) }
                    }))}
                    inputProps={{ min: 0 }}
                />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField
                    fullWidth
                    label="Avaliação mínima (%)"
                    type="number"
                    value={preferences.rating.min}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPreferences((prev: Preferences) => ({
                        ...prev,
                        rating: { ...prev.rating, min: Number(e.target.value) }
                    }))}
                    inputProps={{ min: 0, max: 100 }}
                />
                <TextField
                    fullWidth
                    label="Avaliação máxima (%)"
                    type="number"
                    value={preferences.rating.max}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPreferences((prev: Preferences) => ({
                        ...prev,
                        rating: { ...prev.rating, max: Number(e.target.value) }
                    }))}
                    inputProps={{ min: 0, max: 100 }}
                />
            </Box>

            <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={isLoading}
            >
                {isLoading ? 'Salvando...' : 'Salvar Preferências'}
            </Button>
        </Box>
    );
};
