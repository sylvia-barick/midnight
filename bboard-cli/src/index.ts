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
 * This file is the main driver for the Midnight voting CLI.
 */

import { createInterface, type Interface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { WebSocket } from 'ws';
import {
  VotingAPI,
  type VotingDerivedState,
  votingPrivateStateKey,
  type VotingProviders,
  type DeployedVotingContract,
  type PrivateStateId,
} from '../../api/src/index';
import { type WalletFacade } from '@midnight-ntwrk/wallet-sdk-facade';
import { ledger, type Ledger, Choice } from '../../contract/src/managed/voting/contract/index.js';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { type Logger } from 'pino';
import { type Config, StandaloneConfig } from './config.js';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { type ContractAddress } from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';
import { assertIsContractAddress, toHex } from '@midnight-ntwrk/midnight-js-utils';
import { TestEnvironment } from '@midnight-ntwrk/testkit-js';
import { MidnightWalletProvider } from './midnight-wallet-provider';
import { randomBytes } from '../../api/src/utils';
import { unshieldedToken } from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { syncWallet, waitForUnshieldedFunds } from './wallet-utils';
import { generateDust } from './generate-dust';
import { VotingPrivateState } from '../../contract/src/witnesses.js';

// @ts-expect-error: It's needed to enable WebSocket usage through apollo
globalThis.WebSocket = WebSocket;

export const getVotingLedgerState = async (
  providers: VotingProviders,
  contractAddress: ContractAddress,
): Promise<Ledger | null> => {
  assertIsContractAddress(contractAddress);
  const contractState = await providers.publicDataProvider.queryContractState(contractAddress);
  return contractState != null ? ledger(contractState.data) : null;
};

const DEPLOY_OR_JOIN_QUESTION = `
You can do one of the following:
  1. Deploy a new private poll contract
  2. Join an existing private poll contract
  3. Exit
Which would you like to do? `;

const deployOrJoin = async (providers: VotingProviders, rli: Interface, logger: Logger): Promise<VotingAPI | null> => {
  let api: VotingAPI | null = null;

  while (true) {
    const choice = await rli.question(DEPLOY_OR_JOIN_QUESTION);
    switch (choice) {
      case '1': {
        const description = await rli.question('Enter the poll question/description: ');
        api = await VotingAPI.deploy(providers, description, logger);
        logger.info(`Deployed contract at address: ${api.deployedContractAddress}`);
        return api;
      }
      case '2':
        api = await VotingAPI.join(providers, await rli.question('What is the contract address (in hex)? '), logger);
        logger.info(`Joined contract at address: ${api.deployedContractAddress}`);
        return api;
      case '3':
        logger.info('Exiting...');
        return null;
      default:
        logger.error(`Invalid choice: ${choice}`);
    }
  }
};

const displayLedgerState = async (
  providers: VotingProviders,
  deployedVotingContract: DeployedVotingContract,
  logger: Logger,
): Promise<void> => {
  const contractAddress = deployedVotingContract.deployTxData.public.contractAddress;
  const ledgerState = await getVotingLedgerState(providers, contractAddress);
  if (ledgerState === null) {
    logger.info(`There is no voting contract deployed at ${contractAddress}`);
  } else {
    logger.info(`Description: '${ledgerState.description}'`);
    logger.info(`Poll ID: '${toHex(ledgerState.pollId)}'`);
    logger.info(`Tally A: ${ledgerState.tallyA}`);
    logger.info(`Tally B: ${ledgerState.tallyB}`);
    logger.info(`Voters count: ${ledgerState.votedNullifiers.size()}`);
    logger.info(`Organizer is: '${toHex(ledgerState.organizer)}'`);
  }
};

const displayPrivateState = async (providers: VotingProviders, logger: Logger): Promise<void> => {
  const privateState = await providers.privateStateProvider.get(votingPrivateStateKey);
  if (privateState === null) {
    logger.info(`There is no existing voting private state`);
  } else {
    logger.info(`Current secret key is: ${toHex(privateState.secretKey)}`);
  }
};

const displayDerivedState = (ledgerState: VotingDerivedState | undefined, logger: Logger) => {
  if (ledgerState === undefined) {
    logger.info(`No voting state currently available`);
  } else {
    logger.info(`Question: '${ledgerState.description}'`);
    logger.info(`Tally A: ${ledgerState.tallyA}`);
    logger.info(`Tally B: ${ledgerState.tallyB}`);
    logger.info(`You have voted: '${ledgerState.hasVoted ? 'yes' : 'no'}'`);
  }
};

const MAIN_LOOP_QUESTION = `
You can do one of the following:
  1. Cast a vote
  2. Display the current ledger state (known by everyone)
  3. Display the current private state (known only to this DApp instance)
  4. Display the current derived state (known only to this DApp instance)
  5. Exit
Which would you like to do? `;

const mainLoop = async (providers: VotingProviders, rli: Interface, logger: Logger): Promise<void> => {
  const votingApi = await deployOrJoin(providers, rli, logger);
  if (votingApi === null) {
    return;
  }
  let currentState: VotingDerivedState | undefined;
  const stateObserver = {
    next: (state: VotingDerivedState) => (currentState = state),
  };
  const subscription = votingApi.state$.subscribe(stateObserver);
  try {
    while (true) {
      const choice = await rli.question(MAIN_LOOP_QUESTION);
      try {
        switch (choice) {
          case '1': {
            if (currentState?.hasVoted) {
              logger.error('You have already voted in this poll.');
              break;
            }
            const voteChoiceStr = await rli.question(`Vote Choice: (1) Option A / Yes, (2) Option B / No: `);
            if (voteChoiceStr === '1') {
              await votingApi.vote(Choice.A);
              logger.info('Voted successfully for Option A.');
            } else if (voteChoiceStr === '2') {
              await votingApi.vote(Choice.B);
              logger.info('Voted successfully for Option B.');
            } else {
              logger.error('Invalid vote choice.');
            }
            break;
          }
          case '2':
            await displayLedgerState(providers, votingApi.deployedContract, logger);
            break;
          case '3':
            await displayPrivateState(providers, logger);
            break;
          case '4':
            displayDerivedState(currentState, logger);
            break;
          case '5':
            logger.info('Exiting...');
            return;
          default:
            logger.error(`Invalid choice: ${choice}`);
        }
      } catch (e) {
        logError(logger, e);
        logger.info('Returning to main menu...');
      }
    }
  } finally {
    subscription.unsubscribe();
  }
};

const GENESIS_MINT_WALLET_SEED = '0000000000000000000000000000000000000000000000000000000000000001';

const buildWallet = async (config: Config, rli: Interface, logger: Logger): Promise<string | undefined> => {
  if (config instanceof StandaloneConfig) {
    return GENESIS_MINT_WALLET_SEED;
  }
  while (true) {
    const choice = await rli.question(WALLET_LOOP_QUESTION);
    switch (choice) {
      case '1':
        return toHex(randomBytes(32));
      case '2':
        return await rli.question('Enter your wallet seed: ');
      case '3':
        logger.info('Exiting...');
        return undefined;
      default:
        logger.error(`Invalid choice: ${choice}`);
    }
  }
};

export const run = async (config: Config, testEnv: TestEnvironment, logger: Logger): Promise<void> => {
  const rli = createInterface({ input, output, terminal: true });
  const providersToBeStopped: MidnightWalletProvider[] = [];
  try {
    const envConfiguration = await testEnv.start();
    logger.info(`Environment started with configuration: ${JSON.stringify(envConfiguration)}`);
    const seed = await buildWallet(config, rli, logger);
    if (seed === undefined) {
      return;
    }
    const walletProvider = await MidnightWalletProvider.build(logger, envConfiguration, seed);
    providersToBeStopped.push(walletProvider);
    const walletFacade: WalletFacade = walletProvider.wallet;

    await walletProvider.start();

    const unshieldedState = await waitForUnshieldedFunds(logger, walletFacade, envConfiguration, unshieldedToken());
    const nightBalance = unshieldedState.balances[unshieldedToken().raw];
    if (nightBalance === undefined) {
      logger.info('No funds received, exiting...');
      return;
    }
    logger.info(`Your NIGHT wallet balance is: ${nightBalance}`);

    if (config.generateDust) {
      const dustGeneration = await generateDust(logger, seed, unshieldedState, walletFacade);
      if (dustGeneration) {
        logger.info(`Submitted dust generation registration transaction: ${dustGeneration}`);
        await syncWallet(logger, walletFacade);
      }
    }

    const zkConfigProvider = new NodeZkConfigProvider<'vote'>(config.zkConfigPath);
    const providers: VotingProviders = {
      privateStateProvider: levelPrivateStateProvider<PrivateStateId, VotingPrivateState>({
        privateStateStoreName: config.privateStateStoreName,
        signingKeyStoreName: `${config.privateStateStoreName}-signing-keys`,
        privateStoragePasswordProvider: () => {
          return 'Voting-Test-2026!';
        },
        accountId: seed,
      }),
      publicDataProvider: indexerPublicDataProvider(envConfiguration.indexer, envConfiguration.indexerWS),
      zkConfigProvider: zkConfigProvider,
      proofProvider: httpClientProofProvider(envConfiguration.proofServer, zkConfigProvider),
      walletProvider: walletProvider,
      midnightProvider: walletProvider,
    };
    await mainLoop(providers, rli, logger);
  } catch (e) {
    logError(logger, e);
    logger.info('Exiting...');
  } finally {
    try {
      rli.close();
      rli.removeAllListeners();
    } catch (e) {
      logError(logger, e);
    } finally {
      try {
        for (const wallet of providersToBeStopped) {
          logger.info('Stopping wallet...');
          await wallet.stop();
        }
        if (testEnv) {
          logger.info('Stopping test environment...');
          await testEnv.shutdown();
        }
      } catch (e) {
        logError(logger, e);
      }
    }
  }
};

function logError(logger: Logger, e: unknown) {
  if (e instanceof Error) {
    logger.error(`Found error '${e.message}'`);
    logger.debug(`${e.stack}`);
  } else {
    logger.error(`Found error (unknown type)`);
  }
}
