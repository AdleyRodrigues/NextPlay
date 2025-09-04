import { createContext, useContext, useState, type ReactNode } from 'react';

interface SteamContextType {
    steamId64: string | null;
    setSteamId64: (id: string | null) => void;
    isAuthenticated: boolean;
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

    const isAuthenticated = !!steamId64;

    const handleSetSteamId64 = (id: string | null) => {
        setSteamId64(id);
        if (id) {
            localStorage.setItem('steam_id_64', id);
        } else {
            localStorage.removeItem('steam_id_64');
        }
    };

    return (
        <SteamContext.Provider
            value={{
                steamId64,
                setSteamId64: handleSetSteamId64,
                isAuthenticated,
            }}
        >
            {children}
        </SteamContext.Provider>
    );
};
