import React from 'react';
import { Paper, Typography, Box, IconButton, Chip, Tooltip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LockIcon from '@mui/icons-material/Lock';
import KeyIcon from '@mui/icons-material/Key';
import CodeIcon from '@mui/icons-material/Code';
import { Note } from '../../../api/src/index';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, onEdit, onDelete }) => {
  return (
    <Paper
      sx={{
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        transition: 'transform 0.3s ease, border-color 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          borderColor: 'rgba(99, 102, 241, 0.3)',
          boxShadow: '0 8px 24px rgba(99, 102, 241, 0.08)',
        },
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LockIcon sx={{ color: '#06b6d4', fontSize: '18px' }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', wordBreak: 'break-word' }}>
            {note.title}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Edit Note (will prove update circuit)">
            <IconButton size="small" onClick={() => onEdit(note)} sx={{ color: '#818cf8', '&:hover': { background: 'rgba(129, 140, 248, 0.1)' } }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Note (will prove delete circuit)">
            <IconButton size="small" onClick={() => onDelete(note)} sx={{ color: '#f87171', '&:hover': { background: 'rgba(248, 113, 113, 0.1)' } }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Content */}
      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.85)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', flexGrow: 1, minHeight: '60px' }}>
        {note.content}
      </Typography>

      {/* Privacy Metadata (Commitment & Salt) */}
      <Box sx={{ pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CodeIcon sx={{ color: '#a855f7', fontSize: '14px' }} />
          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
            ZK Commitment (stored on-chain):
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ fontFamily: 'monospace', wordBreak: 'break-all', background: 'rgba(0,0,0,0.2)', p: 0.8, borderRadius: '4px', display: 'block' }}>
          {note.commitment.substring(0, 16)}...{note.commitment.substring(note.commitment.length - 16)}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <KeyIcon sx={{ color: '#06b6d4', fontSize: '14px' }} />
          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
            Random Salt (stored locally):
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ fontFamily: 'monospace', wordBreak: 'break-all', background: 'rgba(0,0,0,0.2)', p: 0.8, borderRadius: '4px', display: 'block' }}>
          {note.salt.substring(0, 16)}...{note.salt.substring(note.salt.length - 16)}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          <Chip label="Local Storage" size="small" variant="outlined" color="info" sx={{ height: '20px', fontSize: '0.65rem' }} />
          <Chip label="Shielded ZK Proof" size="small" variant="outlined" color="secondary" sx={{ height: '20px', fontSize: '0.65rem' }} />
        </Box>
      </Box>
    </Paper>
  );
};
