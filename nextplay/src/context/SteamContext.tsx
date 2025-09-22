import { createContext, useContext, useState, type ReactNode } from 'react';

interface SteamPlayerInfo {
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

interface SteamContextType {
    steamId64: string | null;
    setSteamId64: (id: string | null) => void;
    isAuthenticated: boolean;
    playerInfo: SteamPlayerInfo | null;
    setPlayerInfo: (info: SteamPlayerInfo | null) => void;
}

const SteamContext = createContext<SteamContextType | undefined>(undefined);

export const useSteam = () => {
    const context = useContext(SteamContext);
    if (!context) {
        throw new Error('useSteam must be used within a SteamProvider');
    }
    return context;
};

interface SteamProviderProps {
    children: ReactNode;
}

export const SteamProvider = ({ children }: SteamProviderProps) => {
    const [steamId64, setSteamId64] = useState<string | null>(() => {
        // Tentar recuperar do localStorage
        return localStorage.getItem('steam_id_64');
    });

    const [playerInfo, setPlayerInfo] = useState<SteamPlayerInfo | null>(() => {
        // Tentar recuperar informações do perfil do localStorage
        const saved = localStorage.getItem('steam_player_info');
        return saved ? JSON.parse(saved) : null;
    });

    const isAuthenticated = !!steamId64;

    const handleSetSteamId64 = (id: string | null) => {
        setSteamId64(id);
        if (id) {
            localStorage.setItem('steam_id_64', id);
        } else {
            localStorage.removeItem('steam_id_64');
            setPlayerInfo(null);
            localStorage.removeItem('steam_player_info');
        }
    };

    const handleSetPlayerInfo = (info: SteamPlayerInfo | null) => {
        setPlayerInfo(info);
        if (info) {
            localStorage.setItem('steam_player_info', JSON.stringify(info));
        } else {
            localStorage.removeItem('steam_player_info');
        }
    };

    return (
        <SteamContext.Provider
            value={{
                steamId64,
                setSteamId64: handleSetSteamId64,
                isAuthenticated,
                playerInfo,
                setPlayerInfo: handleSetPlayerInfo,
            }}
        >
            {children}
        </SteamContext.Provider>
    );
};
