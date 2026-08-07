import React from 'react';
import { Paper, Typography, Box, Button, TextField, CircularProgress, Link } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import StorageIcon from '@mui/icons-material/Storage';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { useDeployment } from '../hooks/useDeployment';
import { useContract } from '../hooks/useContract';
import { useWallet } from '../hooks/useWallet';

export const DeploymentCard: React.FC = () => {
  const { isConnected } = useWallet();
  const { deploy, isDeploying, contractAddress: deployedAddr, txHash, txSuccess, error: deployError } = useDeployment();
  const { contractAddress: activeAddr, joinContract, isWorking: isJoining, error: joinError } = useContract();
  const [joinAddress, setJoinAddress] = React.useState('');

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinAddress.trim()) return;
    try {
      await joinContract(joinAddress.trim());
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Paper sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <CloudUploadIcon sx={{ color: '#a855f7', fontSize: '28px' }} />
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Smart Contract Deployment
        </Typography>
      </Box>

      {!isConnected ? (
        <Typography variant="body2" color="text.secondary">
          Please connect your wallet first to interact with deployment tools.
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Active Contract info */}
          {activeAddr && (
            <Paper sx={{ p: 2.5, background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '12px' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CheckCircleIcon sx={{ color: '#10b981', fontSize: '20px' }} />
                <Typography variant="subtitle2" sx={{ color: '#10b981', fontWeight: 'bold' }}>
                  Active Contract Address
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all', background: 'rgba(0,0,0,0.2)', p: 1, borderRadius: '6px' }}>
                {activeAddr}
              </Typography>
            </Paper>
          )}

          {/* Deploy section */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              Deploy New Secret Notes Contract
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={deploy}
              disabled={isDeploying || isJoining}
              fullWidth
            >
              {isDeploying ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={18} color="inherit" />
                  <span>Deploying Compact Contract...</span>
                </Box>
              ) : (
                'Deploy Compact Notes Contract'
              )}
            </Button>
          </Box>

          {/* Join section */}
          <Box component="form" onSubmit={handleJoin} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              Join Existing Notes Contract
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                placeholder="Enter contract address (hex)"
                size="small"
                value={joinAddress}
                onChange={(e) => setJoinAddress(e.target.value)}
                disabled={isDeploying || isJoining}
                fullWidth
              />
              <Button
                type="submit"
                variant="outlined"
                disabled={isDeploying || isJoining || !joinAddress.trim()}
              >
                {isJoining ? <CircularProgress size={18} color="inherit" /> : 'Join'}
              </Button>
            </Box>
          </Box>

          {/* Deployment results */}
          {(isDeploying || txHash || txSuccess !== null || deployError || joinError) && (
            <Paper sx={{ p: 2, background: 'rgba(255, 255, 255, 0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }} color="text.secondary">
                Deployment Logs
              </Typography>

              {isDeploying && (
                <Typography variant="caption" color="info.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={12} color="info" />
                  Submitting transaction & verifying local zero-knowledge proof...
                </Typography>
              )}

              {txHash && (
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Transaction Hash:
                  </Typography>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    {txHash}
                  </Typography>
                </Box>
              )}

              {txSuccess === true && (
                <Typography variant="caption" color="#10b981" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CheckCircleIcon sx={{ fontSize: '14px' }} /> Contract deployed successfully.
                </Typography>
              )}

              {txSuccess === false && (
                <Typography variant="caption" color="#ef4444" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <ErrorIcon sx={{ fontSize: '14px' }} /> Contract deployment transaction failed.
                </Typography>
              )}

              {(deployError || joinError) && (
                <Typography variant="caption" color="error" sx={{ background: 'rgba(239, 68, 68, 0.05)', p: 1, borderRadius: '6px', border: '1px solid rgba(239,68,68,0.1)' }}>
                  Error: {deployError || joinError}
                </Typography>
              )}
            </Paper>
          )}
        </Box>
      )}
    </Paper>
  );
};
