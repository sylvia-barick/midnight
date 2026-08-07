import React from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';

interface ToastProps {
  open: boolean;
  message: string;
  severity: AlertColor;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ open, message, severity, onClose }) => {
  return (
    <Snackbar open={open} autoHideDuration={6000} onClose={onClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{
          borderRadius: '12px',
          fontWeight: 600,
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${
            severity === 'success'
              ? 'rgba(16, 185, 129, 0.25)'
              : severity === 'error'
              ? 'rgba(239, 68, 68, 0.25)'
              : 'rgba(255, 255, 255, 0.1)'
          }`,
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};
