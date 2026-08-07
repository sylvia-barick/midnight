import { type MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import { type FoundContract } from '@midnight-ntwrk/midnight-js-contracts';
import type { NotesPrivateState, Contract, Witnesses } from '../../contract/src/index';

export const notesPrivateStateKey = 'notesPrivateState';
export type PrivateStateId = typeof notesPrivateStateKey;

/**
 * The private states consumed throughout the application.
 */
export type PrivateStates = {
  /**
   * Key used to provide the private state for {@link NotesContract} deployments.
   */
  readonly notesPrivateState: NotesPrivateState;
};

/**
 * Represents a notes contract and its private state.
 */
export type NotesContract = Contract<NotesPrivateState, Witnesses<NotesPrivateState>>;

/**
 * The keys of the circuits exported from {@link NotesContract}.
 */
export type NotesCircuitKeys = Exclude<keyof NotesContract['impureCircuits'], number | symbol>;

/**
 * The providers required by {@link NotesContract}.
 */
export type NotesProviders = MidnightProviders<NotesCircuitKeys, PrivateStateId, NotesPrivateState>;

/**
 * A {@link NotesContract} that has been deployed to the network.
 */
export type DeployedNotesContract = FoundContract<NotesContract>;

export type Note = {
  readonly id: string; // Hex string (32 bytes)
  readonly title: string;
  readonly content: string;
  readonly salt: string; // Hex string (32 bytes)
  readonly commitment: string; // Hex string (32 bytes)
};

/**
 * A type that represents the derived combination of public (or ledger), and private state.
 */
export type NotesDerivedState = {
  readonly notes: Note[];
};
