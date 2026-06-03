import { Box, CssBaseline } from '@mui/material';
import { Header } from './components/Header/Header';
import { AppRoutes } from './routes/AppRoutes';

export const App = () => {
  return (
    <Box sx={{ minHeight: '100vh' }}>
      <CssBaseline />
      <Header />
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #1b2838 0%, #2a475e 100%)',
          marginTop: '64px', // Altura do header
        }}
      >
        <AppRoutes />
      </Box>
    </Box>
  );
};
