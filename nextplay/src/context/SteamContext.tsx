import { useState, type ReactNode } from 'react';
import { SteamContext, type SteamPlayerInfo } from './SteamContext.types';

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
