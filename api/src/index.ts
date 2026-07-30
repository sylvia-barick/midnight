import * as Voting from '../../contract/src/managed/voting/contract/index.js';

import { type ContractAddress } from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';
import { type Logger } from 'pino';
import {
  type VotingDerivedState,
  type VotingContract,
  type VotingProviders,
  type DeployedVotingContract,
  votingPrivateStateKey,
} from './common-types.js';
import { CompiledVotingContractContract } from '../../contract/src/index.js';
import * as utils from './utils/index.js';
import { deployContract, findDeployedContract } from '@midnight-ntwrk/midnight-js-contracts';
import { combineLatest, map, tap, from, type Observable } from 'rxjs';
import { toHex } from '@midnight-ntwrk/midnight-js-utils';
import { VotingPrivateState, createVotingPrivateState } from '../../contract/src/witnesses.js';

/**
 * An API for a deployed voting contract.
 */
export interface DeployedVotingAPI {
  readonly deployedContractAddress: ContractAddress;
  readonly state$: Observable<VotingDerivedState>;

  vote: (choice: Voting.Choice) => Promise<void>;
}

export class VotingAPI implements DeployedVotingAPI {
  private constructor(
    public readonly deployedContract: DeployedVotingContract,
    providers: VotingProviders,
    private readonly logger?: Logger,
  ) {
    this.deployedContractAddress = deployedContract.deployTxData.public.contractAddress;
    providers.privateStateProvider.setContractAddress(this.deployedContractAddress);
    this.state$ = combineLatest(
      [
        // Combine public (ledger) state...
        providers.publicDataProvider.contractStateObservable(this.deployedContractAddress, { type: 'latest' }).pipe(
          map((contractState) => Voting.ledger(contractState.data)),
          tap((ledgerState) =>
            logger?.trace({
              ledgerStateChanged: {
                ledgerState: {
                  ...ledgerState,
                  tallyA: ledgerState.tallyA,
                  tallyB: ledgerState.tallyB,
                },
              },
            }),
          ),
        ),
        // ...with private state
        from(providers.privateStateProvider.get(votingPrivateStateKey) as Promise<VotingPrivateState>),
      ],
      (ledgerState, privateState) => {
        // Calculate the voter's deterministic nullifier
        const nullifier = Voting.pureCircuits.calculateNullifier(
          privateState.secretKey,
          ledgerState.pollId
        );

        // Check if user has voted by iterating over the map entries
        const keysArray = Array.from(ledgerState.votedNullifiers);
        const hasVoted = keysArray.some(([k]) => toHex(k) === toHex(nullifier));

        return {
          description: ledgerState.description,
          pollId: ledgerState.pollId,
          tallyA: ledgerState.tallyA,
          tallyB: ledgerState.tallyB,
          hasVoted,
        };
      },
    );
  }

  /**
   * Gets the address of the current deployed contract.
   */
  readonly deployedContractAddress: ContractAddress;

  /**
   * Gets an observable stream of state changes.
   */
  readonly state$: Observable<VotingDerivedState>;

  /**
   * Casts a vote (Option A or Option B).
   */
  async vote(choice: Voting.Choice): Promise<void> {
    this.logger?.info(`castingVote: ${choice}`);

    const txData = await this.deployedContract.callTx.vote(choice);

    this.logger?.trace({
      transactionAdded: {
        circuit: 'vote',
        txHash: txData.public.txHash,
        blockHeight: txData.public.blockHeight,
      },
    });
  }

  /**
   * Deploys a new voting contract to the network.
   */
  static async deploy(providers: VotingProviders, description: string, logger?: Logger): Promise<VotingAPI> {
    logger?.info(`deployVotingContract: ${description}`);

    const pollId = utils.randomBytes(32);
    const organizerPubKey = utils.randomBytes(32);

    // Get or initialize private state key
    providers.privateStateProvider.setContractAddress('0000000000000000000000000000000000000000000000000000000000000000');
    const existingPrivateState = await providers.privateStateProvider.get(votingPrivateStateKey);
    const initialPrivateState = existingPrivateState ?? createVotingPrivateState(utils.randomBytes(32));

    const deployedVotingContract = await deployContract(providers, {
      compiledContract: CompiledVotingContractContract,
      privateStateId: votingPrivateStateKey,
      initialPrivateState,
      args: [pollId, description, organizerPubKey]
    });

    logger?.trace({
      contractDeployed: {
        finalizedDeployTxData: deployedVotingContract.deployTxData.public,
      },
    });

    return new VotingAPI(deployedVotingContract, providers, logger);
  }

  /**
   * Finds an already deployed voting contract on the network, and joins it.
   */
  static async join(providers: VotingProviders, contractAddress: ContractAddress, logger?: Logger): Promise<VotingAPI> {
    logger?.info({
      joinContract: {
        contractAddress,
      },
    });

    const deployedVotingContract = await findDeployedContract<VotingContract>(providers, {
      contractAddress,
      compiledContract: CompiledVotingContractContract,
      privateStateId: votingPrivateStateKey,
      initialPrivateState: await VotingAPI.getPrivateState(providers, contractAddress),
    });

    logger?.trace({
      contractJoined: {
        finalizedDeployTxData: deployedVotingContract.deployTxData.public,
      },
    });

    return new VotingAPI(deployedVotingContract, providers, logger);
  }

  private static async getPrivateState(
    providers: VotingProviders,
    contractAddress: ContractAddress,
  ): Promise<VotingPrivateState> {
    providers.privateStateProvider.setContractAddress(contractAddress);
    const existingPrivateState = await providers.privateStateProvider.get(votingPrivateStateKey);
    return existingPrivateState ?? createVotingPrivateState(utils.randomBytes(32));
  }
}

export * as utils from './utils/index.js';
export * from './common-types.js';
