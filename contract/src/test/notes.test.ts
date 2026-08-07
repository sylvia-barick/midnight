import { NotesSimulator } from "./notes-simulator.js";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { describe, it, expect } from "vitest";
import { randomBytes } from "./utils.js";

setNetworkId("undeployed");

describe("Secret Notes smart contract", () => {
  it("properly initializes empty ledger state and private state", () => {
    const key = randomBytes(32);
    const simulator = new NotesSimulator(key);
    const ledgerState = simulator.getLedger();

    expect(ledgerState.notes.size()).toEqual(0n);
    expect(ledgerState.nullifiers.size()).toEqual(0n);

    const privateState = simulator.getPrivateState();
    expect(privateState).toEqual({ secretKey: key });
  });

  it("lets you create a note and stores commitment on-chain", () => {
    const userKey = randomBytes(32);
    const simulator = new NotesSimulator(userKey);

    const id = randomBytes(32);
    const noteHash = randomBytes(32);
    const salt = randomBytes(32);

    const ledgerState = simulator.createNote(id, noteHash, salt);
    expect(ledgerState.notes.size()).toEqual(1n);

    // Verify it cannot be created again
    expect(() => simulator.createNote(id, noteHash, salt)).toThrow(
      "failed assert: Note commitment already exists"
    );
  });

  it("lets you read a note that exists and is not nullified", () => {
    const userKey = randomBytes(32);
    const simulator = new NotesSimulator(userKey);

    const id = randomBytes(32);
    const noteHash = randomBytes(32);
    const salt = randomBytes(32);

    simulator.createNote(id, noteHash, salt);

    // Should not throw
    expect(() => simulator.readMyNotes(id, noteHash, salt)).not.toThrow();
  });

  it("fails to read a note that doesn't exist on-chain", () => {
    const userKey = randomBytes(32);
    const simulator = new NotesSimulator(userKey);

    const id = randomBytes(32);
    const noteHash = randomBytes(32);
    const salt = randomBytes(32);

    expect(() => simulator.readMyNotes(id, noteHash, salt)).toThrow(
      "failed assert: Note does not exist on-chain"
    );
  });

  it("lets you update a note", () => {
    const userKey = randomBytes(32);
    const simulator = new NotesSimulator(userKey);

    const oldId = randomBytes(32);
    const oldNoteHash = randomBytes(32);
    const oldSalt = randomBytes(32);

    simulator.createNote(oldId, oldNoteHash, oldSalt);

    const newId = randomBytes(32);
    const newNoteHash = randomBytes(32);
    const newSalt = randomBytes(32);

    const ledgerState = simulator.updateNote(
      oldId, oldNoteHash, oldSalt,
      newId, newNoteHash, newSalt
    );

    expect(ledgerState.notes.size()).toEqual(2n); // old + new
    expect(ledgerState.nullifiers.size()).toEqual(1n);

    expect(() => simulator.readMyNotes(oldId, oldNoteHash, oldSalt)).toThrow(
      "failed assert: Note has been nullified"
    );

    expect(() => simulator.readMyNotes(newId, newNoteHash, newSalt)).not.toThrow();
  });

  it("lets you delete a note", () => {
    const userKey = randomBytes(32);
    const simulator = new NotesSimulator(userKey);

    const id = randomBytes(32);
    const noteHash = randomBytes(32);
    const salt = randomBytes(32);

    simulator.createNote(id, noteHash, salt);

    const ledgerState = simulator.deleteNote(id, noteHash, salt);
    expect(ledgerState.nullifiers.size()).toEqual(1n);

    expect(() => simulator.readMyNotes(id, noteHash, salt)).toThrow(
      "failed assert: Note has been nullified"
    );
  });
});
