import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import LockIcon from '@mui/icons-material/Lock';
import StorageIcon from '@mui/icons-material/Storage';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import { WalletConnect, VotingPanel } from './components';
import { useMidnight } from './hooks/useMidnight';

const App: React.FC = () => {
  const { connectionStatus, contractAddress, votingState } = useMidnight();
  const isConnected = connectionStatus === 'connected';

  // Calculate totals
  const tallyA = Number(votingState?.tallyA ?? 0);
  const tallyB = Number(votingState?.tallyB ?? 0);
  const totalVotes = tallyA + tallyB;

  return (
    <Box
      sx={{
        background: '#030308',
        minHeight: '100vh',
        color: '#fff',
        fontFamily: '"Inter", "Space Grotesk", sans-serif',
        position: 'relative',
        overflow: 'hidden',
        paddingBottom: '80px',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-10%',
          right: '-10%',
          width: '50vw',
          height: '50vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(0,0,0,0) 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 0,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '10%',
          left: '-10%',
          width: '60vw',
          height: '60vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.12) 0%, rgba(0,0,0,0) 70%)',
          filter: 'blur(100px)',
          pointerEvents: 'none',
          zIndex: 0,
        },
      }}
    >
      {/* Background Animated Blobs */}
      <Box
        sx={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '80vw',
          height: '60vh',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.06) 0%, rgba(0,0,0,0) 60%)',
          filter: 'blur(120px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, pt: { xs: 4, md: 8 } }}>
        {/* Top Header / Branding */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: { xs: 6, md: 10 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 15px rgba(99, 102, 241, 0.5)',
              }}
            >
              <HowToVoteIcon sx={{ color: '#fff', fontSize: '22px' }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: '900', letterSpacing: '1px', background: 'linear-gradient(90deg, #fff, #cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              MIDNIGHT VOTING
            </Typography>
          </Box>

          <Box
            sx={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              padding: '6px 16px',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Typography variant="caption" color="rgba(255, 255, 255, 0.6)" sx={{ letterSpacing: '0.5px' }}>
              Network: <span style={{ color: '#06b6d4', fontWeight: 'bold' }}>Preprod</span>
            </Typography>
          </Box>
        </Box>

        {/* Hero Section / Landing view if disconnected */}
        {!isConnected && (
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 6, alignItems: 'center', minHeight: '60vh' }}>
            <Box sx={{ flex: 1.2 }}>
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
                <Typography variant="caption" color="#a5b4fc" sx={{ fontWeight: 'bold', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  Anonymous Private Ballot
                </Typography>
                <ArrowRightAltIcon sx={{ color: '#a5b4fc', fontSize: '16px' }} />
              </Box>

              <Typography
                variant="h2"
                sx={{
                  fontWeight: '900',
                  lineHeight: 1.1,
                  mb: 3,
                  fontSize: { xs: '2.8rem', md: '4.5rem' },
                  background: 'linear-gradient(135deg, #fff 30%, #a5b4fc 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-1px',
                }}
              >
                Cast Shielded Ballots,<br /> Enforce Unique Votes.
              </Typography>

              <Typography variant="h6" color="rgba(255, 255, 255, 0.6)" sx={{ fontWeight: '400', mb: 4, maxWidth: '600px', lineHeight: 1.6 }}>
                A cutting-edge Web3 private voting portal powered by Midnight's local proof generation. Submit your ballot securely on-chain while keeping your private keys and voter identity completely hidden.
              </Typography>

              {/* Privacy claim summary list */}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, maxWidth: '550px' }}>
                <Box sx={{ flex: 1, display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                  <VerifiedUserIcon sx={{ color: '#06b6d4', mt: 0.3 }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#fff' }}>Local Nullifiers</Typography>
                    <Typography variant="caption" color="rgba(255, 255, 255, 0.5)">ZK proofs are computed locally to check voter eligibility without double voting.</Typography>
                  </Box>
                </Box>
                <Box sx={{ flex: 1, display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                  <LockIcon sx={{ color: '#a855f7', mt: 0.3 }} />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#fff' }}>Shielded Identity</Typography>
                    <Typography variant="caption" color="rgba(255, 255, 255, 0.5)">Your master seed and private keys are never exposed on-chain or linked to your vote.</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Right side Wallet Connector Card */}
            <Box sx={{ flex: 0.8, display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' }, width: '100%' }}>
              <WalletConnect />
            </Box>
          </Box>
        )}

        {/* Connected Dashboard Layout */}
        {isConnected && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Upper row stats */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flex: '1 1 200px' }}>
                <Paper
                  sx={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '12px',
                    padding: '20px',
                    height: '100%',
                  }}
                >
                  <Typography variant="caption" color="rgba(255,255,255,0.4)" sx={{ display: 'block', mb: 1 }}>
                    Wallet Status
                  </Typography>
                  <Typography variant="h6" color="#10b981" sx={{ fontWeight: 'bold' }}>
                    Connected
                  </Typography>
                  <Typography variant="caption" color="rgba(255,255,255,0.3)">
                    Lace wallet is active
                  </Typography>
                </Paper>
              </Box>

              <Box sx={{ flex: '1 1 200px' }}>
                <Paper
                  sx={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '12px',
                    padding: '20px',
                    height: '100%',
                  }}
                >
                  <Typography variant="caption" color="rgba(255,255,255,0.4)" sx={{ display: 'block', mb: 1 }}>
                    Network Environment
                  </Typography>
                  <Typography variant="h6" color="#a855f7" sx={{ fontWeight: 'bold' }}>
                    Midnight Preprod
                  </Typography>
                  <Typography variant="caption" color="rgba(255,255,255,0.3)">
                    Remote node connection
                  </Typography>
                </Paper>
              </Box>

              <Box sx={{ flex: '1 1 200px' }}>
                <Paper
                  sx={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '12px',
                    padding: '20px',
                    height: '100%',
                  }}
                >
                  <Typography variant="caption" color="rgba(255,255,255,0.4)" sx={{ display: 'block', mb: 1 }}>
                    Contract Instance
                  </Typography>
                  <Typography variant="h6" color={contractAddress ? '#06b6d4' : 'rgba(255,255,255,0.2)'} sx={{ fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {contractAddress ? 'Initialized' : 'Not Loaded'}
                  </Typography>
                  <Typography variant="caption" color="rgba(255,255,255,0.3)" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                    {contractAddress ? contractAddress.substring(0, 16) + '...' : 'Deploy or join below'}
                  </Typography>
                </Paper>
              </Box>

              <Box sx={{ flex: '1 1 200px' }}>
                <Paper
                  sx={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    borderRadius: '12px',
                    padding: '20px',
                    height: '100%',
                  }}
                >
                  <Typography variant="caption" color="rgba(255,255,255,0.4)" sx={{ display: 'block', mb: 1 }}>
                    Ballots Cast
                  </Typography>
                  <Typography variant="h6" color="#06b6d4" sx={{ fontWeight: 'bold' }}>
                    {contractAddress ? totalVotes : 0}
                  </Typography>
                  <Typography variant="caption" color="rgba(255,255,255,0.3)">
                    {votingState?.hasVoted ? 'Shielded ballot registered' : 'Awaiting your selection'}
                  </Typography>
                </Paper>
              </Box>
            </Box>

            {/* Dashboard interactive tools */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 2 }}>
              <VotingPanel />
            </Box>

            {/* Quick Wallet disconnect trigger on dashboard */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <WalletConnect />
            </Box>
          </Box>
        )}

        {/* Privacy claim and detailed technical model info */}
        <Box
          sx={{
            background: 'rgba(255, 255, 255, 0.01)',
            border: '1px solid rgba(255, 255, 255, 0.04)',
            borderRadius: '16px',
            padding: '32px',
            mt: 8,
          }}
        >
          <Typography variant="h6" color="#fff" sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShieldIcon sx={{ color: '#6366f1' }} /> Detailed ZK Voting Privacy Model
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" color="#a5b4fc" sx={{ fontWeight: 'bold', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <StorageIcon sx={{ fontSize: '18px' }} /> Public Ledger Data
              </Typography>
              <Typography variant="body2" color="rgba(255, 255, 255, 0.5)" sx={{ lineHeight: 1.6 }}>
                On the Midnight blockchain, anyone can see:
                <br />• The active contract address and code hashes.
                <br />• The poll question/description and poll ID.
                <br />• The public counters (`tallyA` & `tallyB`).
                <br />• The list of consumed voter nullifiers (preventing double votes).
              </Typography>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" color="#a855f7" sx={{ fontWeight: 'bold', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <LockIcon sx={{ fontSize: '18px' }} /> Private Local Data
              </Typography>
              <Typography variant="body2" color="rgba(255, 255, 255, 0.5)" sx={{ lineHeight: 1.6 }}>
                Stays strictly inside your local browser:
                <br />• Your Lace wallet master seed and private credentials.
                <br />• The `localSecretKey` used to compute the deterministic nullifier.
                <br />• Intermediate circuit calculation variables and ZK witnesses.
              </Typography>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" color="#06b6d4" sx={{ fontWeight: 'bold', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <VerifiedUserIcon sx={{ fontSize: '18px' }} /> Verified Privacy Claim
              </Typography>
              <Typography variant="body2" color="rgba(255, 255, 255, 0.5)" sx={{ lineHeight: 1.6 }}>
                <strong>What an observer cannot see:</strong>
                <br />They cannot link any cast nullifier back to your active wallet address or shielded keys. The cryptographic connection between the voter's identity and their cast ballot remains completely untraceable.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default App;
