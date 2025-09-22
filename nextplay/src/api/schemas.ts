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
    lastPlayed: z.string().optional().nullable(),
    price: z.number().optional(),
    originalPrice: z.number().optional(),
    discount: z.number().min(0).max(100).optional(),
    // Novos campos para landing page
    metaScore: z.number().min(0).max(100).optional().nullable(),
    openCriticScore: z.number().min(0).max(100).optional().nullable(),
    steamScore: z.number().min(0).max(100).optional().nullable(),
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

// Steam Player Info schema
export const SteamPlayerInfoSchema = z.object({
    personaName: z.string(),
    realName: z.string().optional(),
    avatar: z.string(),
    avatarFull: z.string(),
    profileUrl: z.string(),
    isOnline: z.boolean(),
    isAway: z.boolean(),
    isBusy: z.boolean(),
    lastLogoff: z.string().optional(),
    countryCode: z.string().optional(),
    stateCode: z.string().optional(),
    createdDate: z.string().optional(),
});

// SteamPlayerInfo type is imported from context

// API Response schemas
export const RefreshResponseSchema = z.object({
    steamId: z.string(),
    games: z.array(GameSchema),
    message: z.string().optional(),
    gamesFound: z.number().optional(),
    lastRefresh: z.string().optional(),
    playerInfo: SteamPlayerInfoSchema.optional().nullable(),
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
