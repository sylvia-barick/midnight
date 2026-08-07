import React from 'react';
import { Paper, Typography, Box, Button, CircularProgress } from '@mui/material';
import WalletIcon from '@mui/icons-material/AccountBalanceWallet';
import WifiTetheringIcon from '@mui/icons-material/WifiTethering';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useWallet } from '../hooks/useWallet';
import { useNetwork } from '../hooks/useNetwork';

export const WalletCard: React.FC = () => {
  const { walletAddress, connectionStatus, walletError, connectWallet, disconnectWallet, network } = useWallet();
  const { isWrongNetwork, requiredNetwork, reconnect } = useNetwork();

  const getStatusColor = () => {
    if (isWrongNetwork) return '#ef4444';
    if (connectionStatus === 'connected') return '#10b981';
    if (connectionStatus === 'connecting') return '#f59e0b';
    return '#6b7280';
  };

  const getStatusText = () => {
    if (isWrongNetwork) return 'Wrong Network';
    if (connectionStatus === 'connected') return 'Connected';
    if (connectionStatus === 'connecting') return 'Connecting...';
    return 'Disconnected';
  };

  return (
    <Paper sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <WalletIcon sx={{ color: '#6366f1', fontSize: '28px' }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Midnight Wallet
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255,255,255,0.06)', px: 1.5, py: 0.5, borderRadius: '20px' }}>
          <Box sx={{ width: '8px', height: '8px', borderRadius: '50%', background: getStatusColor(), boxShadow: `0 0 8px ${getStatusColor()}` }} />
          <Typography variant="caption" sx={{ fontWeight: 'bold', color: getStatusColor() }}>
            {getStatusText()}
          </Typography>
        </Box>
      </Box>

      {/* Connection info */}
      {connectionStatus === 'connected' && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              Shielded Coin Public Key (Address)
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all', background: 'rgba(0,0,0,0.2)', p: 1.5, borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              {walletAddress}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WifiTetheringIcon sx={{ color: '#a855f7', fontSize: '18px' }} />
            <Typography variant="body2">
              Network: <span style={{ fontWeight: 'bold', color: '#a855f7' }}>{network}</span>
            </Typography>
          </Box>

          {isWrongNetwork && (
            <Paper sx={{ p: 2, background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '12px', display: 'flex', gap: 1.5 }}>
              <ErrorIcon sx={{ color: '#ef4444' }} />
              <Box>
                <Typography variant="subtitle2" sx={{ color: '#ef4444', fontWeight: 'bold' }}>
                  Network Mismatch Detected
                </Typography>
                 <Typography variant="caption" color="text.secondary">
                  Your wallet is connected to {network}, but this app requires <span style={{ fontWeight: 'bold' }}>{requiredNetwork}</span>. Please switch in your 1AM wallet.
                </Typography>
                <Button size="small" variant="outlined" color="error" onClick={() => reconnect()} sx={{ mt: 1 }}>
                  Reconnect Wallet
                </Button>
              </Box>
            </Paper>
          )}
        </Box>
      )}

      {walletError && (
        <Typography variant="body2" color="error" sx={{ background: 'rgba(239, 68, 68, 0.05)', p: 1.5, borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)' }}>
          {walletError}
        </Typography>
      )}

      {/* Action Buttons */}
      <Box sx={{ mt: 'auto', pt: 2 }}>
        {connectionStatus === 'connected' ? (
          <Button variant="outlined" color="secondary" fullWidth onClick={disconnectWallet}>
            Disconnect Wallet
          </Button>
        ) : (
          <Button variant="contained" color="primary" fullWidth onClick={connectWallet} disabled={connectionStatus === 'connecting'}>
            {connectionStatus === 'connecting' ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={18} color="inherit" />
                <span>Connecting Wallet...</span>
              </Box>
            ) : (
              'Connect 1AM Wallet'
            )}
          </Button>
        )}
      </Box>
    </Paper>
  );
};
