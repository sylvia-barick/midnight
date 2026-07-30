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
  Choice,
} from "../managed/voting/contract/index.js";
import { type VotingPrivateState, witnesses } from "../witnesses.js";

/**
 * Serves as a testbed to exercise the voting contract in tests.
 */
export class VotingSimulator {
  readonly contract: Contract<VotingPrivateState>;
  circuitContext: CircuitContext<VotingPrivateState>;

  constructor(secretKey: Uint8Array, pollId: Uint8Array, description: string, organizer: Uint8Array) {
    this.contract = new Contract<VotingPrivateState>(witnesses);
    const {
      currentPrivateState,
      currentContractState,
      currentZswapLocalState,
    } = this.contract.initialState(
      createConstructorContext({ secretKey }, "0".repeat(64)),
      pollId,
      description,
      organizer
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

  public getPrivateState(): VotingPrivateState {
    return this.circuitContext.currentPrivateState;
  }

  public vote(choice: Choice): Ledger {
    // Update the current context to be the result of executing the circuit.
    this.circuitContext = this.contract.impureCircuits.vote(
      this.circuitContext,
      choice,
    ).context;
    return ledger(this.circuitContext.currentQueryContext.state);
  }

  public calculateNullifier(sk: Uint8Array, pollId: Uint8Array): Uint8Array {
    return this.contract.circuits.calculateNullifier(
      this.circuitContext,
      sk,
      pollId,
    ).result;
  }
}
