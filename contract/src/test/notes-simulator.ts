import {
  type CircuitContext,
  QueryContext,
  sampleContractAddress,
  createConstructorContext,
  CostModel,
} from "@midnight-ntwrk/compact-runtime";
import {
  Contract,
  type Ledger,
  ledger,
} from "../managed/notes/contract/index.js";
import { type NotesPrivateState, witnesses } from "../witnesses.js";

/**
 * Serves as a testbed to exercise the notes contract in tests.
 */
export class NotesSimulator {
  readonly contract: Contract<NotesPrivateState>;
  circuitContext: CircuitContext<NotesPrivateState>;

  constructor(secretKey: Uint8Array) {
    this.contract = new Contract<NotesPrivateState>(witnesses);
    const {
      currentPrivateState,
      currentContractState,
      currentZswapLocalState,
    } = this.contract.initialState(
      createConstructorContext({ secretKey }, "0".repeat(64))
    );
    this.circuitContext = {
      currentPrivateState,
      currentZswapLocalState,
      costModel: CostModel.initialCostModel(),
      currentQueryContext: new QueryContext(
        currentContractState.data,
        sampleContractAddress(),
      ),
    };
  }

  /***
   * Switch to a different secret key for a different user
   */
  public switchUser(secretKey: Uint8Array) {
    this.circuitContext.currentPrivateState = {
      secretKey,
    };
  }

  public getLedger(): Ledger {
    return ledger(this.circuitContext.currentQueryContext.state);
  }

  public getPrivateState(): NotesPrivateState {
    return this.circuitContext.currentPrivateState;
  }

  public createNote(id: Uint8Array, noteHash: Uint8Array, salt: Uint8Array): Ledger {
    this.circuitContext = this.contract.impureCircuits.createNote(
      this.circuitContext,
      id,
      noteHash,
      salt
    ).context;
    return ledger(this.circuitContext.currentQueryContext.state);
  }

  public readMyNotes(id: Uint8Array, noteHash: Uint8Array, salt: Uint8Array): void {
    this.circuitContext = this.contract.impureCircuits.readMyNotes(
      this.circuitContext,
      id,
      noteHash,
      salt
    ).context;
  }

  public updateNote(
    oldId: Uint8Array, oldNoteHash: Uint8Array, oldSalt: Uint8Array,
    newId: Uint8Array, newNoteHash: Uint8Array, newSalt: Uint8Array
  ): Ledger {
    this.circuitContext = this.contract.impureCircuits.updateNote(
      this.circuitContext,
      oldId,
      oldNoteHash,
      oldSalt,
      newId,
      newNoteHash,
      newSalt
    ).context;
    return ledger(this.circuitContext.currentQueryContext.state);
  }

  public deleteNote(id: Uint8Array, noteHash: Uint8Array, salt: Uint8Array): Ledger {
    this.circuitContext = this.contract.impureCircuits.deleteNote(
      this.circuitContext,
      id,
      noteHash,
      salt
    ).context;
    return ledger(this.circuitContext.currentQueryContext.state);
  }
}
