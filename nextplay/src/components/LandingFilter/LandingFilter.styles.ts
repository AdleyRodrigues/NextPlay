import type { SxProps, Theme } from '@mui/material';

export const paperContainer: SxProps<Theme> = {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '24px',
    p: 4,
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
};

export const sectionTitle: SxProps<Theme> = {
    color: '#ffffff',
    mb: 2,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: 1
};

export const getPlatformChipStyle = (isSelected: boolean): SxProps<Theme> => ({
    px: 1,
    py: 2.5,
    borderRadius: '12px',
    fontSize: '0.95rem',
    fontWeight: 600,
    backgroundColor: isSelected
        ? 'rgba(102, 126, 234, 0.2)'
        : 'rgba(255, 255, 255, 0.05)',
    color: isSelected
        ? '#667eea'
        : '#a0aec0',
    border: `1px solid ${isSelected
        ? 'rgba(102, 126, 234, 0.5)'
        : 'transparent'}`,
    '&:hover': {
        backgroundColor: isSelected
            ? 'rgba(102, 126, 234, 0.3)'
            : 'rgba(255, 255, 255, 0.1)',
    },
    transition: 'background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1), color 0.2s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
});

export const getSkillChipStyle = (isSelected: boolean): SxProps<Theme> => ({
    px: 1,
    py: 2.5,
    borderRadius: '12px',
    fontSize: '0.95rem',
    fontWeight: 600,
    backgroundColor: isSelected
        ? 'rgba(255, 119, 198, 0.2)'
        : 'rgba(255, 255, 255, 0.05)',
    color: isSelected
        ? '#ff77c6'
        : '#a0aec0',
    border: `1px solid ${isSelected
        ? 'rgba(255, 119, 198, 0.5)'
        : 'transparent'}`,
    '&:hover': {
        backgroundColor: isSelected
            ? 'rgba(255, 119, 198, 0.3)'
            : 'rgba(255, 255, 255, 0.1)',
    },
    transition: 'background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1), color 0.2s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
});

export const benefitBox: SxProps<Theme> = {
    mt: 3,
    p: 2,
    borderRadius: '12px',
    background: 'linear-gradient(135deg, rgba(255, 119, 198, 0.1) 0%, rgba(102, 126, 234, 0.05) 100%)',
    border: '1px solid rgba(255, 119, 198, 0.2)',
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    animation: 'fadeIn 0.5s ease',
    '@keyframes fadeIn': {
        from: { opacity: 0, transform: 'translateY(-10px)' },
        to: { opacity: 1, transform: 'translateY(0)' }
    }
};

export const benefitIcon: SxProps<Theme> = {
    fontSize: '2.5rem', 
    lineHeight: 1
};

export const benefitTitle: SxProps<Theme> = {
    color: '#ff77c6',
    fontWeight: 800,
    mb: 0.5,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontSize: '0.75rem'
};

export const benefitText: SxProps<Theme> = {
    color: '#e2e8f0', 
    lineHeight: 1.5, 
    fontSize: '0.9rem'
};

export const divider: SxProps<Theme> = {
    borderColor: 'rgba(255, 255, 255, 0.1)'
};

export const getVibeChipStyle = (isSelected: boolean): SxProps<Theme> => ({
    px: 0.5,
    py: 2,
    borderRadius: '10px',
    fontSize: '0.85rem',
    fontWeight: 500,
    backgroundColor: isSelected
        ? 'rgba(72, 187, 120, 0.2)'
        : 'rgba(255, 255, 255, 0.05)',
    color: isSelected
        ? '#48bb78'
        : '#a0aec0',
    border: `1px solid ${isSelected
        ? 'rgba(72, 187, 120, 0.5)'
        : 'transparent'}`,
    '&:hover': {
        backgroundColor: isSelected
            ? 'rgba(72, 187, 120, 0.3)'
            : 'rgba(255, 255, 255, 0.1)',
    },
    transition: 'background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease',
});

export const yearSectionTitle: SxProps<Theme> = {
    color: '#ffffff',
    mb: 4,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: 1
};

export const sliderContainer: SxProps<Theme> = {
    px: 2
};

export const slider: SxProps<Theme> = {
    color: '#ed8936',
    '& .MuiSlider-thumb': {
        backgroundColor: '#ffffff',
        border: '2px solid currentColor',
        boxShadow: '0 0 10px rgba(237, 137, 54, 0.5)',
    },
    '& .MuiSlider-valueLabel': {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: '8px',
    }
};

export const yearLabelsContainer: SxProps<Theme> = {
    mt: 1
};

export const yearLabelText: SxProps<Theme> = {
    color: '#a0aec0'
};

export const multiplayerSection: SxProps<Theme> = {
    flex: 1
};

export const durationSection: SxProps<Theme> = {
    flex: 1
};

export const getTimeChipStyle = (isSelected: boolean): SxProps<Theme> => ({
    backgroundColor: isSelected
        ? 'rgba(159, 122, 234, 0.2)'
        : 'rgba(255, 255, 255, 0.05)',
    color: isSelected
        ? '#9f7aea'
        : '#a0aec0',
    border: `1px solid ${isSelected
        ? 'rgba(159, 122, 234, 0.5)'
        : 'transparent'}`,
});
