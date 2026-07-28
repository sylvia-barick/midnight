import React, { useState } from 'react';
import { Box, Button, TextField, Typography, CircularProgress, Alert, Paper, Tooltip, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import KeyIcon from '@mui/icons-material/Key';
import CodeIcon from '@mui/icons-material/Code';
import GppGoodIcon from '@mui/icons-material/GppGood';
import LinkIcon from '@mui/icons-material/Link';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { useMidnight } from '../hooks/useMidnight';

export const CircuitCall: React.FC = () => {
  const {
    contractAddress,
    isWorking,
    isGeneratingProof,
    txHash,
    txSuccess,
    txError,
    boardState,
    resolveContract,
    postMessage,
    takeDownMessage,
    connectionStatus,
  } = useMidnight();

  const [messageInput, setMessageInput] = useState('');
  const [joinAddress, setJoinAddress] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const isConnected = connectionStatus === 'connected';

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDeploy = async () => {
    try {
      await resolveContract();
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

  const handlePost = async () => {
    if (!messageInput.trim()) return;
    try {
      await postMessage(messageInput.trim());
      setMessageInput('');
    } catch (e) {
      console.error(e);
    }
  };

  const handleTakeDown = async () => {
    try {
      await takeDownMessage();
    } catch (e) {
      console.error(e);
    }
  };

  if (!isConnected) {
    return null;
  }

  const isOccupied = boardState?.state === 1; // OCCUPIED is 1, VACANT is 0 in the contract enum State
  const isVacant = boardState?.state === 0;

  return (
    <Box sx={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Contract deploy / join card */}
      {!contractAddress ? (
        <Paper
          sx={{
            background: 'rgba(10, 10, 20, 0.6)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
          }}
        >
          <Typography variant="h6" color="#fff" sx={{ fontWeight: 'bold', mb: 2 }}>
            Bulletin Board Smart Contract
          </Typography>
          <Typography variant="body2" color="rgba(255, 255, 255, 0.6)" sx={{ mb: 3 }}>
            Deploy a new Bulletin Board contract instance on Preprod, or join an existing contract address to interact.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3 }}>
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="rgba(255, 255, 255, 0.8)" sx={{ fontWeight: '600', mb: 1.5 }}>
                Option A: Deploy New Contract
              </Typography>
              <Button
                variant="contained"
                disabled={isWorking}
                onClick={handleDeploy}
                startIcon={isWorking ? <CircularProgress size={20} color="inherit" /> : <CodeIcon />}
                sx={{
                  background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                  borderRadius: '8px',
                  padding: '12px',
                  fontWeight: 'bold',
                  textTransform: 'none',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0891b2 0%, #2563eb 100%)',
                  },
                }}
              >
                {isWorking ? 'Deploying...' : 'Deploy Board Contract'}
              </Button>
            </Box>

            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="body2" color="rgba(255, 255, 255, 0.8)" sx={{ fontWeight: '600', mb: 1 }}>
                Option B: Join Existing Board
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  placeholder="Enter Contract Address (Hex)"
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
        // Active Contract Dashboard
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, width: '100%' }}>
          {/* Main interacting card */}
          <Box sx={{ flex: { xs: '1 1 auto', md: '7 7 0%' }, display: 'flex', flexDirection: 'column' }}>
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
                  Bulletin Board
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    background: isOccupied ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    border: isOccupied ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                  }}
                >
                  {isOccupied ? (
                    <LockIcon sx={{ color: '#f59e0b', fontSize: '16px' }} />
                  ) : (
                    <LockOpenIcon sx={{ color: '#10b981', fontSize: '16px' }} />
                  )}
                  <Typography
                    variant="caption"
                    color={isOccupied ? '#f59e0b' : '#10b981'}
                    sx={{ fontWeight: 'bold' }}
                  >
                    {isOccupied ? 'OCCUPIED' : 'VACANT'}
                  </Typography>
                </Box>
              </Box>

              {/* Current Board Message Display */}
              <Box
                sx={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  padding: '20px',
                  minHeight: '140px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  mb: 3,
                  position: 'relative',
                }}
              >
                {isOccupied ? (
                  <Box>
                    <Typography variant="caption" color="rgba(255, 255, 255, 0.4)" sx={{ display: 'block', mb: 1 }}>
                      Posted Message:
                    </Typography>
                    <Typography variant="h5" color="#fff" sx={{ fontWeight: '500', wordBreak: 'break-word' }}>
                      {boardState?.message || ''}
                    </Typography>
                    {boardState?.isOwner && (
                      <Typography variant="caption" color="#10b981" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 2 }}>
                        <CheckCircleIcon sx={{ fontSize: '14px' }} /> You own this post (derived from your private secret)
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body1" color="rgba(255, 255, 255, 0.4)">
                      No message posted. The board is vacant.
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Circuit Caller UI */}
              <Box sx={{ mt: 'auto' }}>
                {isVacant ? (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      placeholder="Message to post..."
                      variant="outlined"
                      size="medium"
                      fullWidth
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      disabled={isWorking}
                      sx={{
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
                      onClick={handlePost}
                      disabled={isWorking || !messageInput.trim()}
                      startIcon={<SendIcon />}
                      sx={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                        color: '#fff',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        padding: '0 20px',
                        textTransform: 'none',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)',
                        },
                      }}
                    >
                      Post
                    </Button>
                  </Box>
                ) : (
                  <Button
                    variant="contained"
                    fullWidth
                    color="error"
                    disabled={isWorking || !boardState?.isOwner}
                    onClick={handleTakeDown}
                    startIcon={<DeleteSweepIcon />}
                    sx={{
                      borderRadius: '8px',
                      padding: '12px',
                      fontWeight: 'bold',
                      textTransform: 'none',
                      background: boardState?.isOwner
                        ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)'
                        : 'rgba(255, 255, 255, 0.05)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                      },
                    }}
                  >
                    {!boardState?.isOwner ? 'Locked (Only author can take down)' : 'Take Down Message'}
                  </Button>
                )}
              </Box>
            </Paper>
          </Box>

          {/* Derived / Proving info side card */}
          <Box sx={{ flex: { xs: '1 1 auto', md: '5 5 0%' }, display: 'flex', flexDirection: 'column' }}>
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

              {/* Status information */}
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
                      Proved without revealing your private input
                    </Typography>
                    <Typography variant="caption" color="rgba(255, 255, 255, 0.6)">
                      The contract derives the post owner using a ZK proof derived from your local seed. Your secret key is never published on-chain.
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
                        Zero-Knowledge Proof Generated Successfully
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="rgba(255, 255, 255, 0.7)" sx={{ display: 'block', mb: 1.5 }}>
                      Your private data remained private throughout the transaction.
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
