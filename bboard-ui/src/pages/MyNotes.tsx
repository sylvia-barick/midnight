import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert } from '@mui/material';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import DescriptionIcon from '@mui/icons-material/Description';
import ErrorIcon from '@mui/icons-material/Error';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link } from 'react-router-dom';
import { useNotes } from '../hooks/useNotes';
import { useContract } from '../hooks/useContract';
import { useWallet } from '../hooks/useWallet';
import { NoteCard } from '../components/NoteCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { Toast } from '../components/Toast';
import { Note } from '../../../api/src/index';

export const MyNotes: React.FC = () => {
  const { isConnected } = useWallet();
  const { contractAddress } = useContract();
  const { notes, createNote, updateNote, deleteNote, isWorking, isGeneratingProof, txHash, txSuccess, error } = useNotes();

  // Modal / Dialog States
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [activeNote, setActiveNote] = useState<Note | null>(null);

  // Form States
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // Toast notification state
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error'>('success');

  const handleShowToast = (msg: string, severity: 'success' | 'error') => {
    setToastMessage(msg);
    setToastSeverity(severity);
    setToastOpen(true);
  };

  const handleCreateOpen = () => {
    setTitle('');
    setContent('');
    setCreateOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setCreateOpen(false);
    try {
      await createNote(title.trim(), content.trim());
      handleShowToast('Private Note created successfully! Commitment stored on-chain.', 'success');
    } catch (err: any) {
      handleShowToast(err.message || 'Failed to create note.', 'error');
    }
  };

  const handleEditOpen = (note: Note) => {
    setActiveNote(note);
    setTitle(note.title);
    setContent(note.content);
    setEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeNote || !title.trim() || !content.trim()) return;
    setEditOpen(false);
    try {
      await updateNote(activeNote.id, title.trim(), content.trim());
      handleShowToast('Private Note updated! New commitment stored, old commitment nullified.', 'success');
    } catch (err: any) {
      handleShowToast(err.message || 'Failed to update note.', 'error');
    }
  };

  const handleDeleteOpen = (note: Note) => {
    setActiveNote(note);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!activeNote) return;
    setDeleteOpen(false);
    try {
      await deleteNote(activeNote.id);
      handleShowToast('Private Note deleted! On-chain commitment nullified.', 'success');
    } catch (err: any) {
      handleShowToast(err.message || 'Failed to delete note.', 'error');
    }
  };

  if (!isConnected) {
    return (
      <Box sx={{ py: 6 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ErrorIcon sx={{ color: '#f59e0b', fontSize: '48px', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
            Wallet Disconnected
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Please connect your wallet first on the home screen to access your private notes.
          </Typography>
          <Button variant="contained" component={Link} to="/">
            Go to Home
          </Button>
        </Paper>
      </Box>
    );
  }

  if (!contractAddress) {
    return (
      <Box sx={{ py: 6 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ErrorIcon sx={{ color: '#ef4444', fontSize: '48px', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
            No Contract Active
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            A deployed or joined contract instance is required to query note commitments.
          </Typography>
          <Button variant="contained" component={Link} to="/dashboard">
            Open Dashboard
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Loading Spinners */}
      <LoadingSpinner open={isGeneratingProof} message="Generating local ZK proof..." />
      <LoadingSpinner open={isWorking && !isGeneratingProof} message="Broadcasting transaction to Midnight network..." />

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <DescriptionIcon sx={{ color: '#6366f1', fontSize: '32px' }} />
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            My Private Notes
          </Typography>
        </Box>
        <Button variant="contained" color="primary" onClick={handleCreateOpen} startIcon={<NoteAddIcon />}>
          Create Note
        </Button>
      </Box>

      {/* Transaction alerts */}
      {txHash && (
        <Alert severity="info" sx={{ borderRadius: '12px', background: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6,182,212,0.2)' }}>
          Last Transaction Hash: <span style={{ fontFamily: 'monospace' }}>{txHash}</span>
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ borderRadius: '12px' }}>
          {error}
        </Alert>
      )}

      {/* Notes Grid */}
      {notes.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: 'center', background: 'rgba(255,255,255,0.01)', borderStyle: 'dashed' }}>
          <DescriptionIcon sx={{ color: 'rgba(255,255,255,0.15)', fontSize: '64px', mb: 2 }} />
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.5)', fontWeight: 'bold', mb: 1 }}>
            No Shielded Notes
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            You haven't created any private notes yet. Tap the button above to construct your first note!
          </Typography>
        </Paper>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
            gap: 3,
          }}
        >
          {notes.map((note) => (
            <Box key={note.id}>
              <NoteCard note={note} onEdit={handleEditOpen} onDelete={handleDeleteOpen} />
            </Box>
          ))}
        </Box>
      )}

      {/* CREATE DIALOG */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm" slotProps={{ paper: { sx: { background: 'rgba(3, 3, 8, 0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', backdropFilter: 'blur(20px)' } } }}>
        <Box component="form" onSubmit={handleCreateSubmit}>
          <DialogTitle sx={{ fontWeight: 'bold' }}>Create Private Note</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <TextField label="Title" placeholder="e.g. My Private Password" value={title} onChange={(e) => setTitle(e.target.value)} required fullWidth />
            <TextField label="Content" placeholder="Enter secure content..." value={content} onChange={(e) => setContent(e.target.value)} multiline rows={5} required fullWidth />
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setCreateOpen(false)} variant="outlined" color="inherit">Cancel</Button>
            <Button type="submit" variant="contained" color="primary">Generate ZK Proof & Create</Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm" slotProps={{ paper: { sx: { background: 'rgba(3, 3, 8, 0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', backdropFilter: 'blur(20px)' } } }}>
        <Box component="form" onSubmit={handleEditSubmit}>
          <DialogTitle sx={{ fontWeight: 'bold' }}>Edit Private Note</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required fullWidth />
            <TextField label="Content" value={content} onChange={(e) => setContent(e.target.value)} multiline rows={5} required fullWidth />
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setEditOpen(false)} variant="outlined" color="inherit">Cancel</Button>
            <Button type="submit" variant="contained" color="primary">Prove & Update</Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* DELETE MODAL */}
      <ConfirmationModal
        open={deleteOpen}
        title="Delete Private Note"
        message={`Are you sure you want to delete "${activeNote?.title}"? This will invalidate the note, submit a nullifier on-chain, and permanently remove the note content from local storage.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteOpen(false)}
        confirmText="Prove & Delete"
      />

      {/* TOAST notifications */}
      <Toast open={toastOpen} message={toastMessage} severity={toastSeverity} onClose={() => setToastOpen(false)} />
    </Box>
  );
};
