import { Ledger } from "./managed/notes/contract/index.js";
import { WitnessContext } from "@midnight-ntwrk/midnight-js-protocol/compact-runtime";

export type NotesPrivateState = {
  readonly secretKey: Uint8Array;
  readonly notes?: Record<string, any>;
};

export const createNotesPrivateState = (secretKey: Uint8Array) => ({
  secretKey,
});

export const witnesses = {
  localSecretKey: ({
    privateState,
  }: WitnessContext<Ledger, NotesPrivateState>): [
    NotesPrivateState,
    Uint8Array,
  ] => [privateState, privateState.secretKey],
};
