import React from 'react';
import { Box, Typography, Paper, Button, Divider } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ShieldIcon from '@mui/icons-material/Shield';
import ErrorIcon from '@mui/icons-material/Error';
import { Link } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { useContract } from '../hooks/useContract';
import { useNotes } from '../hooks/useNotes';
import { DeploymentCard } from '../components/DeploymentCard';
import { StatusBadge } from '../components/StatusBadge';

export const Dashboard: React.FC = () => {
  const { isConnected, walletAddress, network } = useWallet();
  const { contractAddress } = useContract();
  const { notes } = useNotes();

  return (
    <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', gap: 5 }}>
      {/* Title */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <DashboardIcon sx={{ color: '#6366f1', fontSize: '32px' }} />
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Application Dashboard
        </Typography>
      </Box>

      {!isConnected ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ErrorIcon sx={{ color: '#f59e0b', fontSize: '48px', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
            Wallet Disconnected
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Please connect your wallet on the home screen to access the application dashboard.
          </Typography>
          <Button variant="contained" component={Link} to="/">
            Go to Home
          </Button>
        </Paper>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 4,
          }}
        >
          {/* Left panel: Quick status stats */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                System Connection Status
              </Typography>
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    1AM Wallet Address
                  </Typography>
                  <StatusBadge status="connected" label="Connected" />
                </Box>
                <Typography variant="caption" sx={{ fontFamily: 'monospace', background: 'rgba(0,0,0,0.2)', p: 1, borderRadius: '4px', wordBreak: 'break-all' }}>
                  {walletAddress}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Network
                  </Typography>
                  <StatusBadge status="info" label={network || 'Preprod'} />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Contract Status
                  </Typography>
                  <StatusBadge
                    status={contractAddress ? 'connected' : 'disconnected'}
                    label={contractAddress ? 'Initialized' : 'Not Deployed'}
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Private Notes Decrypted
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#06b6d4' }}>
                    {notes.length} Notes
                  </Typography>
                </Box>
              </Box>

              {contractAddress && (
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to="/notes"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ mt: 2 }}
                >
                  Open Notes Workspace
                </Button>
              )}
            </Paper>

            {/* Privacy note explanation card */}
            <Paper sx={{ p: 4, background: 'rgba(6, 182, 212, 0.02)', borderColor: 'rgba(6, 182, 212, 0.15)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <ShieldIcon sx={{ color: '#06b6d4' }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Observable Privacy Check
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                Midnight ledger states verify ZK proof validation results. A block explorer or any public crawler sees only empty constructor deploy events, Note commitment hashes inside the `notes` map, and 32-byte nullifiers. The actual contents are never transmitted across the network, guaranteeing total confidentiality.
              </Typography>
            </Paper>
          </Box>

          {/* Right panel: Deployment and Joint actions */}
          <Box>
            <DeploymentCard />
          </Box>
        </Box>
      )}
    </Box>
  );
};
