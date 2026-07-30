import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export enum Choice { A = 0, B = 1 }

export type Witnesses<PS> = {
  localSecretKey(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  vote(context: __compactRuntime.CircuitContext<PS>, choice_0: Choice): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  vote(context: __compactRuntime.CircuitContext<PS>, choice_0: Choice): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
  calculateNullifier(sk_0: Uint8Array, pollIdVal_0: Uint8Array): Uint8Array;
}

export type Circuits<PS> = {
  vote(context: __compactRuntime.CircuitContext<PS>, choice_0: Choice): __compactRuntime.CircuitResults<PS, []>;
  calculateNullifier(context: __compactRuntime.CircuitContext<PS>,
                     sk_0: Uint8Array,
                     pollIdVal_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
}

export type Ledger = {
  readonly organizer: Uint8Array;
  readonly pollId: Uint8Array;
  readonly description: string;
  readonly tallyA: bigint;
  readonly tallyB: bigint;
  votedNullifiers: {
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
  initialState(context: __compactRuntime.ConstructorContext<PS>,
               pollIdVal_0: Uint8Array,
               pollDescription_0: string,
               organizerPubKey_0: Uint8Array): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
