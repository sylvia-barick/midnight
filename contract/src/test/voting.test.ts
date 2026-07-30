import { VotingSimulator } from "./voting-simulator.js";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, it, expect } from "vitest";
import { randomBytes } from "./utils.js";
import { Choice } from "../managed/voting/contract/index.js";

setNetworkId("undeployed");

describe("Voting smart contract", () => {
  const pollId = randomBytes(32);
  const organizer = randomBytes(32);
  const description = "Should we adopt ZK Proofs for everything?";

  it("generates initial ledger state deterministically", () => {
    const key = randomBytes(32);
    const simulator0 = new VotingSimulator(key, pollId, description, organizer);
    const simulator1 = new VotingSimulator(key, pollId, description, organizer);
    
    const ledger0 = simulator0.getLedger();
    const ledger1 = simulator1.getLedger();
    
    expect(ledger0.tallyA).toEqual(ledger1.tallyA);
    expect(ledger0.tallyB).toEqual(ledger1.tallyB);
    expect(ledger0.description).toEqual(ledger1.description);
    expect(ledger0.organizer).toEqual(ledger1.organizer);
    expect(ledger0.pollId).toEqual(ledger1.pollId);
    expect(ledger0.votedNullifiers.size()).toEqual(ledger1.votedNullifiers.size());
  });

  it("properly initializes ledger state and private state", () => {
    const key = randomBytes(32);
    const simulator = new VotingSimulator(key, pollId, description, organizer);
    const ledgerState = simulator.getLedger();
    
    expect(ledgerState.tallyA).toEqual(0n);
    expect(ledgerState.tallyB).toEqual(0n);
    expect(ledgerState.description).toEqual(description);
    expect(ledgerState.organizer).toEqual(organizer);
    expect(ledgerState.pollId).toEqual(pollId);
    
    const privateState = simulator.getPrivateState();
    expect(privateState).toEqual({ secretKey: key });
  });

  it("lets you vote for Option A", () => {
    const userKey = randomBytes(32);
    const simulator = new VotingSimulator(userKey, pollId, description, organizer);
    
    simulator.vote(Choice.A);
    
    const ledgerState = simulator.getLedger();
    expect(ledgerState.tallyA).toEqual(1n);
    expect(ledgerState.tallyB).toEqual(0n);
    
    // Check that the nullifier is marked as voted
    const nullifier = simulator.calculateNullifier(userKey, pollId);
    expect(ledgerState.votedNullifiers.member(nullifier)).toEqual(true);
  });

  it("lets you vote for Option B", () => {
    const userKey = randomBytes(32);
    const simulator = new VotingSimulator(userKey, pollId, description, organizer);
    
    simulator.vote(Choice.B);
    
    const ledgerState = simulator.getLedger();
    expect(ledgerState.tallyA).toEqual(0n);
    expect(ledgerState.tallyB).toEqual(1n);
  });

  it("does not let the same user vote twice", () => {
    const userKey = randomBytes(32);
    const simulator = new VotingSimulator(userKey, pollId, description, organizer);
    
    simulator.vote(Choice.A);
    
    expect(() => simulator.vote(Choice.B)).toThrow(
      "failed assert: Voter has already cast a vote"
    );
  });

  it("lets different users vote and accumulates tallies correctly", () => {
    const userKey1 = randomBytes(32);
    const userKey2 = randomBytes(32);
    const simulator = new VotingSimulator(userKey1, pollId, description, organizer);
    
    simulator.vote(Choice.A);
    
    // Switch user and vote again
    simulator.switchUser(userKey2);
    simulator.vote(Choice.B);
    
    const ledgerState = simulator.getLedger();
    expect(ledgerState.tallyA).toEqual(1n);
    expect(ledgerState.tallyB).toEqual(1n);
  });
});
