import { useState } from 'react';

// Tipos para o algoritmo de ranqueamento
export interface RankingRequest {
    steamId64: string;
    mode: 'jogar' | 'terminar' | 'zerar' | 'platinar';
    limit?: number;
}

export interface RankingResponse {
    generatedAt: string;
    steamId64: string;
    mode: string;
    items: RankingItem[];
    totalGamesAnalyzed: number;
}

export interface RankingItem {
    appId: number;
    name: string;
    headerImage?: string;
    finalScore: number;
    quality: QualityScores;
    usage: UsageSignals;
    why: string[];
    rank: number;
}

export interface QualityScores {
    steamWilson: number;
    metacritic?: number;
    openCritic?: number;
    combined: number;
    steamPositive: number;
    steamNegative: number;
}

export interface UsageSignals {
    novelty: number;        // 0-1: quer começar algo novo
    recency: number;        // 0-1: retomar o parado
    progress: number;       // 0-1: progresso nas conquistas
    nearFinish: number;     // 0-1: kernel gaussiano para 90%
    midProgress: number;    // 0-1: kernel gaussiano para 45%
    playtimeMinutes: number;
    lastPlayed?: string;
    achievementPercentage: number;
}

// Cliente para chamadas de ranqueamento
export const rankingClient = {
    async getTopGames(request: RankingRequest): Promise<RankingResponse> {
        console.log('🎯 Sending ranking request:', request);

        const response = await fetch('/api/ranking/top-games', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            throw new Error(`Ranking API error: ${response.status}`);
        }

        const data = await response.json();
        console.log('📊 Ranking response:', data);

        return data;
    }
};

// Hook para usar o ranqueamento
export const useRanking = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ranking, setRanking] = useState<RankingResponse | null>(null);

    const getTopGames = async (request: RankingRequest) => {
        setLoading(true);
        setError(null);

        try {
            const result = await rankingClient.getTopGames(request);
            setRanking(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido');
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        ranking,
        getTopGames,
    };
};

// Utilitários para exibição
export const formatPlaytime = (minutes: number): string => {
    if (minutes === 0) return 'Nunca jogado';
    if (minutes < 60) return `${minutes}min`;

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours < 24) {
        return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
    }

    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;

    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
};

export const formatLastPlayed = (lastPlayed?: string): string => {
    if (!lastPlayed) return 'Nunca jogado';

    const date = new Date(lastPlayed);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays} dias atrás`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} meses atrás`;

    return `${Math.floor(diffDays / 365)} anos atrás`;
};

export const getModeDescription = (mode: string): string => {
    switch (mode) {
        case 'jogar': return 'Começar algo novo';
        case 'terminar': return 'Continuar jogos em andamento';
        case 'zerar': return 'Finalizar campanhas';
        case 'platinar': return 'Platinar jogos';
        default: return mode;
    }
};

export const getModeIcon = (mode: string): string => {
    switch (mode) {
        case 'jogar': return '🎮';
        case 'terminar': return '▶️';
        case 'zerar': return '🏁';
        case 'platinar': return '🏆';
        default: return '🎯';
    }
};
