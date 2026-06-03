import type { SxProps, Theme } from '@mui/material';

export const card: SxProps<Theme> = {
    position: 'relative',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '20px',
    overflow: 'hidden',
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    '&:hover': {
        transform: 'translateY(-8px) scale(1.02)',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4)',
        borderColor: 'rgba(102, 126, 234, 0.3)',
    },
};

export const positionBadge: SxProps<Theme> = {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 2,
};

export const positionChip: SxProps<Theme> = {
    background: 'rgba(102, 126, 234, 0.9)',
    color: '#ffffff',
    fontWeight: 700,
    fontSize: '0.75rem',
};

export const imageContainer: SxProps<Theme> = {
    position: 'relative',
    overflow: 'hidden'
};

export const imageWrapper: SxProps<Theme> = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
    background: 'rgba(0, 0, 0, 0.1)',
};

export const media: SxProps<Theme> = {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    padding: '8px',
    transition: 'transform 0.3s ease-in-out',
    '&:hover': {
        transform: 'scale(1.05)',
    },
};

export const hoverOverlay: SxProps<Theme> = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
};

export const searchButton: SxProps<Theme> = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#ffffff',
    fontWeight: 700,
    px: 3,
    py: 1.5,
    borderRadius: '12px',
    textTransform: 'none',
    fontSize: '1rem',
    boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)',
    '&:hover': {
        background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
        transform: 'translateY(-2px)',
        boxShadow: '0 12px 25px rgba(102, 126, 234, 0.5)',
    },
    transition: 'background 0.2s ease-in-out, transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
};

export const cardContent: SxProps<Theme> = {
    p: 3,
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
};

export const stackContainer: SxProps<Theme> = {
    flex: 1
};

export const gameTitle: SxProps<Theme> = {
    color: '#ffffff',
    fontWeight: 700,
    fontSize: '1.1rem',
    lineHeight: 1.3,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    height: '2.6em',
};

export const getMetaScoreChip = (color: string): SxProps<Theme> => ({
    backgroundColor: color,
    color: '#ffffff',
    fontWeight: 600,
    fontSize: '0.75rem',
    height: 24,
});

export const reasonsContainer: SxProps<Theme> = {
    minHeight: '80px'
};

export const reasonsTitle: SxProps<Theme> = {
    color: '#a0aec0',
    fontSize: '0.75rem',
    fontWeight: 600,
    mb: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
};

export const reasonChip: SxProps<Theme> = {
    backgroundColor: 'rgba(102, 126, 234, 0.2)',
    color: '#a0aec0',
    border: '1px solid rgba(102, 126, 234, 0.3)',
    fontWeight: 500,
    fontSize: '0.7rem',
    height: 20,
    mb: 0.5,
    '& .MuiChip-label': {
        px: 1,
    },
};

export const actionButton: SxProps<Theme> = {
    borderColor: 'rgba(102, 126, 234, 0.3)',
    color: '#667eea',
    fontWeight: 600,
    py: 1.5,
    borderRadius: '12px',
    textTransform: 'none',
    fontSize: '0.9rem',
    mt: 2,
    '&:hover': {
        borderColor: '#667eea',
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        color: '#ffffff',
        transform: 'translateY(-1px)',
    },
    transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out, border-color 0.2s ease-in-out, transform 0.2s ease-in-out',
};
