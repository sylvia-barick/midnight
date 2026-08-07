import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ShieldIcon from '@mui/icons-material/Shield';
import { DeploymentCard } from '../components/DeploymentCard';

export const Deploy: React.FC = () => {
  return (
    <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', gap: 5 }}>
      {/* Title */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <CloudUploadIcon sx={{ color: '#6366f1', fontSize: '32px' }} />
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Contract Deployment Console
        </Typography>
      </Box>

      {/* Grid structure */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '3fr 2fr' }, gap: 4 }}>
        <DeploymentCard />

        <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <ShieldIcon sx={{ color: '#06b6d4', fontSize: '24px' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Why deploy a contract?
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            Secret Notes uses a shared smart contract instance on the ledger. 
            When you deploy a new contract instance:
            <br /><br />
            1. You register the commitment state rules for your notes on the Midnight Preprod ledger.
            <br />
            2. The contract has no access parameters for other users, meaning everyone can write commitments to it while maintaining separate private state environments.
            <br />
            3. You receive a unique 64-character contract address. Store this address or share it with others if you want to reuse the ledger maps.
            <br /><br />
            Alternatively, if you already have a contract address, you can input it in the "Join" form on the dashboard or deployment card to continue your session.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};
