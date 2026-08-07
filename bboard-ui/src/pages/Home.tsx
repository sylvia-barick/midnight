import React from 'react';
import { Box, Typography, Button, Card, CardContent } from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import LockIcon from '@mui/icons-material/Lock';
import StorageIcon from '@mui/icons-material/Storage';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Link } from 'react-router-dom';
import { useWallet } from '../hooks/useWallet';
import { WalletCard } from '../components/WalletCard';

export const Home: React.FC = () => {
  const { isConnected } = useWallet();

  const features = [
    {
      icon: <LockIcon sx={{ color: '#6366f1', fontSize: '32px' }} />,
      title: 'Shielded Notes',
      description: 'Your notes are encrypted and stored locally. The text never touches the public network.',
    },
    {
      icon: <ShieldIcon sx={{ color: '#a855f7', fontSize: '32px' }} />,
      title: 'Zero-Knowledge Proofs',
      description: 'Prove ownership, create notes, and update records on-chain without exposing details.',
    },
    {
      icon: <StorageIcon sx={{ color: '#06b6d4', fontSize: '32px' }} />,
      title: 'On-Chain Commitments',
      description: 'Only cryptographic hash commitments and nullifiers reside on the ledger.',
    },
  ];

  return (
    <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Hero Section */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.2fr 0.8fr' },
          gap: 6,
          alignItems: 'center',
        }}
      >
        <Box>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              padding: '6px 16px',
              borderRadius: '30px',
              mb: 3,
            }}
          >
            <VerifiedUserIcon sx={{ color: '#a5b4fc', fontSize: '16px' }} />
            <Typography variant="caption" color="#a5b4fc" sx={{ fontWeight: 'bold', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Zero-Knowledge Privacy Model
            </Typography>
          </Box>

          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              lineHeight: 1.1,
              mb: 3,
              fontSize: { xs: '2.5rem', md: '4rem' },
              background: 'linear-gradient(135deg, #fff 30%, #a5b4fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-1px',
            }}
          >
            Private Note Management,<br /> Shielded On-Chain Proofs.
          </Typography>

          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: '400', mb: 4, lineHeight: 1.6 }}>
            Secret Notes leverages the privacy-first Midnight network. Write notes that are truly yours—only you hold the keys to decrypt them, while the blockchain secures commitments in zero-knowledge.
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {isConnected ? (
              <>
                <Button variant="contained" color="primary" component={Link} to="/dashboard" endIcon={<ArrowForwardIcon />}>
                  Go to Dashboard
                </Button>
                <Button variant="outlined" component={Link} to="/notes">
                  Open My Notes
                </Button>
              </>
            ) : (
              <Button variant="contained" color="primary" onClick={() => document.getElementById('wallet-card-section')?.scrollIntoView({ behavior: 'smooth' })}>
                Connect Wallet to Start
              </Button>
            )}
          </Box>
        </Box>

        <Box id="wallet-card-section">
          <WalletCard />
        </Box>
      </Box>

      {/* Features Grid */}
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, textAlign: 'center' }}>
          App Features
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 6, textAlign: 'center', maxWidth: '600px', mx: 'auto' }}>
          Explore the components that make Secret Notes secure, decentralized, and 100% private.
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
            gap: 4,
          }}
        >
          {features.map((feature, idx) => (
            <Card sx={{ height: '100%' }} key={idx}>
              <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>{feature.icon}</Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Privacy Breakdown Section */}
      <Card sx={{ background: 'rgba(99, 102, 241, 0.03)', borderColor: 'rgba(99, 102, 241, 0.15)' }}>
        <CardContent sx={{ p: 5 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '2.2fr 0.8fr' },
              gap: 4,
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                How Does It Work?
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6 }}>
                Unlike public blockchains where your notes and transactions are fully readable by anyone, Midnight executes transaction logic locally on your machine. 
                When you create a note, your client computes a cryptographic hash commitment of the note content combined with a random salt and your wallet's secret key. 
                Only this commitment goes on-chain. When you edit or delete it, you generate a ZK proof demonstrating that you know the matching secret key and note content, without revealing them.
              </Typography>
              <Button variant="outlined" color="primary" component={Link} to="/about">
                Read Technical Privacy Model
              </Button>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <ShieldIcon sx={{ fontSize: '140px', color: 'rgba(99, 102, 241, 0.2)' }} />
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
