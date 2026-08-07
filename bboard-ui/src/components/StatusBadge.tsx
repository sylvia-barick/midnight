import React from 'react';
import { Box, Typography } from '@mui/material';

interface StatusBadgeProps {
  status: 'connected' | 'disconnected' | 'error' | 'warning' | 'info';
  label: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const getColor = () => {
    switch (status) {
      case 'connected': return '#10b981'; // Green
      case 'disconnected': return '#6b7280'; // Grey
      case 'error': return '#ef4444'; // Red
      case 'warning': return '#f59e0b'; // Amber
      case 'info': return '#06b6d4'; // Cyan
      default: return '#cbd5e1';
    }
  };

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        background: 'rgba(255, 255, 255, 0.02)',
        border: `1px solid rgba(255, 255, 255, 0.06)`,
        borderRadius: '20px',
        px: 1.5,
        py: 0.5,
      }}
    >
      <Box sx={{ width: '8px', height: '8px', borderRadius: '50%', background: getColor(), boxShadow: `0 0 8px ${getColor()}` }} />
      <Typography variant="caption" sx={{ fontWeight: 'bold', color: getColor(), letterSpacing: '0.5px' }}>
        {label}
      </Typography>
    </Box>
  );
};
