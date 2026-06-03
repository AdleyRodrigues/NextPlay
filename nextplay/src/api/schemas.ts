import { z } from 'zod';



// Game schema
const GameSchema = z.object({
    id: z.string(),
    name: z.string(),
    coverImage: z.string().url(),
    rating: z.number().min(0).max(100),
    hoursPlayed: z.number().min(0),
    lastPlayed: z.string().optional().nullable(),
    price: z.number().optional(),
    originalPrice: z.number().optional(),
    discount: z.number().min(0).max(100).optional(),
    // Novos campos para landing page
    metaScore: z.number().min(0).max(100).optional().nullable(),
    openCriticScore: z.number().min(0).max(100).optional().nullable(),

    hltbMain: z.number().min(0).optional().nullable(),
    reasons: z.array(z.string()).optional(),
    // Campos para conquistas
    achievementsTotal: z.number().min(0).optional().nullable(),
    achievementsUnlocked: z.number().min(0).optional().nullable(),
    // Campos para descoberta
    store: z.string().optional(), // "IGDB" | "RAWG" | "Steam"
    storeUrl: z.string().optional(),
    criticRating: z.number().optional().nullable(),
    // Campos adicionais
    genres: z.array(z.string()).optional(),
    // Campos para recomendação
    score: z.number().min(0).max(1).optional(), // Score de 0 a 1
    position: z.number().min(1).optional(), // Posição na lista de recomendações
});

export type Game = z.infer<typeof GameSchema>;

// Preferences schema
const PreferencesSchema = z.object({
    genres: z.array(z.string()),
    playtime: z.object({
        min: z.number().min(0),
        max: z.number().min(0),
    }),
    rating: z.object({
        min: z.number().min(0).max(100),
        max: z.number().min(0).max(100),
    }),
});

export type Preferences = z.infer<typeof PreferencesSchema>;

// Feedback schema
export const FeedbackSchema = z.object({
    gameId: z.string(),
    rating: z.number().min(1).max(5),
    comment: z.string().optional(),
});

export type Feedback = z.infer<typeof FeedbackSchema>;


export const SavePreferencesSchema = z.object({
    preferences: PreferencesSchema,
});

export const RecommendResponseSchema = z.object({
    games: z.array(GameSchema),
    total: z.number(),
});
