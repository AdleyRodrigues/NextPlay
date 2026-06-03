import type { SxProps, Theme } from '@mui/material';

export const pageContainer: SxProps<Theme> = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f1419 0%, #1a1f2e 50%, #2d3748 100%)',
    position: 'relative',
    overflow: 'hidden',
};

export const backgroundPattern: SxProps<Theme> = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `
        radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.1) 0%, transparent 50%)
    `,
    zIndex: 0,
};

export const contentContainer: SxProps<Theme> = {
    position: 'relative',
    zIndex: 1,
    py: 4
};

export const heroSection: SxProps<Theme> = {
    textAlign: 'center',
    mb: 6
};

export const heroTitle: SxProps<Theme> = {
    fontWeight: 800,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    mb: 2,
    fontSize: { xs: '2.5rem', md: '3.5rem' },
    lineHeight: 1.2,
};

export const heroSubtitle: SxProps<Theme> = {
    color: '#a0aec0',
    mb: 4,
    fontSize: { xs: '1.1rem', md: '1.3rem' },
    maxWidth: '600px',
    mx: 'auto',
    lineHeight: 1.6,
};

export const filtersCard: SxProps<Theme> = {
    mb: 4,
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '20px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
};

export const filtersCardContent: SxProps<Theme> = {
    p: 4
};

export const selectedFiltersContainer: SxProps<Theme> = {
    mt: 3,
    pt: 3,
    borderTop: '1px solid rgba(255, 255, 255, 0.1)'
};

export const selectedFiltersTitle: SxProps<Theme> = {
    color: '#ffffff',
    mb: 2,
    fontWeight: 600
};

export const platformChip: SxProps<Theme> = {
    backgroundColor: 'rgba(102, 126, 234, 0.2)',
    color: '#ffffff',
    border: '1px solid rgba(102, 126, 234, 0.3)',
};

export const skillChip: SxProps<Theme> = {
    backgroundColor: 'rgba(255, 119, 198, 0.2)',
    color: '#ffffff',
    border: '1px solid rgba(255, 119, 198, 0.3)',
};

export const timeChip: SxProps<Theme> = {
    backgroundColor: 'rgba(118, 75, 162, 0.2)',
    color: '#ffffff',
    border: '1px solid rgba(118, 75, 162, 0.3)',
};

export const yearChip: SxProps<Theme> = {
    backgroundColor: 'rgba(237, 137, 54, 0.2)',
    color: '#ffffff',
    border: '1px solid rgba(237, 137, 54, 0.3)',
};

export const multiplayerChip: SxProps<Theme> = {
    backgroundColor: 'rgba(66, 153, 225, 0.2)',
    color: '#ffffff',
    border: '1px solid rgba(66, 153, 225, 0.3)',
};

export const vibeChip: SxProps<Theme> = {
    backgroundColor: 'rgba(72, 187, 120, 0.2)',
    color: '#ffffff',
    border: '1px solid rgba(72, 187, 120, 0.3)',
};

export const generateButtonContainer: SxProps<Theme> = {
    textAlign: 'center',
    mb: 4
};

export const generateButton: SxProps<Theme> = {
    px: 6,
    py: 3,
    borderRadius: '16px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#ffffff',
    fontWeight: 800,
    fontSize: '1.3rem',
    textTransform: 'none',
    boxShadow: '0 12px 30px rgba(102, 126, 234, 0.4)',
    '&:hover': {
        background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
        transform: 'translateY(-3px)',
        boxShadow: '0 16px 35px rgba(102, 126, 234, 0.5)',
    },
    '&:disabled': {
        background: 'rgba(255, 255, 255, 0.1)',
        color: 'rgba(255, 255, 255, 0.5)',
        transform: 'none',
        boxShadow: 'none',
    },
    transition: 'background 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease',
};

export const recommendationsTitle: SxProps<Theme> = {
    color: '#ffffff',
    fontWeight: 700,
    mb: 3,
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
};

export const errorAlert: SxProps<Theme> = {
    background: 'rgba(239, 68, 68, 0.9)',
    color: '#ffffff',
    borderRadius: '12px',
    '& .MuiAlert-icon': { color: '#ffffff' },
};
