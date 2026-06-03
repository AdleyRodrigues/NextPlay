import type { SxProps, Theme } from '@mui/material';

export const dialogPaper: SxProps<Theme> = {
    background: 'linear-gradient(135deg, #0f1419 0%, #1a1f2e 50%, #2d3748 100%)',
    color: '#ffffff',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
    overflow: 'hidden',
};

export const dialogBackdrop: SxProps<Theme> = {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
};

export const dialogTitle: SxProps<Theme> = {
    p: 0,
    position: 'relative',
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
};

export const titleBox: SxProps<Theme> = {
    p: 4, 
    pb: 2
};

export const titleText: SxProps<Theme> = {
    fontWeight: 800,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    mb: 1,
    fontSize: { xs: '1.8rem', md: '2.5rem' },
    lineHeight: 1.2,
    textAlign: { xs: 'center', md: 'left' },
};

export const closeButton: SxProps<Theme> = {
    color: '#a0aec0',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        color: '#ffffff',
        transform: 'scale(1.05)',
    },
    transition: 'all 0.2s ease-in-out',
};

export const dialogContent: SxProps<Theme> = {
    p: 0
};

export const mainInfoBox: SxProps<Theme> = {
    p: 4, 
    pb: 2
};

export const imagePaper: SxProps<Theme> = {
    position: 'relative',
    borderRadius: '16px',
    overflow: 'hidden',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    '&:hover': {
        transform: 'scale(1.02)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
    },
    transition: 'all 0.3s ease-in-out',
};

export const image: SxProps<Theme> = {
    width: '100%',
    height: { xs: 200, md: 300 },
    objectFit: 'cover',
    display: 'block',
};

export const imageOverlay: SxProps<Theme> = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    transition: 'opacity 0.3s ease-in-out',
    '&:hover': {
        opacity: 1,
    },
};

export const searchButton: SxProps<Theme> = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#ffffff',
    fontWeight: 700,
    px: 4,
    py: 2,
    borderRadius: '12px',
    textTransform: 'none',
    fontSize: '1.1rem',
    boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)',
    '&:hover': {
        background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
        transform: 'translateY(-2px)',
        boxShadow: '0 12px 25px rgba(102, 126, 234, 0.5)',
    },
    transition: 'all 0.2s ease-in-out',
};

export const getScoreChip = (color: string): SxProps<Theme> => ({
    backgroundColor: color,
    color: '#ffffff',
    fontWeight: 700,
    fontSize: '0.9rem',
    px: 2,
    py: 1,
});

export const sectionTitle: SxProps<Theme> = {
    color: '#ffffff', 
    mb: 2, 
    fontWeight: 600,
    textAlign: { xs: 'center', md: 'left' },
    display: 'flex',
    justifyContent: { xs: 'center', md: 'flex-start' },
    alignItems: 'center',
};

export const accessTimeIcon: SxProps<Theme> = {
    color: '#667eea', 
    fontSize: '1.5rem'
};

export const durationText: SxProps<Theme> = {
    color: '#ffffff', 
    fontWeight: 600
};

export const durationSubtitle: SxProps<Theme> = {
    color: '#a0aec0', 
    fontSize: '0.8rem'
};

export const genreChip: SxProps<Theme> = {
    backgroundColor: 'rgba(102, 126, 234, 0.2)',
    color: '#667eea',
    border: '1px solid rgba(102, 126, 234, 0.3)',
    fontWeight: 500,
};

export const reasonsSection: SxProps<Theme> = {
    px: 4, 
    pb: 2
};

export const reasonsCard: SxProps<Theme> = {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '20px',
};

export const reasonsCardContent: SxProps<Theme> = {
    p: 4
};

export const reasonsTitle: SxProps<Theme> = {
    color: '#ffffff', 
    fontWeight: 700, 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: { xs: 'center', md: 'flex-start' },
    gap: 2
};

export const reasonsLightbulb: SxProps<Theme> = {
    fontSize: '1.8rem', 
    color: '#ed8936'
};

export const reasonItemChip: SxProps<Theme> = {
    backgroundColor: 'rgba(102, 126, 234, 0.2)',
    color: '#667eea',
    border: '1px solid rgba(102, 126, 234, 0.3)',
    fontWeight: 500,
    px: 2,
    py: 1,
    '&:hover': {
        backgroundColor: 'rgba(102, 126, 234, 0.3)',
        transform: 'translateY(-1px)',
    },
    transition: 'all 0.2s ease-in-out',
};

export const dialogActions: SxProps<Theme> = {
    p: 4,
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
};

export const closeFooterButton: SxProps<Theme> = {
    borderColor: 'rgba(255, 255, 255, 0.3)',
    color: '#a0aec0',
    px: 4,
    py: 2,
    borderRadius: '12px',
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '1rem',
    '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderColor: '#ffffff',
        color: '#ffffff',
    },
    transition: 'all 0.2s ease-in-out',
};

export const searchFooterButton: SxProps<Theme> = {
    flex: 1,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#ffffff',
    fontWeight: 700,
    px: 4,
    py: 2,
    borderRadius: '12px',
    textTransform: 'none',
    fontSize: '1rem',
    boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)',
    '&:hover': {
        background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
        transform: 'translateY(-2px)',
        boxShadow: '0 12px 25px rgba(102, 126, 234, 0.5)',
    },
    transition: 'all 0.2s ease-in-out',
};
