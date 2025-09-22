import { useState, useMemo } from 'react';

export interface LandingFilters {
    vibe?: string[];
    time?: string[];
    energy?: string[];
    lang?: string[];
    limit?: number;
}

export interface RecommendationPayload {
    steamId64: string;
    vibe: string;
    time: string;
    energy: string;
    lang: string;
    limit: number;
}

export const useLandingState = () => {
    const [filters, setFilters] = useState<LandingFilters>({
        vibe: [],
        time: [],
        energy: [],
        lang: [],
        limit: 20,
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
            vibe: prev.vibe?.includes(flavor)
                ? prev.vibe.filter(f => f !== flavor)
                : [...(prev.vibe || []), flavor]
        }));
    };

    const isValid = useMemo(() => {
        return (filters.vibe?.length || 0) > 0;
    }, [filters.vibe]);

    const buildPayload = (steamId64: string): RecommendationPayload => {
        return {
            steamId64,
            vibe: filters.vibe?.join(',') || 'relaxar',
            time: filters.time?.join(',') || 'medio',
            energy: filters.energy?.join(',') || 'normal',
            lang: filters.lang?.join(',') || 'indiferente',
            limit: filters.limit || 20,
        };
    };

    const buildDiscoverPayload = () => {
        return {
            vibe: filters.vibe || [],
            time: filters.time || [],
            energy: filters.energy || [],
            lang: filters.lang || [],
            limit: filters.limit || 20,
        };
    };

    const resetFilters = () => {
        setFilters({
            vibe: [],
            time: [],
            energy: [],
            lang: [],
            limit: 20,
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