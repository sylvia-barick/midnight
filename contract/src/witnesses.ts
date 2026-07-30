// This file is part of midnightntwrk/example-bboard.
// Copyright (C) Midnight Foundation
// SPDX-License-Identifier: Apache-2.0
// Licensed under the Apache License, Version 2.0 (the "License");
// You may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/*
 * This file defines the shape of the bulletin board's private state,
 * as well as the single witness function that accesses it.
 */

import { Ledger } from "./managed/voting/contract/index.js";
import { WitnessContext } from "@midnight-ntwrk/midnight-js-protocol/compact-runtime";

/* **********************************************************************
 * The only hidden state needed by the voting contract is
 * the user's secret key.
 */

export type VotingPrivateState = {
  readonly secretKey: Uint8Array;
};

export const createVotingPrivateState = (secretKey: Uint8Array) => ({
  secretKey,
});

/* **********************************************************************
 * The witnesses object for the voting contract is an object
 * with a field for each witness function, mapping the name of the function
 * to its implementation.
 */
export const witnesses = {
  localSecretKey: ({
    privateState,
  }: WitnessContext<Ledger, VotingPrivateState>): [
    VotingPrivateState,
    Uint8Array,
  ] => [privateState, privateState.secretKey],
};
