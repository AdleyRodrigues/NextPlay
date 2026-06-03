import { useState, useMemo } from 'react';

export interface LandingFilters {
    platformId?: number;
    skill?: string;
    time?: string[];
    limit?: number;
}

export interface RecommendationPayload {
    platformId: number;
    skill: string;
    time: string;
    limit: number;
}

export const useLandingState = () => {
    const [filters, setFilters] = useState<LandingFilters>({
        time: [],
        limit: 20,
    });

    const updateFilter = <K extends keyof LandingFilters>(
        key: K,
        value: LandingFilters[K]
    ) => {
        setFilters(prev => ({ ...prev, [key]: value }));
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
        };
    };

    const resetFilters = () => {
        setFilters({
            time: [],
            limit: 20,
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