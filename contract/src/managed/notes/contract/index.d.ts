import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
  localSecretKey(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  createNote(context: __compactRuntime.CircuitContext<PS>,
             id_0: Uint8Array,
             noteHash_0: Uint8Array,
             salt_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  readMyNotes(context: __compactRuntime.CircuitContext<PS>,
              id_0: Uint8Array,
              noteHash_0: Uint8Array,
              salt_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  updateNote(context: __compactRuntime.CircuitContext<PS>,
             oldId_0: Uint8Array,
             oldNoteHash_0: Uint8Array,
             oldSalt_0: Uint8Array,
             newId_0: Uint8Array,
             newNoteHash_0: Uint8Array,
             newSalt_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  deleteNote(context: __compactRuntime.CircuitContext<PS>,
             id_0: Uint8Array,
             noteHash_0: Uint8Array,
             salt_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  createNote(context: __compactRuntime.CircuitContext<PS>,
             id_0: Uint8Array,
             noteHash_0: Uint8Array,
             salt_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  readMyNotes(context: __compactRuntime.CircuitContext<PS>,
              id_0: Uint8Array,
              noteHash_0: Uint8Array,
              salt_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  updateNote(context: __compactRuntime.CircuitContext<PS>,
             oldId_0: Uint8Array,
             oldNoteHash_0: Uint8Array,
             oldSalt_0: Uint8Array,
             newId_0: Uint8Array,
             newNoteHash_0: Uint8Array,
             newSalt_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  deleteNote(context: __compactRuntime.CircuitContext<PS>,
             id_0: Uint8Array,
             noteHash_0: Uint8Array,
             salt_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
  calculateCommitment(sk_0: Uint8Array,
                      id_0: Uint8Array,
                      noteHash_0: Uint8Array,
                      salt_0: Uint8Array): Uint8Array;
  calculateNullifier(id_0: Uint8Array, sk_0: Uint8Array): Uint8Array;
  calculateNoteHash(titleHash_0: Uint8Array, contentHash_0: Uint8Array): Uint8Array;
}

export type Circuits<PS> = {
  createNote(context: __compactRuntime.CircuitContext<PS>,
             id_0: Uint8Array,
             noteHash_0: Uint8Array,
             salt_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  readMyNotes(context: __compactRuntime.CircuitContext<PS>,
              id_0: Uint8Array,
              noteHash_0: Uint8Array,
              salt_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  updateNote(context: __compactRuntime.CircuitContext<PS>,
             oldId_0: Uint8Array,
             oldNoteHash_0: Uint8Array,
             oldSalt_0: Uint8Array,
             newId_0: Uint8Array,
             newNoteHash_0: Uint8Array,
             newSalt_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  deleteNote(context: __compactRuntime.CircuitContext<PS>,
             id_0: Uint8Array,
             noteHash_0: Uint8Array,
             salt_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  calculateCommitment(context: __compactRuntime.CircuitContext<PS>,
                      sk_0: Uint8Array,
                      id_0: Uint8Array,
                      noteHash_0: Uint8Array,
                      salt_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  calculateNullifier(context: __compactRuntime.CircuitContext<PS>,
                     id_0: Uint8Array,
                     sk_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  calculateNoteHash(context: __compactRuntime.CircuitContext<PS>,
                    titleHash_0: Uint8Array,
                    contentHash_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
}

export type Ledger = {
  notes: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<[Uint8Array, boolean]>
  };
  nullifiers: {
    isEmpty(): boolean;
    size(): bigint;
    member(key_0: Uint8Array): boolean;
    lookup(key_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<[Uint8Array, boolean]>
  };
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
