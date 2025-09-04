import { z } from 'zod';

// Steam ID validation
export const SteamIdSchema = z.string().regex(/^[0-9]{17}$/, 'Steam ID deve ter 17 dígitos');

// Game schema
export const GameSchema = z.object({
    id: z.string(),
    name: z.string(),
    coverImage: z.string().url(),
    rating: z.number().min(0).max(100),
    hoursPlayed: z.number().min(0),
    lastPlayed: z.string().optional(),
    price: z.number().optional(),
    originalPrice: z.number().optional(),
    discount: z.number().min(0).max(100).optional(),
    // Novos campos para landing page
    metaScore: z.number().min(0).max(100).optional().nullable(),
    openCriticScore: z.number().min(0).max(100).optional().nullable(),
    steamScore: z.number().min(0).max(100).optional().nullable(),
    hltbMain: z.number().min(0).optional().nullable(),
    reasons: z.array(z.string()).optional(),
    // Campos para descoberta
    store: z.string().optional(), // "IGDB" | "RAWG" | "Steam"
    storeUrl: z.string().optional(),
    criticRating: z.number().optional().nullable(),
});

export type Game = z.infer<typeof GameSchema>;

// Preferences schema
export const PreferencesSchema = z.object({
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

// API Response schemas
export const RefreshResponseSchema = z.object({
    steamId: z.string(),
    games: z.array(GameSchema),
});

export const SavePreferencesSchema = z.object({
    preferences: PreferencesSchema,
});

export const RecommendResponseSchema = z.object({
    games: z.array(GameSchema),
    total: z.number(),
});

export const FeedbackResponseSchema = z.object({
    gameId: z.string(),
    rating: z.number(),
    comment: z.string().optional(),
});
