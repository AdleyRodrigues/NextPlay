import { Box } from '@mui/material';
import { Header } from './components/Header/Header';
import { AppRoutes } from './routes/AppRoutes';
import { useSteam } from './hooks/useSteam';

export const App = () => {
  const { isAuthenticated } = useSteam();

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {isAuthenticated && <Header />}
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #1b2838 0%, #2a475e 100%)',
          marginTop: isAuthenticated ? '64px' : '0px', // Altura do header
        }}
      >
        <AppRoutes />
      </Box>
    </Box>
  );
};
