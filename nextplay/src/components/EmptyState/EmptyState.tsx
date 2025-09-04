import { Box, Typography, Button, Paper } from '@mui/material';
import { Add, Refresh } from '@mui/icons-material';

interface EmptyStateProps {
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    showRefresh?: boolean;
    onRefresh?: () => void;
}

export const EmptyState = ({
    title,
    description,
    actionLabel,
    onAction,
    showRefresh = false,
    onRefresh,
}: EmptyStateProps) => {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh',
                p: 3,
            }}
        >
            <Paper
                sx={{
                    maxWidth: 500,
                    width: '100%',
                    p: 4,
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #2a475e 0%, #1b2838 100%)',
                    border: '2px solid #66c0f4',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                }}
            >
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 700,
                        color: '#ffffff',
                        mb: 2,
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    }}
                >
                    {title}
                </Typography>

                <Typography
                    variant="body1"
                    sx={{
                        color: '#c7d5e0',
                        fontSize: '1.1rem',
                        mb: 4,
                        lineHeight: 1.6,
                    }}
                >
                    {description}
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                    {actionLabel && onAction && (
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={onAction}
                            sx={{
                                backgroundColor: '#66c0f4',
                                color: '#1b2838',
                                fontWeight: 700,
                                fontSize: '1rem',
                                px: 3,
                                py: 1.5,
                                borderRadius: '8px',
                                textTransform: 'none',
                                '&:hover': {
                                    backgroundColor: '#8ed8ff',
                                },
                            }}
                        >
                            {actionLabel}
                        </Button>
                    )}

                    {showRefresh && onRefresh && (
                        <Button
                            variant="outlined"
                            startIcon={<Refresh />}
                            onClick={onRefresh}
                            sx={{
                                borderColor: '#66c0f4',
                                color: '#66c0f4',
                                fontWeight: 600,
                                fontSize: '1rem',
                                px: 3,
                                py: 1.5,
                                borderRadius: '8px',
                                textTransform: 'none',
                                '&:hover': {
                                    backgroundColor: '#66c0f4',
                                    color: '#1b2838',
                                },
                            }}
                        >
                            Tentar Novamente
                        </Button>
                    )}
                </Box>
            </Paper>
        </Box>
    );
};
