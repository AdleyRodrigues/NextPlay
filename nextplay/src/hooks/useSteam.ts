import { useContext } from 'react';
import { SteamContext } from '../context/SteamContext.types';

export const useSteam = () => {
    const context = useContext(SteamContext);
    if (!context) {
        throw new Error('useSteam must be used within a SteamProvider');
    }
    return context;
};
