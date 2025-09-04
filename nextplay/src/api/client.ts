import { http } from './http';
import { RefreshResponseSchema, SavePreferencesSchema, RecommendResponseSchema, FeedbackSchema, type Preferences, type Feedback } from './schemas';
import type { RecommendationPayload } from '../hooks/useLandingState';

export const apiClient = {
    refresh: async () => {
        // Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, 1000));

        const mockData = {
            steamId: '76561198012345678',
            games: [
                {
                    id: '1',
                    name: 'The Witcher 3: Wild Hunt',
                    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/292030/header.jpg',
                    rating: 95,
                    hoursPlayed: 120.5,
                    lastPlayed: '2024-01-15T10:30:00Z',
                },
                {
                    id: '2',
                    name: 'Cyberpunk 2077',
                    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/1091500/header.jpg',
                    rating: 78,
                    hoursPlayed: 45.2,
                    lastPlayed: '2024-01-10T15:45:00Z',
                },
                {
                    id: '3',
                    name: 'Red Dead Redemption 2',
                    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/1174180/header.jpg',
                    rating: 92,
                    hoursPlayed: 89.7,
                    lastPlayed: '2024-01-05T20:15:00Z',
                },
                {
                    id: '4',
                    name: 'Elden Ring',
                    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/1245620/header.jpg',
                    rating: 88,
                    hoursPlayed: 156.3,
                    lastPlayed: '2024-01-20T14:20:00Z',
                },
                {
                    id: '5',
                    name: 'Baldur\'s Gate 3',
                    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/1086940/header.jpg',
                    rating: 96,
                    hoursPlayed: 203.8,
                    lastPlayed: '2024-01-18T09:30:00Z',
                },
                {
                    id: '6',
                    name: 'God of War',
                    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/1593500/header.jpg',
                    rating: 94,
                    hoursPlayed: 67.4,
                    lastPlayed: '2024-01-12T16:45:00Z',
                },
            ],
        };

        return RefreshResponseSchema.parse(mockData);
    },

    savePreferences: async (preferences: Preferences) => {
        await new Promise(resolve => setTimeout(resolve, 800));

        const mockResponse = {
            preferences: {
                genres: preferences.genres,
                playtime: preferences.playtime,
                rating: preferences.rating,
            },
        };

        return SavePreferencesSchema.parse(mockResponse);
    },

    recommend: async (_page: number = 1, _limit: number = 10) => {
        await new Promise(resolve => setTimeout(resolve, 1200));

        const mockRecommendations = {
            games: [
                {
                    id: 'rec1',
                    name: 'The Witcher 3: Wild Hunt',
                    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/292030/header.jpg',
                    rating: 95,
                    hoursPlayed: 120.5,
                    lastPlayed: '2024-01-15T10:30:00Z',
                    price: 29.99,
                    originalPrice: 59.99,
                    discount: 50,
                },
                {
                    id: 'rec2',
                    name: 'Cyberpunk 2077',
                    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/1091500/header.jpg',
                    rating: 78,
                    hoursPlayed: 45.2,
                    lastPlayed: '2024-01-10T15:45:00Z',
                    price: 39.99,
                    originalPrice: 79.99,
                    discount: 50,
                },
                {
                    id: 'rec3',
                    name: 'Red Dead Redemption 2',
                    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/1174180/header.jpg',
                    rating: 92,
                    hoursPlayed: 89.7,
                    lastPlayed: '2024-01-05T20:15:00Z',
                    price: 44.99,
                    originalPrice: 89.99,
                    discount: 50,
                },
                {
                    id: 'rec4',
                    name: 'Elden Ring',
                    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/1245620/header.jpg',
                    rating: 88,
                    hoursPlayed: 156.3,
                    lastPlayed: '2024-01-20T14:20:00Z',
                    price: 49.99,
                    originalPrice: 99.99,
                    discount: 50,
                },
                {
                    id: 'rec5',
                    name: 'Baldur\'s Gate 3',
                    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/1086940/header.jpg',
                    rating: 96,
                    hoursPlayed: 203.8,
                    lastPlayed: '2024-01-18T09:30:00Z',
                    price: 59.99,
                    originalPrice: 119.99,
                    discount: 50,
                },
                {
                    id: 'rec6',
                    name: 'God of War',
                    coverImage: 'https://cdn.akamai.steamstatic.com/steam/apps/1593500/header.jpg',
                    rating: 94,
                    hoursPlayed: 67.4,
                    lastPlayed: '2024-01-12T16:45:00Z',
                    price: 34.99,
                    originalPrice: 69.99,
                    discount: 50,
                },
            ],
            total: 25,
        };

        return RecommendResponseSchema.parse(mockRecommendations);
    },

    feedback: async (feedback: Feedback) => {
        await new Promise(resolve => setTimeout(resolve, 500));

        const mockResponse = {
            gameId: feedback.gameId,
            rating: feedback.rating,
            comment: feedback.comment,
        };

        return FeedbackSchema.parse(mockResponse);
    },

    recommendByVibe: async (payload: RecommendationPayload) => {
        console.log('🚀 Sending request to backend:', payload);

        // Chama a API real do backend (sem fallback)
        const response = await http.post('/api/recommendations', payload);

        // Transforma a resposta da API para o formato esperado pelo frontend
        const backendData = response.data;

        console.log('🔍 Backend Data:', backendData);

        const frontendData = {
            games: backendData.items.map((item: any) => ({
                id: item.appId.toString(),
                name: item.name,
                coverImage: `https://cdn.akamai.steamstatic.com/steam/apps/${item.appId}/header.jpg`,
                rating: item.scoreTotal,
                hoursPlayed: 0,
                metaScore: item.scores?.metacritic || null,
                openCriticScore: item.scores?.openCritic || null,
                steamScore: item.scores?.steamPosPct || null,
                hltbMain: item.hltb?.mainHours || null,
                reasons: item.why,
                // Não incluir campos opcionais se não temos dados
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
};
