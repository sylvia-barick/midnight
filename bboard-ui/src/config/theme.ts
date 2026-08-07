import { createTheme, alpha } from '@mui/material';

export const theme = createTheme({
  typography: {
    fontFamily: '"Outfit", "Space Grotesk", "Inter", "Helvetica", sans-serif',
    h1: { fontWeight: 900 },
    h2: { fontWeight: 900 },
    h3: { fontWeight: 800 },
    h4: { fontWeight: 800 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    body1: { fontWeight: 400 },
    allVariants: {
      color: '#ffffff',
    },
  },
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1', // Indigo
      light: '#818cf8',
      dark: '#4f46e5',
    },
    secondary: {
      main: '#a855f7', // Purple
      light: '#c084fc',
      dark: '#9333ea',
    },
    info: {
      main: '#06b6d4', // Cyan
    },
    background: {
      default: '#030308',
      paper: 'rgba(255, 255, 255, 0.03)',
    },
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#030308',
          backgroundAttachment: 'fixed',
          minHeight: '100vh',
          color: '#ffffff',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          backgroundImage: 'none',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.07)',
          borderRadius: '16px',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 24px',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
          border: 'none',
          '&:hover': {
            background: 'linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            '& fieldset': {
              border: 'none',
            },
            '&:hover fieldset': {
              border: 'none',
            },
            '&.Mui-focused fieldset': {
              border: 'none',
            },
            '&.Mui-focused': {
              border: '1px solid #6366f1',
              boxShadow: '0 0 10px rgba(99, 102, 241, 0.2)',
            },
          },
        },
      },
    },
  },
});
