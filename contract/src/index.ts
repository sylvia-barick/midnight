import { CompiledContract } from "@midnight-ntwrk/midnight-js-protocol/compact-js";

export * from "./managed/notes/contract/index.js";
export * from "./witnesses";

import * as CompiledNotesContract from "./managed/notes/contract/index.js";
import * as Witnesses from "./witnesses";

export const CompiledNotesContractContract = CompiledContract.make<
  CompiledNotesContract.Contract<Witnesses.NotesPrivateState>
>("Notes", CompiledNotesContract.Contract<Witnesses.NotesPrivateState>).pipe(
  CompiledContract.withWitnesses(Witnesses.witnesses),
  CompiledContract.withCompiledFileAssets("./managed/notes"),
);
