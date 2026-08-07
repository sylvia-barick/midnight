import * as Notes from '../../contract/src/managed/notes/contract/index.js';

import { type ContractAddress } from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';
import { type Logger } from 'pino';
import {
  type NotesDerivedState,
  type NotesContract,
  type NotesProviders,
  type DeployedNotesContract,
  notesPrivateStateKey,
  type Note,
} from './common-types.js';
import { CompiledNotesContractContract } from '../../contract/src/index.js';
import * as utils from './utils/index.js';
import { deployContract, findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { combineLatest, map, tap, from, type Observable } from 'rxjs';
import { toHex, fromHex } from '@midnight-ntwrk/midnight-js-utils';
import { NotesPrivateState, createNotesPrivateState } from '../../contract/src/witnesses.js';

// Asynchronous SHA-256 helper
export const sha256 = async (text: string): Promise<Uint8Array> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return new Uint8Array(hashBuffer);
};

/**
 * An API for a deployed notes contract.
 */
export interface DeployedNotesAPI {
  readonly deployedContractAddress: ContractAddress;
  readonly state$: Observable<NotesDerivedState>;

  createNote: (title: string, content: string) => Promise<Note>;
  updateNote: (idHex: string, title: string, content: string) => Promise<Note>;
  deleteNote: (idHex: string) => Promise<void>;
}

export class NotesAPI implements DeployedNotesAPI {
  private constructor(
    public readonly deployedContract: DeployedNotesContract,
    private readonly providers: NotesProviders,
    private readonly logger?: Logger,
  ) {
    this.deployedContractAddress = deployedContract.deployTxData.public.contractAddress;
    providers.privateStateProvider.setContractAddress(this.deployedContractAddress);
    
    this.state$ = combineLatest(
      [
        // Public ledger state
        providers.publicDataProvider.contractStateObservable(this.deployedContractAddress, { type: 'latest' }).pipe(
          map((contractState) => Notes.ledger(contractState.data)),
          tap((ledgerState) =>
            logger?.trace({
              ledgerStateChanged: {
                ledgerState: {
                  notesSize: ledgerState.notes.size(),
                  nullifiersSize: ledgerState.nullifiers.size(),
                },
              },
            }),
          ),
        ),
        // Private state (cast to include notes dictionary)
        from(providers.privateStateProvider.get(notesPrivateStateKey) as Promise<NotesPrivateState & { notes?: Record<string, Note> }>),
      ],
      (ledgerState, privateState) => {
        if (!privateState) {
          return { notes: [] };
        }
        
        const secretKey = privateState.secretKey;
        const localNotes = privateState.notes ? Object.values(privateState.notes) : [];

        // Check each local note against the on-chain ledger
        const ledgerNotesKeys = Array.from(ledgerState.notes);
        const ledgerNullifiersKeys = Array.from(ledgerState.nullifiers);

        const onChainNotes: Note[] = [];

        for (const note of localNotes) {
          const commitmentHex = note.commitment;
          const isOnChain = ledgerNotesKeys.some(([k]) => toHex(k) === commitmentHex);

          // Compute the nullifier for this note to see if it has been updated/deleted on-chain
          const idBytes = fromHex(note.id);
          const nullifierBytes = Notes.pureCircuits.calculateNullifier(idBytes, secretKey);
          const nullifierHex = toHex(nullifierBytes);

          const isNoteNullified = ledgerNullifiersKeys.some(([k]) => toHex(k) === nullifierHex);

          // The note is valid if its commitment is stored on-chain AND it hasn't been nullified
          if (isOnChain && !isNoteNullified) {
            onChainNotes.push(note);
          }
        }

        return {
          notes: onChainNotes,
        };
      },
    );
  }

  /**
   * Gets the address of the current deployed contract.
   */
  readonly deployedContractAddress: ContractAddress;

  /**
   * Gets an observable stream of state changes.
   */
  readonly state$: Observable<NotesDerivedState>;

  /**
   * Creates a private note.
   */
  async createNote(title: string, content: string): Promise<Note> {
    this.logger?.info(`createNote: ${title}`);

    const id = utils.randomBytes(32);
    const salt = utils.randomBytes(32);
    const titleHash = await sha256(title);
    const contentHash = await sha256(content);

    const noteHash = Notes.pureCircuits.calculateNoteHash(titleHash, contentHash);

    const privateState = await this.providers.privateStateProvider.get(notesPrivateStateKey) as (NotesPrivateState & { notes?: Record<string, Note> });
    if (!privateState) {
      throw new Error("Private state not found");
    }
    const secretKey = privateState.secretKey;

    const commitmentBytes = Notes.pureCircuits.calculateCommitment(secretKey, id, noteHash, salt);
    const commitmentHex = toHex(commitmentBytes);

    const newNote: Note = {
      id: toHex(id),
      title,
      content,
      salt: toHex(salt),
      commitment: commitmentHex,
    };

    // Call createNote ZK circuit
    await this.deployedContract.callTx.createNote(id, noteHash, salt);

    // Save note to private state
    const currentNotes = privateState.notes ?? {};
    currentNotes[newNote.id] = newNote;
    await this.providers.privateStateProvider.set(notesPrivateStateKey, {
      ...privateState,
      notes: currentNotes,
    });

    return newNote;
  }

  /**
   * Updates a private note (creates a new commitment and nullifies the old one).
   */
  async updateNote(idHex: string, title: string, content: string): Promise<Note> {
    this.logger?.info(`updateNote: ${idHex}`);

    const privateState = await this.providers.privateStateProvider.get(notesPrivateStateKey) as (NotesPrivateState & { notes?: Record<string, Note> });
    if (!privateState) {
      throw new Error("Private state not found");
    }
    const secretKey = privateState.secretKey;
    const currentNotes = privateState.notes ?? {};
    const oldNote = currentNotes[idHex];

    if (!oldNote) {
      throw new Error(`Note with id ${idHex} not found in private state`);
    }

    const oldId = fromHex(oldNote.id);
    const oldTitleHash = await sha256(oldNote.title);
    const oldContentHash = await sha256(oldNote.content);
    const oldNoteHash = Notes.pureCircuits.calculateNoteHash(oldTitleHash, oldContentHash);
    const oldSalt = fromHex(oldNote.salt);

    const newId = utils.randomBytes(32);
    const newSalt = utils.randomBytes(32);
    const newTitleHash = await sha256(title);
    const newContentHash = await sha256(content);
    const newNoteHash = Notes.pureCircuits.calculateNoteHash(newTitleHash, newContentHash);

    const newCommitmentBytes = Notes.pureCircuits.calculateCommitment(secretKey, newId, newNoteHash, newSalt);
    const newCommitmentHex = toHex(newCommitmentBytes);

    const updatedNote: Note = {
      id: toHex(newId),
      title,
      content,
      salt: toHex(newSalt),
      commitment: newCommitmentHex,
    };

    // Call updateNote ZK circuit
    await this.deployedContract.callTx.updateNote(
      oldId, oldNoteHash, oldSalt,
      newId, newNoteHash, newSalt
    );

    // Remove old note entry and save updated note to private state
    delete currentNotes[idHex];
    currentNotes[updatedNote.id] = updatedNote;

    await this.providers.privateStateProvider.set(notesPrivateStateKey, {
      ...privateState,
      notes: currentNotes,
    });

    return updatedNote;
  }

  /**
   * Deletes a private note (nullifies its commitment).
   */
  async deleteNote(idHex: string): Promise<void> {
    this.logger?.info(`deleteNote: ${idHex}`);

    const privateState = await this.providers.privateStateProvider.get(notesPrivateStateKey) as (NotesPrivateState & { notes?: Record<string, Note> });
    if (!privateState) {
      throw new Error("Private state not found");
    }
    const currentNotes = privateState.notes ?? {};
    const note = currentNotes[idHex];

    if (!note) {
      throw new Error(`Note with id ${idHex} not found in private state`);
    }

    const id = fromHex(note.id);
    const titleHash = await sha256(note.title);
    const contentHash = await sha256(note.content);
    const noteHash = Notes.pureCircuits.calculateNoteHash(titleHash, contentHash);
    const salt = fromHex(note.salt);

    // Call deleteNote ZK circuit
    await this.deployedContract.callTx.deleteNote(id, noteHash, salt);

    // Remove note from private state
    delete currentNotes[idHex];
    await this.providers.privateStateProvider.set(notesPrivateStateKey, {
      ...privateState,
      notes: currentNotes,
    });
  }

  /**
   * Deploys a new notes contract to the network.
   */
  static async deploy(providers: NotesProviders, logger?: Logger): Promise<NotesAPI> {
    logger?.info(`deployNotesContract`);

    // Get or initialize private state key
    providers.privateStateProvider.setContractAddress('0000000000000000000000000000000000000000000000000000000000000000');
    const existingPrivateState = await providers.privateStateProvider.get(notesPrivateStateKey);
    const initialPrivateState = existingPrivateState ?? createNotesPrivateState(utils.randomBytes(32));

    const deployedNotesContract = await deployContract(providers, {
      compiledContract: CompiledNotesContractContract,
      privateStateId: notesPrivateStateKey,
      initialPrivateState
    });

    logger?.trace({
      contractDeployed: {
        finalizedDeployTxData: deployedNotesContract.deployTxData.public,
      },
    });

    return new NotesAPI(deployedNotesContract, providers, logger);
  }

  /**
   * Finds an already deployed notes contract on the network, and joins it.
   */
  static async join(providers: NotesProviders, contractAddress: ContractAddress, logger?: Logger): Promise<NotesAPI> {
    logger?.info({
      joinContract: {
        contractAddress,
      },
    });

    const deployedNotesContract = await findDeployedContract<NotesContract>(providers, {
      contractAddress,
      compiledContract: CompiledNotesContractContract,
      privateStateId: notesPrivateStateKey,
      initialPrivateState: await NotesAPI.getPrivateState(providers, contractAddress),
    });

    logger?.trace({
      contractJoined: {
        finalizedDeployTxData: deployedNotesContract.deployTxData.public,
      },
    });

    return new NotesAPI(deployedNotesContract, providers, logger);
  }

  private static async getPrivateState(
    providers: NotesProviders,
    contractAddress: ContractAddress,
  ): Promise<NotesPrivateState> {
    providers.privateStateProvider.setContractAddress(contractAddress);
    const existingPrivateState = await providers.privateStateProvider.get(notesPrivateStateKey);
    return existingPrivateState ?? createNotesPrivateState(utils.randomBytes(32));
  }
}

export * as utils from './utils/index.js';
export * from './common-types.js';
