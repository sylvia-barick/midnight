import { useMidnight } from './useMidnight';

export const useNotes = () => {
  const {
    notesState,
    createNote,
    updateNote,
    deleteNote,
    isWorking,
    isGeneratingProof,
    txHash,
    txSuccess,
    txError,
  } = useMidnight();

  return {
    notes: notesState?.notes ?? [],
    createNote,
    updateNote,
    deleteNote,
    isWorking,
    isGeneratingProof,
    txHash,
    txSuccess,
    error: txError,
  };
};
