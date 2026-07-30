import React, { useState } from 'react';
import { Box, Button, TextField, Typography, CircularProgress, Alert, Paper, Tooltip, IconButton, LinearProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GppGoodIcon from '@mui/icons-material/GppGood';
import LinkIcon from '@mui/icons-material/Link';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import KeyIcon from '@mui/icons-material/Key';
import CodeIcon from '@mui/icons-material/Code';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import PollIcon from '@mui/icons-material/Poll';
import { useMidnight } from '../hooks/useMidnight';
import { Choice } from '../../../contract/src/index';

export const VotingPanel: React.FC = () => {
  const {
    contractAddress,
    isWorking,
    isGeneratingProof,
    txHash,
    txSuccess,
    txError,
    votingState,
    resolveContract,
    castVote,
    connectionStatus,
  } = useMidnight();

  const [descriptionInput, setDescriptionInput] = useState('');
  const [joinAddress, setJoinAddress] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const isConnected = connectionStatus === 'connected';

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDeploy = async () => {
    if (!descriptionInput.trim()) return;
    try {
      await resolveContract(descriptionInput.trim());
      setDescriptionInput('');
    } catch (e) {
      console.error(e);
    }
  };

  const handleJoin = async () => {
    if (!joinAddress.trim()) return;
    try {
      await resolveContract(joinAddress.trim());
    } catch (e) {
      console.error(e);
    }
  };

  const handleVote = async (choice: Choice) => {
    try {
      await castVote(choice);
    } catch (e) {
      console.error(e);
    }
  };

  if (!isConnected) {
    return null;
  }

  // Calculate vote percentages
  const tallyA = Number(votingState?.tallyA ?? 0);
  const tallyB = Number(votingState?.tallyB ?? 0);
  const totalVotes = tallyA + tallyB;
  const percentA = totalVotes > 0 ? Math.round((tallyA / totalVotes) * 100) : 0;
  const percentB = totalVotes > 0 ? Math.round((tallyB / totalVotes) * 100) : 0;

  return (
    <Box sx={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: 3 }}>
      {!contractAddress ? (
        <Paper
          sx={{
            background: 'rgba(10, 10, 20, 0.6)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: '16px',
            padding: '28px',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
          }}
        >
          <Typography variant="h5" color="#fff" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <PollIcon sx={{ color: '#6366f1' }} /> Create or Join Private Poll
          </Typography>
          <Typography variant="body2" color="rgba(255, 255, 255, 0.6)" sx={{ mb: 4 }}>
            Deploy a new Private Voting smart contract on the Midnight Preprod testnet, or join an existing contract using its address.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
            <Box sx={{ flex: 1.2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="rgba(255, 255, 255, 0.8)" sx={{ fontWeight: '600', mb: 1.5 }}>
                Option A: Deploy New Poll
              </Typography>
              <TextField
                placeholder="Enter poll question/description..."
                variant="outlined"
                size="small"
                fullWidth
                value={descriptionInput}
                onChange={(e) => setDescriptionInput(e.target.value)}
                disabled={isWorking}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    color: '#fff',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' },
                    '&:hover fieldset': { borderColor: 'rgba(99, 102, 241, 0.5)' },
                    '&.Mui-focused fieldset': { borderColor: '#6366f1' },
                  },
                }}
              />
              <Button
                variant="contained"
                disabled={isWorking || !descriptionInput.trim()}
                onClick={handleDeploy}
                startIcon={isWorking ? <CircularProgress size={20} color="inherit" /> : <CodeIcon />}
                sx={{
                  background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                  borderRadius: '8px',
                  padding: '10px',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0891b2 0%, #2563eb 100%)',
                  },
                }}
              >
                {isWorking ? 'Deploying...' : 'Deploy Poll Contract'}
              </Button>
            </Box>

            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <Typography variant="body2" color="rgba(255, 255, 255, 0.8)" sx={{ fontWeight: '600', mb: 1.5 }}>
                Option B: Join Existing Poll
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  placeholder="Contract Address (Hex)"
                  variant="outlined"
                  size="small"
                  value={joinAddress}
                  onChange={(e) => setJoinAddress(e.target.value)}
                  disabled={isWorking}
                  sx={{
                    flex: 1,
                    '& .MuiOutlinedInput-root': {
                      color: '#fff',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.15)' },
                      '&:hover fieldset': { borderColor: 'rgba(99, 102, 241, 0.5)' },
                      '&.Mui-focused fieldset': { borderColor: '#6366f1' },
                    },
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={handleJoin}
                  disabled={isWorking || !joinAddress.trim()}
                  sx={{
                    borderRadius: '8px',
                    borderColor: 'rgba(99, 102, 241, 0.4)',
                    color: '#a5b4fc',
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: '#6366f1',
                      background: 'rgba(99, 102, 241, 0.08)',
                    },
                  }}
                >
                  Join
                </Button>
              </Box>
            </Box>
          </Box>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, width: '100%' }}>
          {/* Main interacting card */}
          <Box sx={{ flex: 1.3, display: 'flex', flexDirection: 'column' }}>
            <Paper
              sx={{
                background: 'rgba(10, 10, 20, 0.6)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: '16px',
                padding: '24px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" color="#fff" sx={{ fontWeight: 'bold' }}>
                  Active Poll
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    background: votingState?.hasVoted ? 'rgba(16, 185, 129, 0.1)' : 'rgba(99, 102, 241, 0.1)',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    border: votingState?.hasVoted ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(99, 102, 241, 0.3)',
                  }}
                >
                  <HowToVoteIcon sx={{ color: votingState?.hasVoted ? '#10b981' : '#818cf8', fontSize: '16px' }} />
                  <Typography
                    variant="caption"
                    color={votingState?.hasVoted ? '#10b981' : '#818cf8'}
                    sx={{ fontWeight: 'bold' }}
                  >
                    {votingState?.hasVoted ? 'VOTE CASTED' : 'VOTE PENDING'}
                  </Typography>
                </Box>
              </Box>

              {/* Poll Question Display */}
              <Box
                sx={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  padding: '20px',
                  minHeight: '90px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  mb: 3,
                }}
              >
                <Typography variant="body2" color="rgba(255, 255, 255, 0.4)" sx={{ display: 'block', mb: 1 }}>
                  Question:
                </Typography>
                <Typography variant="h6" color="#fff" sx={{ fontWeight: '500', wordBreak: 'break-word' }}>
                  {votingState?.description || 'Loading poll description...'}
                </Typography>
              </Box>

              {/* Vote Stats / Visual Tally */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle2" color="rgba(255, 255, 255, 0.6)" sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                  <span>Current Results</span>
                  <span>{totalVotes} total {totalVotes === 1 ? 'vote' : 'votes'}</span>
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" color="#6366f1" sx={{ fontWeight: 'bold' }}>Option A (Yes)</Typography>
                    <Typography variant="body2" color="#fff" sx={{ fontWeight: 'bold' }}>{tallyA} ({percentA}%)</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={percentA}
                    sx={{
                      height: '8px',
                      borderRadius: '4px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                      }
                    }}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" color="#06b6d4" sx={{ fontWeight: 'bold' }}>Option B (No)</Typography>
                    <Typography variant="body2" color="#fff" sx={{ fontWeight: 'bold' }}>{tallyB} ({percentB}%)</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={percentB}
                    sx={{
                      height: '8px',
                      borderRadius: '4px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(90deg, #06b6d4, #3b82f6)',
                      }
                    }}
                  />
                </Box>
              </Box>

              {/* Voting buttons */}
              <Box sx={{ mt: 'auto' }}>
                {votingState?.hasVoted ? (
                  <Alert
                    severity="success"
                    icon={<GppGoodIcon sx={{ color: '#34d399' }} />}
                    sx={{
                      background: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: '#a7f3d0',
                      borderRadius: '8px',
                    }}
                  >
                    You have successfully voted! Your local zero-knowledge proof has registered your vote while keeping your identity completely shielded on the ledger.
                  </Alert>
                ) : (
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      disabled={isWorking}
                      onClick={() => handleVote(Choice.A)}
                      sx={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                        color: '#fff',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        padding: '12px',
                        textTransform: 'none',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)',
                        },
                      }}
                    >
                      Vote Option A (Yes)
                    </Button>
                    <Button
                      variant="contained"
                      fullWidth
                      disabled={isWorking}
                      onClick={() => handleVote(Choice.B)}
                      sx={{
                        background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                        color: '#fff',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        padding: '12px',
                        textTransform: 'none',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #0891b2 0%, #2563eb 100%)',
                        },
                      }}
                    >
                      Vote Option B (No)
                    </Button>
                  </Box>
                )}
              </Box>
            </Paper>
          </Box>

          {/* Privacy Monitor Panel */}
          <Box sx={{ flex: 0.9, display: 'flex', flexDirection: 'column' }}>
            <Paper
              sx={{
                background: 'rgba(10, 10, 20, 0.6)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: '16px',
                padding: '24px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 2.5,
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
              }}
            >
              <Typography variant="subtitle1" color="#fff" sx={{ fontWeight: 'bold' }}>
                Privacy Monitor
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="rgba(255, 255, 255, 0.4)" sx={{ display: 'block', mb: 0.5 }}>
                    Contract Address:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="#cbd5e1" noWrap sx={{ flex: 1, fontFamily: 'monospace' }}>
                      {contractAddress}
                    </Typography>
                    <Tooltip title={isCopied ? 'Copied!' : 'Copy Address'}>
                      <IconButton size="small" onClick={() => handleCopy(contractAddress || '')} sx={{ color: 'rgba(255,255,255,0.6)' }}>
                        {isCopied ? <CheckCircleIcon fontSize="small" sx={{ color: '#10b981' }} /> : <ContentCopyIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Box
                  sx={{
                    background: 'rgba(99, 102, 241, 0.05)',
                    border: '1px solid rgba(99, 102, 241, 0.15)',
                    borderRadius: '8px',
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.5,
                  }}
                >
                  <KeyIcon sx={{ color: '#818cf8', fontSize: '20px', mt: 0.2 }} />
                  <Box>
                    <Typography variant="caption" color="#a5b4fc" sx={{ fontWeight: 'bold', display: 'block' }}>
                      Nullifier Guard Active
                    </Typography>
                    <Typography variant="caption" color="rgba(255, 255, 255, 0.6)">
                      The contract derives a cryptographic nullifier locally. Your private wallet seed is never published on-chain, keeping you completely anonymous.
                    </Typography>
                  </Box>
                </Box>

                {/* Local Prover Status indicator */}
                {isGeneratingProof && (
                  <Box
                    sx={{
                      background: 'rgba(6, 182, 212, 0.08)',
                      border: '1px solid rgba(6, 182, 212, 0.3)',
                      borderRadius: '8px',
                      padding: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <CircularProgress size={24} sx={{ color: '#06b6d4' }} />
                    <Box>
                      <Typography variant="body2" color="#22d3ee" sx={{ fontWeight: 'bold' }}>
                        Local Proving Engine Active
                      </Typography>
                      <Typography variant="caption" color="rgba(255, 255, 255, 0.7)">
                        Generating ZK Proof in-browser...
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* Successful transactions */}
                {txSuccess && txHash && (
                  <Box
                    sx={{
                      background: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '8px',
                      padding: '16px',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                      <GppGoodIcon sx={{ color: '#10b981' }} />
                      <Typography variant="body2" color="#34d399" sx={{ fontWeight: 'bold' }}>
                        ZK-Proof Generated Successfully
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="rgba(255, 255, 255, 0.7)" sx={{ display: 'block', mb: 1.5 }}>
                      Your vote choice has been submitted without leaking your public identity.
                    </Typography>

                    <Button
                      variant="outlined"
                      size="small"
                      href={`https://explorer.preprod.midnight.network/transaction/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      startIcon={<LinkIcon />}
                      sx={{
                        color: '#34d399',
                        borderColor: 'rgba(16, 185, 129, 0.4)',
                        textTransform: 'none',
                        fontSize: '11px',
                        '&:hover': {
                          borderColor: '#10b981',
                          background: 'rgba(16, 185, 129, 0.05)',
                        },
                      }}
                    >
                      View on-chain explorer
                    </Button>
                  </Box>
                )}

                {/* Error Banner */}
                {txError && (
                  <Alert
                    severity="error"
                    sx={{
                      background: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#fca5a5',
                      borderRadius: '8px',
                      fontSize: '13px',
                    }}
                  >
                    {txError}
                  </Alert>
                )}
              </Box>
            </Paper>
          </Box>
        </Box>
      )}
    </Box>
  );
};
