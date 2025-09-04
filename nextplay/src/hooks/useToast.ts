import { useState, useCallback } from 'react';

interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
}

interface UseToastReturn {
    toasts: Toast[];
    showToast: (message: string, type?: Toast['type'], duration?: number) => void;
    hideToast: (id: string) => void;
    clearToasts: () => void;
}

export const useToast = (): UseToastReturn => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((
        message: string,
        type: Toast['type'] = 'info',
        duration: number = 5000
    ) => {
        const id = Date.now().toString();
        const newToast: Toast = { id, message, type, duration };

        setToasts(prev => [...prev, newToast]);

        // Auto-remove toast after duration
        if (duration > 0) {
            setTimeout(() => {
                hideToast(id);
            }, duration);
        }
    }, []);

    const hideToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const clearToasts = useCallback(() => {
        setToasts([]);
    }, []);

    return {
        toasts,
        showToast,
        hideToast,
        clearToasts,
    };
};


