import React from 'react';
import { Box, Button, Typography, CircularProgress, Alert } from '@mui/material';
import WalletIcon from '@mui/icons-material/AccountBalanceWallet';
import WifiIcon from '@mui/icons-material/Wifi';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import ShieldIcon from '@mui/icons-material/Shield';
import ErrorIcon from '@mui/icons-material/Error';
import { useMidnight } from '../hooks/useMidnight';

export const WalletConnect: React.FC = () => {
  const {
    walletAddress,
    network,
    connectionStatus,
    walletError,
    connectWallet,
    disconnectWallet,
  } = useMidnight();

  const isConnecting = connectionStatus === 'connecting';
  const isConnected = connectionStatus === 'connected';

  // Helper to format shielded address
  const formatAddress = (addr: string | null) => {
    if (!addr) return '';
    return `${addr.substring(0, 10)}...${addr.substring(addr.length - 8)}`;
  };

  return (
    <Box
      sx={{
        background: 'rgba(10, 10, 20, 0.6)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        borderRadius: '16px',
        padding: '24px',
        width: '100%',
        maxWidth: '480px',
        boxShadow: isConnected
          ? '0 0 20px rgba(99, 102, 241, 0.15), inset 0 0 10px rgba(99, 102, 241, 0.05)'
          : '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        transition: 'all 0.3s ease-in-out',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, #6366f1, #a855f7, #06b6d4)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <WalletIcon sx={{ color: isConnected ? '#06b6d4' : '#6366f1', fontSize: '28px' }} />
          <Typography variant="h6" color="#fff" sx={{ fontWeight: 'bold', letterSpacing: '0.5px' }}>
            Lace Wallet
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            background: isConnected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            padding: '4px 12px',
            borderRadius: '20px',
            border: isConnected ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
          }}
        >
          <Box
            sx={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isConnected ? '#10b981' : '#ef4444',
              boxShadow: isConnected ? '0 0 8px #10b981' : '0 0 8px #ef4444',
            }}
          />
          <Typography
            variant="caption"
            color={isConnected ? '#10b981' : '#ef4444'}
            sx={{ fontWeight: '600', textTransform: 'uppercase' }}
          >
            {connectionStatus}
          </Typography>
        </Box>
      </Box>

      {walletError && (
        <Alert
          severity="error"
          icon={<ErrorIcon sx={{ color: '#ef4444' }} />}
          sx={{
            background: 'rgba(239, 68, 68, 0.05)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#fca5a5',
            borderRadius: '8px',
            mb: 2,
            alignItems: 'center',
          }}
        >
          {walletError}
        </Alert>
      )}

      {isConnected ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box
            sx={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              padding: '12px 16px',
            }}
          >
            <Typography variant="caption" color="rgba(255, 255, 255, 0.4)" sx={{ display: 'block', mb: 0.5 }}>
              Shielded Coin Key
            </Typography>
            <Typography variant="body2" color="#e2e8f0" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
              {formatAddress(walletAddress)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box
              sx={{
                flex: 1,
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <WifiIcon sx={{ color: '#a855f7', fontSize: '20px' }} />
              <Box>
                <Typography variant="caption" color="rgba(255, 255, 255, 0.4)" sx={{ display: 'block' }}>
                  Network
                </Typography>
                <Typography variant="body2" color="#fff" sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
                  {network || 'Unknown'}
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                flex: 1,
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <ShieldIcon sx={{ color: '#06b6d4', fontSize: '20px' }} />
              <Box>
                <Typography variant="caption" color="rgba(255, 255, 255, 0.4)" sx={{ display: 'block' }}>
                  Privacy Level
                </Typography>
                <Typography variant="body2" color="#06b6d4" sx={{ fontWeight: 'bold' }}>
                  Zero Knowledge
                </Typography>
              </Box>
            </Box>
          </Box>

          <Button
            variant="outlined"
            onClick={disconnectWallet}
            startIcon={<PowerSettingsNewIcon />}
            sx={{
              borderColor: 'rgba(239, 68, 68, 0.4)',
              color: '#f87171',
              borderRadius: '8px',
              padding: '10px',
              textTransform: 'none',
              fontWeight: '600',
              transition: 'all 0.2s',
              '&:hover': {
                background: 'rgba(239, 68, 68, 0.08)',
                borderColor: '#ef4444',
                boxShadow: '0 0 12px rgba(239, 68, 68, 0.2)',
              },
            }}
          >
            Disconnect Wallet
          </Button>
        </Box>
      ) : (
        <Box>
          <Typography variant="body2" color="rgba(255, 255, 255, 0.6)" sx={{ mb: 3, lineHeight: 1.6 }}>
            Connect your Lace wallet to securely interact with the Midnight Bulletin Board contract. Proof generation is handled locally on your machine, protecting your private data.
          </Typography>
          <Button
            variant="contained"
            onClick={connectWallet}
            disabled={isConnecting}
            fullWidth
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              color: '#fff',
              borderRadius: '8px',
              padding: '12px',
              textTransform: 'none',
              fontWeight: 'bold',
              fontSize: '16px',
              boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.4)',
              transition: 'all 0.2s',
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)',
                boxShadow: '0 6px 20px 0 rgba(99, 102, 241, 0.6)',
                transform: 'translateY(-1px)',
              },
              '&:disabled': {
                background: 'rgba(255, 255, 255, 0.08)',
                color: 'rgba(255, 255, 255, 0.3)',
              },
            }}
          >
            {isConnecting ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CircularProgress size={20} sx={{ color: 'rgba(255, 255, 255, 0.6)' }} />
                <span>Connecting to Lace...</span>
              </Box>
            ) : (
              'Connect Lace Wallet'
            )}
          </Button>
        </Box>
      )}
    </Box>
  );
};
