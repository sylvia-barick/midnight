import React from 'react';
import { Box, Typography, Paper, Card, CardContent } from '@mui/material';
import Grid from '@mui/material/Grid';
import InfoIcon from '@mui/icons-material/Info';
import SecurityIcon from '@mui/icons-material/Security';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VpnKeyIcon from '@mui/icons-material/VpnKey';

export const About: React.FC = () => {
  return (
    <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* Title */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <InfoIcon sx={{ color: '#6366f1', fontSize: '32px' }} />
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          About Secret Notes ZK Model
        </Typography>
      </Box>

      {/* Intro Paper */}
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
          Privacy Demystified
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
          Secret Notes is a next-generation decentralized application built on top of the Midnight Network. 
          While typical decentralized applications expose transaction metadata, user choices, or states to the public ledger, 
          Secret Notes ensures that note plaintext, titles, and edit histories are kept strictly local to the user's browser.
          Only zero-knowledge proofs are sent to the network to validate the state transitions.
        </Typography>
      </Paper>

      {/* Grid of ZK principles */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
          gap: 4,
        }}
      >
        <Box>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <VpnKeyIcon sx={{ color: '#6366f1', fontSize: '32px' }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Note Commitments
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                Every note is hashed with a cryptographically secure random 32-byte salt and the owner's secret key:
                <br />
                <code>commitment = persistentHash([sk, id, noteHash, salt])</code>
                <br />
                This hash is a one-way function, making it impossible for third parties to reconstruct the note content.
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <VisibilityOffIcon sx={{ color: '#a855f7', fontSize: '32px' }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Nullifiers
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                To edit or delete a note without disclosing which note is being modified, the application generates a deterministic nullifier:
                <br />
                <code>nullifier = persistentHash([pad("note:nullifier"), id, sk])</code>
                <br />
                The ledger records used nullifiers to prevent replay attacks and double-updates.
              </Typography>
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <SecurityIcon sx={{ color: '#06b6d4', fontSize: '32px' }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Local ZK Proofs
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                Proofs are compiled and executed inside the user's browser using Midnight's client-side prover. 
                Your wallet signs transaction bindings and submits them to the network. 
                Midnight indexers index the commitment maps so your client can verify ledger states seamlessly.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Technical workflow mapping */}
      <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Data Flow and Storage Architecture
        </Typography>

        <Box sx={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', overflow: 'hidden' }}>
          {/* Header row */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'rgba(255,255,255,0.02)', p: 2, borderBottom: '1px solid rgba(255,255,255,0.06)', fontWeight: 'bold' }}>
            <Typography variant="subtitle2">Client-Side (Private & Local)</Typography>
            <Typography variant="subtitle2">On-Chain (Public & Ledger)</Typography>
          </Box>
          {/* Content rows */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', p: 2, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <Typography variant="body2" color="text.secondary">Note Title & plain text Content</Typography>
            <Typography variant="body2" color="text.secondary">None (Completely Hidden)</Typography>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', p: 2, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <Typography variant="body2" color="text.secondary">Wallet Secret Seed / Private Key</Typography>
            <Typography variant="body2" color="text.secondary">None (Never leaves your wallet)</Typography>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', p: 2, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <Typography variant="body2" color="text.secondary">Random note identifiers and salts</Typography>
            <Typography variant="body2" color="text.secondary">None (Stored in local storage)</Typography>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', p: 2 }}>
            <Typography variant="body2" color="text.secondary">ZKP prover execution data</Typography>
            <Typography variant="body2" color="text.secondary">Hashed commitments & Nullifiers lists</Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};
