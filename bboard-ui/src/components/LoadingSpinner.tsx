import React from 'react';
import { Box, CircularProgress, Typography, Backdrop } from '@mui/material';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';

interface LoadingSpinnerProps {
  open: boolean;
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ open, message = 'Generating local zero-knowledge proof...' }) => {
  return (
    <Backdrop
      sx={{
        color: '#fff',
        zIndex: (theme) => theme.zIndex.drawer + 999,
        background: 'rgba(3, 3, 8, 0.85)',
        backdropFilter: 'blur(10px)',
      }}
      open={open}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, p: 4, textAlign: 'center' }}>
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          <CircularProgress size={80} thickness={3} sx={{ color: '#6366f1' }} />
          <Box
            sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldOutlinedIcon sx={{ color: '#a855f7', fontSize: '36px', animation: 'pulse 1.5s infinite ease-in-out' }} />
          </Box>
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, background: 'linear-gradient(90deg, #fff, #cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {message}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: '350px' }}>
            Midnight compiles and executes ZK circuits locally inside your browser to verify your keys and protect your notes. Please do not close this window.
          </Typography>
        </Box>
      </Box>
    </Backdrop>
  );
};
