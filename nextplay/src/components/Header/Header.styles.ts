import type { SxProps, Theme } from '@mui/material';

export const appBar: SxProps<Theme> = {
    background: 'rgba(15, 20, 25, 0.95)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    zIndex: 1300,
};

export const toolbar: SxProps<Theme> = {
    px: { xs: 2, md: 4 }
};

export const logoContainer: SxProps<Theme> = {
    display: 'flex', 
    alignItems: 'center', 
    gap: 2, 
    flex: 1
};

export const logoWrapper: SxProps<Theme> = {
    display: 'flex',
    alignItems: 'center',
    gap: 1.5,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
};

export const logoIcon: SxProps<Theme> = {
    fontSize: '2rem', 
    color: '#667eea'
};

export const logoText: SxProps<Theme> = {
    fontWeight: 800,
    fontSize: { xs: '1.3rem', md: '1.5rem' },
    letterSpacing: '-0.02em',
};
