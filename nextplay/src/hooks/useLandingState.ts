import { useState, useMemo } from 'react';

export interface LandingFilters {
    platformId?: number;
    skill?: string;
    time?: string[];
    limit?: number;
    minYear?: number;
    maxYear?: number;
    vibes?: string[];
    multiplayerMode?: string;
}

export interface RecommendationPayload {
    platformId: number;
    skill: string;
    time: string;
    limit: number;
    minYear?: number;
    maxYear?: number;
    vibes?: string[];
    multiplayerMode?: string;
}

export const useLandingState = () => {
    const [filters, setFilters] = useState<LandingFilters>({
        time: [],
        limit: 20,
        minYear: 1990,
        maxYear: new Date().getFullYear(),
        vibes: [],
    });

    const updateFilter = <K extends keyof LandingFilters>(
        key: K,
        value: LandingFilters[K]
    ) => {
        setFilters(prev => {
            const next = { ...prev, [key]: value };

            const hasCompetitiveVibe = next.vibes?.includes('competitivo');
            const hasCoopSkill = next.skill === 'cooperacao';

            // Se o usuário tentar forçar Single Player, limpamos as opções incompatíveis
            if (next.multiplayerMode === 'single') {
                if (hasCompetitiveVibe) {
                    next.vibes = next.vibes?.filter(v => v !== 'competitivo');
                }
                if (hasCoopSkill) {
                    next.skill = undefined;
                }
            } 
            // Se o usuário marcar Competitivo ou Coop, não deixamos ficar em Single Player
            else if (hasCompetitiveVibe || hasCoopSkill) {
                if (next.multiplayerMode === 'single' || !next.multiplayerMode) {
                    next.multiplayerMode = 'both';
                }
            }

            return next;
        });
    };

    const isValid = useMemo(() => {
        return !!filters.platformId && !!filters.skill;
    }, [filters.platformId, filters.skill]);

    const buildPayload = (): RecommendationPayload => {
        return {
            platformId: filters.platformId || 4, // Default to PC if not set
            skill: filters.skill || '',
            time: filters.time?.join(',') || '',
            limit: filters.limit || 20,
            minYear: filters.minYear,
            maxYear: filters.maxYear,
            vibes: filters.vibes,
            multiplayerMode: filters.multiplayerMode || 'both',
        };
    };

    const resetFilters = () => {
        setFilters({
            time: [],
            limit: 20,
            minYear: 1990,
            maxYear: new Date().getFullYear(),
            vibes: [],
        });
    };

    return {
        filters,
        updateFilter,
        isValid,
        buildPayload,
        resetFilters,
    };
};