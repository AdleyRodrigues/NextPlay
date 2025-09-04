import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';

// Hook para refresh da biblioteca Steam
export const useRefresh = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (_steamId64: string) => {
            return await apiClient.refresh();
        },
        onSuccess: () => {
            // Invalidar queries relacionadas após refresh
            queryClient.invalidateQueries({ queryKey: ['steam-library'] });
            queryClient.invalidateQueries({ queryKey: ['recommendations'] });
        },
    });
};

// Hook para feedback de jogos
export const useFeedback = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (feedback: { appId: string; type: 'like' | 'dislike' | 'snooze' }) => {
            // Converter para o formato esperado pela API
            const rating = feedback.type === 'like' ? 1 : feedback.type === 'dislike' ? -1 : 0;
            return await apiClient.feedback({
                gameId: feedback.appId,
                rating,
                comment: feedback.type
            });
        },
        onSuccess: () => {
            // Invalidar queries de recomendações após feedback
            queryClient.invalidateQueries({ queryKey: ['recommendations'] });
        },
    });
};

// Hook para obter recomendações
export const useRecommendations = (payload: any, enabled: boolean = true) => {
    return useQuery({
        queryKey: ['recommendations', payload],
        queryFn: () => apiClient.recommendByVibe(payload),
        enabled,
        staleTime: 5 * 60 * 1000, // 5 minutos
    });
};

// Hook para descoberta de jogos
export const useDiscover = (payload: any, enabled: boolean = true) => {
    return useQuery({
        queryKey: ['discover', payload],
        queryFn: () => apiClient.discover(payload),
        enabled,
        staleTime: 5 * 60 * 1000, // 5 minutos
    });
};

// Hook para salvar preferências
export const useSavePreferences = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (preferences: any) => {
            return await apiClient.savePreferences(preferences);
        },
        onSuccess: () => {
            // Invalidar queries relacionadas às preferências
            queryClient.invalidateQueries({ queryKey: ['user-preferences'] });
        },
    });
};
