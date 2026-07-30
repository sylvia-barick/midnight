import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { type ContractAddress, toHex, fromHex } from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';
import { type VotingDerivedState, type DeployedVotingAPI, VotingAPI, type VotingProviders, type VotingCircuitKeys } from '../../../api/src/index';
import { Choice } from '../../../contract/src/index';
import { ConnectedAPI, type InitialAPI } from '@midnight-ntwrk/dapp-connector-api';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { inMemoryPrivateStateProvider } from '../in-memory-private-state-provider';
import { VotingPrivateState, createVotingPrivateState } from '../../../contract/src/witnesses';
import { votingPrivateStateKey } from '../../../api/src/common-types';
import { NetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { logger } from '../main';
import { type FinalizedTransaction, Transaction, SignatureEnabled, Proof, Binding, TransactionId } from '@midnight-ntwrk/midnight-js-protocol/ledger';
import type { UnboundTransaction } from '@midnight-ntwrk/midnight-js-types';
import * as utils from '../../../api/src/utils/index';
import semver from 'semver';

const COMPATIBLE_CONNECTOR_API_VERSION = '4.x';

export type WalletConnectionStatus = 'disconnected' | 'connecting' | 'connected';

export interface MidnightContextType {
  // Wallet state
  walletAddress: string | null;
  network: NetworkId | null;
  connectionStatus: WalletConnectionStatus;
  walletError: string | null;
  connectWallet: () => Promise<ConnectedAPI>;
  disconnectWallet: () => void;

  // Contract state
  contractAddress: string | null;
  isWorking: boolean;
  isGeneratingProof: boolean;
  txHash: string | null;
  txSuccess: boolean | null;
  txError: string | null;
  votingState: VotingDerivedState | null;

  // Contract actions
  resolveContract: (descriptionOrAddress?: string) => Promise<void>;
  castVote: (choice: Choice) => Promise<void>;
}

const MidnightContext = createContext<MidnightContextType | undefined>(undefined);

const getFirstCompatibleWallet = (): InitialAPI | undefined => {
  if (typeof window === 'undefined' || !window.midnight) return undefined;
  return Object.values(window.midnight).find(
    (wallet): wallet is InitialAPI =>
      !!wallet &&
      typeof wallet === 'object' &&
      'apiVersion' in wallet &&
      semver.satisfies(wallet.apiVersion, COMPATIBLE_CONNECTOR_API_VERSION),
  );
};

export const MidnightProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<NetworkId | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<WalletConnectionStatus>('disconnected');
  const [walletError, setWalletError] = useState<string | null>(null);

  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const [isWorking, setIsWorking] = useState(false);
  const [isGeneratingProof, setIsGeneratingProof] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [txSuccess, setTxSuccess] = useState<boolean | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [votingState, setVotingState] = useState<VotingDerivedState | null>(null);

  const [connectedAPI, setConnectedAPI] = useState<ConnectedAPI | null>(null);
  const [deployedAPI, setDeployedAPI] = useState<DeployedVotingAPI | null>(null);

  const disconnectWallet = useCallback(() => {
    localStorage.removeItem('midnight_wallet_address');
    localStorage.removeItem('midnight_network');
    localStorage.removeItem('midnight_contract_address');
    setWalletAddress(null);
    setNetwork(null);
    setConnectionStatus('disconnected');
    setWalletError(null);
    setConnectedAPI(null);
    setDeployedAPI(null);
    setContractAddress(null);
    setVotingState(null);
    setTxHash(null);
    setTxSuccess(null);
    setTxError(null);
  }, []);

  const connectWallet = useCallback(async () => {
    setConnectionStatus('connecting');
    setWalletError(null);
    const targetNetwork = (import.meta.env.VITE_NETWORK_ID || 'preprod') as NetworkId;

    try {
      let wallet: InitialAPI | undefined = undefined;
      for (let i = 0; i < 20; i++) {
        wallet = getFirstCompatibleWallet();
        if (wallet) break;
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      if (!wallet) {
        throw new Error('Midnight Lace wallet not detected. Please ensure the extension is installed and enabled.');
      }

      let api: ConnectedAPI;
      try {
        api = await wallet.connect(targetNetwork);
      } catch (connectErr: any) {
        logger.error(connectErr, 'Error connecting to wallet');
        if (connectErr.message && connectErr.message.toLowerCase().includes('network')) {
          throw new Error(`Network Mismatch: Please check your Lace Wallet configuration and ensure network is set to ${targetNetwork}.`);
        }
        throw new Error(connectErr.message || 'Lace Wallet connection was rejected or failed.');
      }

      const shieldedAddresses = await api.getShieldedAddresses();
      
      setConnectedAPI(api);
      setWalletAddress(shieldedAddresses.shieldedCoinPublicKey);
      setNetwork(targetNetwork);
      setConnectionStatus('connected');
      
      localStorage.setItem('midnight_wallet_address', shieldedAddresses.shieldedCoinPublicKey);
      localStorage.setItem('midnight_network', targetNetwork);
      return api;
    } catch (err: any) {
      setConnectionStatus('disconnected');
      setWalletError(err.message || 'Unknown wallet connection error');
      logger.error(err, 'Failed to connect wallet');
      throw err;
    }
  }, []);

  const getProviders = useCallback(async (api: ConnectedAPI): Promise<VotingProviders> => {
    const zkConfigPath = window.location.origin;
    const keyMaterialProvider = new FetchZkConfigProvider<VotingCircuitKeys>(zkConfigPath, fetch.bind(window));
    const config = await api.getConfiguration();
    const inMemoryVotingPrivateStateProvider = inMemoryPrivateStateProvider<string, VotingPrivateState>();
    const shieldedAddresses = await api.getShieldedAddresses();

    return {
      privateStateProvider: inMemoryVotingPrivateStateProvider,
      zkConfigProvider: keyMaterialProvider,
      proofProvider: httpClientProofProvider(config.proverServerUri!, keyMaterialProvider),
      publicDataProvider: indexerPublicDataProvider(config.indexerUri, config.indexerWsUri),
      walletProvider: {
        getCoinPublicKey(): string {
          return shieldedAddresses.shieldedCoinPublicKey;
        },
        getEncryptionPublicKey(): string {
          return shieldedAddresses.shieldedEncryptionPublicKey;
        },
        balanceTx: async (tx: UnboundTransaction, ttl?: Date): Promise<FinalizedTransaction> => {
          try {
            logger.info({ tx, ttl }, 'Balancing transaction via wallet');
            setIsGeneratingProof(true);
            const serializedTx = toHex(tx.serialize());
            const received = await api.balanceUnsealedTransaction(serializedTx);
            return Transaction.deserialize<SignatureEnabled, Proof, Binding>(
              'signature',
              'proof',
              'binding',
              fromHex(received.tx),
            );
          } catch (e) {
            logger.error({ error: e }, 'Error balancing transaction via wallet');
            throw e;
          } finally {
            setIsGeneratingProof(false);
          }
        },
      },
      midnightProvider: {
        submitTx: async (tx: FinalizedTransaction): Promise<TransactionId> => {
          const txHex = toHex(tx.serialize());
          await api.submitTransaction(txHex);
          const txIdentifiers = tx.identifiers();
          const txId = txIdentifiers[0];
          setTxHash(txId);
          logger.info({ txIdentifiers }, 'Submitted transaction via wallet');
          return txId;
        },
      },
    };
  }, []);

  const resolveContract = useCallback(async (descriptionOrAddress?: string) => {
    if (!connectedAPI) {
      throw new Error('Please connect your Lace wallet first.');
    }

    setIsWorking(true);
    setTxError(null);
    setTxSuccess(null);
    setTxHash(null);

    try {
      const providers = await getProviders(connectedAPI);
      let api: DeployedVotingAPI;

      if (descriptionOrAddress && descriptionOrAddress.length > 50) {
        api = await VotingAPI.join(providers, descriptionOrAddress, logger);
      } else {
        const desc = descriptionOrAddress || "Default Private Poll";
        api = await VotingAPI.deploy(providers, desc, logger);
      }

      setDeployedAPI(api);
      setContractAddress(api.deployedContractAddress);
      localStorage.setItem('midnight_contract_address', api.deployedContractAddress);
    } catch (err: any) {
      setTxError(err.message || 'Error deploying/joining contract');
      throw err;
    } finally {
      setIsWorking(false);
    }
  }, [connectedAPI, getProviders]);

  // Restore session
  useEffect(() => {
    const savedAddress = localStorage.getItem('midnight_wallet_address');
    if (savedAddress) {
      connectWallet()
        .then((api) => {
          const savedContract = localStorage.getItem('midnight_contract_address');
          if (savedContract && api) {
            setIsWorking(true);
            getProviders(api)
              .then((providers) => VotingAPI.join(providers, savedContract, logger))
              .then((apiInstance) => {
                setDeployedAPI(apiInstance);
                setContractAddress(apiInstance.deployedContractAddress);
              })
              .catch((err) => {
                logger.error(err, 'Failed to auto-restore contract session');
              })
              .finally(() => {
                setIsWorking(false);
              });
          }
        })
        .catch((err) => {
          logger.error(err, 'Failed to auto-reconnect wallet');
        });
    }
  }, []);

  // Subscribe to contract changes
  useEffect(() => {
    if (!deployedAPI) return;
    const subscription = deployedAPI.state$.subscribe({
      next: (state) => {
        setVotingState(state);
      },
      error: (err) => {
        logger.error(err, 'Contract state stream error');
        setTxError(err.message || String(err));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [deployedAPI]);

  const castVote = useCallback(async (choice: Choice) => {
    if (!deployedAPI) throw new Error('Contract not initialized');
    setIsWorking(true);
    setTxError(null);
    setTxSuccess(null);
    setTxHash(null);

    try {
      await deployedAPI.vote(choice);
      setTxSuccess(true);
    } catch (err: any) {
      setTxSuccess(false);
      setTxError(err.message || 'Transaction failed during circuit call');
      throw err;
    } finally {
      setIsWorking(false);
    }
  }, [deployedAPI]);

  return (
    <MidnightContext.Provider
      value={{
        walletAddress,
        network,
        connectionStatus,
        walletError,
        connectWallet,
        disconnectWallet,
        contractAddress,
        isWorking,
        isGeneratingProof,
        txHash,
        txSuccess,
        txError,
        votingState,
        resolveContract,
        castVote,
      }}
    >
      {children}
    </MidnightContext.Provider>
  );
};

export const useMidnight = () => {
  const context = useContext(MidnightContext);
  if (!context) {
    throw new Error('useMidnight must be used within a MidnightProvider');
  }
  return context;
};
