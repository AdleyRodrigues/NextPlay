import { http } from './http';
import { RefreshResponseSchema, SavePreferencesSchema, RecommendResponseSchema, FeedbackSchema, type Preferences, type Feedback } from './schemas';
import type { RecommendationPayload } from '../hooks/useLandingState';

export const apiClient = {
    refresh: async (steamId64: string) => {
        console.log('🔄 Refreshing Steam library for:', steamId64);

        try {
            // Chama a API real do backend
            const response = await http.get(`/api/refresh/${steamId64}`);
            const backendData = response.data;

            console.log('📚 Backend refresh response:', backendData);

            // Transforma a resposta para o formato esperado pelo frontend
            const frontendData = {
                steamId: steamId64,
                games: [], // A biblioteca será carregada separadamente se necessário
                message: backendData.message,
                gamesFound: backendData.gamesFound,
                lastRefresh: backendData.lastRefresh,
                playerInfo: backendData.playerInfo
            };

            return RefreshResponseSchema.parse(frontendData);
        } catch (error) {
            console.error('❌ Error refreshing Steam library:', error);
            throw error;
        }
    },

    savePreferences: async (preferences: Preferences) => {
        console.log('💾 Saving preferences:', preferences);

        try {
            const response = await http.put('/api/userprefs', preferences);
            return SavePreferencesSchema.parse(response.data);
        } catch (error) {
            console.error('❌ Error saving preferences:', error);
            throw error;
        }
    },

    recommend: async (payload: RecommendationPayload) => {
        console.log('🔍 Sending recommendation request to backend:', payload);

        const response = await http.post('/api/recommendations', payload);
        const backendData = response.data;

        console.log('🔍 Backend Data:', backendData);

        const frontendData = {
            games: backendData.items.map((item: any, index: number) => ({
                id: item.appId.toString(),
                name: item.name,
                coverImage: item.backgroundImage || item.headerImage || `https://cdn.akamai.steamstatic.com/steam/apps/${item.appId}/header.jpg`,
                rating: item.scoreTotal,
                hoursPlayed: item.playtimeForever ? item.playtimeForever / 60 : 0, // Converter minutos para horas
                lastPlayed: item.lastPlayed || null,
                metaScore: item.scores?.metacritic || null,
                openCriticScore: item.scores?.openCritic || null,
                steamScore: item.scores?.steamPositivePct || null,
                hltbMain: item.hltb?.mainHours || null,
                reasons: item.why,
                // Campos de conquistas (quando disponíveis)
                achievementsTotal: item.achievementsTotal || null,
                achievementsUnlocked: item.achievementsUnlocked || null,
                // Gêneros (quando disponíveis)
                genres: item.genres || [],
                // Score e posição da recomendação
                score: item.scoreTotal || 0,
                position: index + 1,
            })),
            total: backendData.items.length,
        };

        console.log('🎮 Frontend Data:', frontendData);

        return RecommendResponseSchema.parse(frontendData);
    },

    feedback: async (feedback: Feedback) => {
        console.log('💬 Sending feedback:', feedback);

        try {
            const response = await http.post('/api/feedback', feedback);
            return FeedbackSchema.parse(response.data);
        } catch (error) {
            console.error('❌ Error sending feedback:', error);
            throw error;
        }
    },

    recommendByVibe: async (payload: RecommendationPayload) => {
        console.log('🚀 Sending request to backend:', payload);

        // Chama a API real do backend (sem fallback)
        const response = await http.post('/api/recommendations', payload);

        // Transforma a resposta da API para o formato esperado pelo frontend
        const backendData = response.data;

        console.log('🔍 Backend Data:', backendData);

        const frontendData = {
            games: backendData.items.map((item: any, index: number) => ({
                id: item.appId.toString(),
                name: item.name,
                coverImage: item.backgroundImage || item.headerImage || `https://cdn.akamai.steamstatic.com/steam/apps/${item.appId}/header.jpg`,
                rating: item.scoreTotal,
                hoursPlayed: item.playtimeForever ? item.playtimeForever / 60 : 0, // Converter minutos para horas
                lastPlayed: item.lastPlayed || null,
                metaScore: item.scores?.metacritic || null,
                openCriticScore: item.scores?.openCritic || null,
                steamScore: item.scores?.steamPositivePct || null,
                hltbMain: item.hltb?.mainHours || null,
                reasons: item.why,
                // Campos de conquistas (quando disponíveis)
                achievementsTotal: item.achievementsTotal || null,
                achievementsUnlocked: item.achievementsUnlocked || null,
                // Gêneros (quando disponíveis)
                genres: item.genres || [],
                // Score e posição da recomendação
                score: item.scoreTotal || 0,
                position: index + 1,
            })),
            total: backendData.items.length,
        };

        console.log('🎮 Frontend Data:', frontendData);

        return RecommendResponseSchema.parse(frontendData);
    },

    discover: async (discoverPayload: {
        vibe?: string[];
        duration: string;
        energy: string;
        social: string;
        contentTone: string;
        controllerPreferred?: boolean;
        lang: string;
        structure: string;
        flavors?: string[];
        limit?: number;
    }) => {
        console.log('🔍 Sending discover request to backend:', discoverPayload);

        // Chama a nova API de descoberta
        const response = await http.post('/api/discover', discoverPayload);
        const backendData = response.data;

        console.log('🎯 Discover Backend Data:', backendData);

        // Transforma para o formato esperado pelo frontend
        const frontendData = {
            games: backendData.items.map((item: any) => ({
                id: item.appId?.toString() || `${item.store}-${item.name.replace(/\s+/g, '-')}`,
                name: item.name,
                coverImage: item.image || `https://via.placeholder.com/460x215?text=${encodeURIComponent(item.name)}`,
                rating: Math.round(item.scoreTotal * 100), // Converter 0-1 para 0-100
                hoursPlayed: 0,
                metaScore: item.metacritic || null,
                criticRating: item.criticRating || null,
                steamScore: item.steamPosPct || null,
                hltbMain: item.hltbMainHours || null,
                reasons: item.why || [],
                store: item.store,
                storeUrl: item.storeUrl,
                // Campos específicos da descoberta
                lastPlayed: null, // Não aplicável para descoberta
                price: null, // Não temos dados de preço da descoberta
                originalPrice: null,
                discount: null,
            })),
            total: backendData.count,
            generatedAt: backendData.generatedAt,
        };

        console.log('🎮 Discover Frontend Data:', frontendData);

        return RecommendResponseSchema.parse(frontendData);
    },

    getGameReviews: async (appId: number) => {
        console.log('📝 Fetching reviews for app:', appId);

        try {
            const response = await http.get(`/api/games/${appId}/reviews`);
            return response.data;
        } catch (error) {
            console.error('❌ Error fetching game reviews:', error);
            throw error;
        }
    },
};
