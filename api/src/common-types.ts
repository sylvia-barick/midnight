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

/**
 * Bulletin board common types and abstractions.
 *
 * @module
 */

import { type MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import { type FoundContract } from '@midnight-ntwrk/midnight-js-contracts';
import type { Choice, VotingPrivateState, Contract, Witnesses } from '../../contract/src/index';

export const votingPrivateStateKey = 'votingPrivateState';
export type PrivateStateId = typeof votingPrivateStateKey;

/**
 * The private states consumed throughout the application.
 */
export type PrivateStates = {
  /**
   * Key used to provide the private state for {@link VotingContract} deployments.
   */
  readonly votingPrivateState: VotingPrivateState;
};

/**
 * Represents a voting contract and its private state.
 */
export type VotingContract = Contract<VotingPrivateState, Witnesses<VotingPrivateState>>;

/**
 * The keys of the circuits exported from {@link VotingContract}.
 */
export type VotingCircuitKeys = Exclude<keyof VotingContract['impureCircuits'], number | symbol>;

/**
 * The providers required by {@link VotingContract}.
 */
export type VotingProviders = MidnightProviders<VotingCircuitKeys, PrivateStateId, VotingPrivateState>;

/**
 * A {@link VotingContract} that has been deployed to the network.
 */
export type DeployedVotingContract = FoundContract<VotingContract>;

/**
 * A type that represents the derived combination of public (or ledger), and private state.
 */
export type VotingDerivedState = {
  readonly description: string;
  readonly pollId: Uint8Array;
  readonly tallyA: bigint;
  readonly tallyB: bigint;
  readonly hasVoted: boolean;
};

// TODO: for some reason I needed to include "@midnight-ntwrk/wallet-sdk-address-format": "1.0.0-rc.1", should we bump in to rc-2 ?
