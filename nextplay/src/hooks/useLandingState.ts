import { useState, useMemo } from 'react';

export type LanguageOption = 'dublado' | 'legendado' | 'indiferente';

export interface LandingFilters {
    vibe?: ('relax' | 'historia' | 'raiva' | 'intelecto' | 'competitivo' | 'coop' | 'explorar' | 'nostalgia' | 'dificil' | 'casual_rapido')[] | 'relax' | 'historia' | 'raiva' | 'intelecto' | 'competitivo' | 'coop' | 'explorar' | 'nostalgia' | 'dificil' | 'casual_rapido';
    duration?: 'rapido' | 'medio' | 'longo' | 'muito_longo' | 'tanto_faz';
    energy?: 'baixa' | 'normal' | 'alta';
    social?: 'solo' | 'coop' | 'pvp';
    contentTone?: 'evitar_pesado' | 'indiferente' | 'topa_pesado';
    controllerPreferred?: boolean;
    lang?: LanguageOption[];
    structure?: 'campaign' | 'replay';
    flavors?: string[];
    limit?: number;
}

export interface RecommendationPayload extends LandingFilters {
    steamId64: string;
    vibe: NonNullable<LandingFilters['vibe']>;
    duration: NonNullable<LandingFilters['duration']>;
    limit: number;
}

export const useLandingState = () => {
    const [filters, setFilters] = useState<LandingFilters>({
        energy: 'normal',
        social: 'solo',
        contentTone: 'indiferente',
        controllerPreferred: false,
        lang: ['dublado', 'legendado'],
        structure: 'campaign',
        flavors: [],
        limit: 100,
    });

    const updateFilter = <K extends keyof LandingFilters>(
        key: K,
        value: LandingFilters[K]
    ) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const toggleFlavor = (flavor: string) => {
        setFilters(prev => ({
            ...prev,
            flavors: prev.flavors?.includes(flavor)
                ? prev.flavors.filter(f => f !== flavor)
                : [...(prev.flavors || []), flavor]
        }));
    };

    const isValid = useMemo(() => {
        const hasVibe = filters.vibe && (
            Array.isArray(filters.vibe) ? filters.vibe.length > 0 : true
        );
        return !!(hasVibe && filters.duration);
    }, [filters.vibe, filters.duration]);

    const buildPayload = (steamId64: string): RecommendationPayload => {
        const hasVibe = filters.vibe && (
            Array.isArray(filters.vibe) ? filters.vibe.length > 0 : true
        );

        if (!hasVibe || !filters.duration) {
            throw new Error('Vibe e duração são obrigatórios');
        }

        return {
            steamId64,
            vibe: filters.vibe || [],
            duration: filters.duration,
            energy: filters.energy,
            social: filters.social,
            contentTone: filters.contentTone,
            controllerPreferred: filters.controllerPreferred,
            lang: filters.lang,
            structure: filters.structure,
            flavors: filters.flavors,
            limit: filters.limit || 100,
        };
    };

    const buildDiscoverPayload = () => {
        const hasVibe = filters.vibe && (
            Array.isArray(filters.vibe) ? filters.vibe.length > 0 : true
        );

        if (!hasVibe || !filters.duration) {
            throw new Error('Vibe e duração são obrigatórios');
        }

        return {
            vibe: Array.isArray(filters.vibe) ? filters.vibe.filter(Boolean) : (filters.vibe ? [filters.vibe] : []),
            duration: filters.duration,
            energy: filters.energy || 'normal',
            social: filters.social || 'tanto_faz',
            contentTone: filters.contentTone || 'indiferente',
            controllerPreferred: filters.controllerPreferred,
            lang: filters.lang || ['indiferente'],
            structure: filters.structure || 'tanto_faz',
            flavors: filters.flavors || [],
            limit: filters.limit || 100,
        };
    };

    const resetFilters = () => {
        setFilters({
            energy: 'normal',
            social: 'solo',
            contentTone: 'indiferente',
            controllerPreferred: false,
            lang: ['dublado', 'legendado'],
            structure: 'campaign',
            flavors: [],
            limit: 12,
        });
    };

    return {
        filters,
        updateFilter,
        toggleFlavor,
        isValid,
        buildPayload,
        buildDiscoverPayload,
        resetFilters,
    };
};
