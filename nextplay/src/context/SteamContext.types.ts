import { createContext } from 'react';

export interface SteamPlayerInfo {
    personaName: string;
    realName?: string;
    avatar: string;
    avatarFull: string;
    profileUrl: string;
    isOnline: boolean;
    isAway: boolean;
    isBusy: boolean;
    lastLogoff?: string;
    countryCode?: string;
    stateCode?: string;
    createdDate?: string;
    steamId64?: string;
}

export interface SteamContextType {
    steamId64: string | null;
    setSteamId64: (id: string | null) => void;
    isAuthenticated: boolean;
    playerInfo: SteamPlayerInfo | null;
    setPlayerInfo: (info: SteamPlayerInfo | null) => void;
}

export const SteamContext = createContext<SteamContextType | undefined>(undefined);
