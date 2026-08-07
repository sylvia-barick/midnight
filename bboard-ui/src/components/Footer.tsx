import React from 'react';
import { Box, Container, Typography, Link } from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';

export const Footer: React.FC = () => {
  return (
    <Box
      sx={{
        background: 'rgba(3, 3, 8, 0.5)',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        padding: '30px 0',
        mt: 'auto',
        backdropFilter: 'blur(10px)',
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShieldIcon sx={{ color: '#6366f1', fontSize: '18px' }} />
            <Typography variant="body2" color="rgba(255, 255, 255, 0.5)">
              © {new Date().getFullYear()} Secret Notes. Powered by Midnight Network ZK privacy.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link href="https://midnight.network" target="_blank" rel="noopener" color="rgba(255, 255, 255, 0.5)" sx={{ textDecoration: 'none', '&:hover': { color: '#6366f1' } }}>
              Official Website
            </Link>
            <Link href="https://docs.midnight.network" target="_blank" rel="noopener" color="rgba(255, 255, 255, 0.5)" sx={{ textDecoration: 'none', '&:hover': { color: '#6366f1' } }}>
              Developer Docs
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};
