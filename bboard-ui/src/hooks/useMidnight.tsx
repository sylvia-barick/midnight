import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { type ContractAddress, toHex, fromHex } from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';
import { type BBoardDerivedState, type DeployedBBoardAPI, BBoardAPI, type BBoardProviders, type BBoardCircuitKeys } from '../../../api/src/index';
import { ConnectedAPI, type InitialAPI } from '@midnight-ntwrk/dapp-connector-api';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { inMemoryPrivateStateProvider } from '../in-memory-private-state-provider';
import { BBoardPrivateState, createBBoardPrivateState } from '../../../contract/src/witnesses';
import { bboardPrivateStateKey } from '../../../api/src/common-types';
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
  boardState: BBoardDerivedState | null;

  // Contract actions
  resolveContract: (address?: string) => Promise<void>;
  postMessage: (message: string) => Promise<void>;
  takeDownMessage: () => Promise<void>;
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
  const [boardState, setBoardState] = useState<BBoardDerivedState | null>(null);

  const [connectedAPI, setConnectedAPI] = useState<ConnectedAPI | null>(null);
  const [deployedAPI, setDeployedAPI] = useState<DeployedBBoardAPI | null>(null);

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
    setBoardState(null);
    setTxHash(null);
    setTxSuccess(null);
    setTxError(null);
  }, []);

  const connectWallet = useCallback(async () => {
    setConnectionStatus('connecting');
    setWalletError(null);
    const targetNetwork = (import.meta.env.VITE_NETWORK_ID || 'preprod') as NetworkId;

    try {
      // 1. Wait for window.midnight to be injected (up to 2 seconds)
      let wallet: InitialAPI | undefined = undefined;
      for (let i = 0; i < 20; i++) {
        wallet = getFirstCompatibleWallet();
        if (wallet) break;
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      if (!wallet) {
        throw new Error('Midnight Lace wallet not detected. Please ensure the extension is installed and enabled.');
      }

      // 2. Connect to the target network
      let api: ConnectedAPI;
      try {
        api = await wallet.connect(targetNetwork);
      } catch (connectErr: any) {
        logger.error(connectErr, 'Error connecting to wallet');
        // Check if user rejected or network mismatch
        if (connectErr.message && connectErr.message.toLowerCase().includes('network')) {
          throw new Error(`Network Mismatch: Please check your Lace Wallet configuration and ensure network is set to ${targetNetwork}.`);
        }
        throw new Error(connectErr.message || 'Lace Wallet connection was rejected or failed.');
      }

      // 3. Retrieve shielded key and settings
      const shieldedAddresses = await api.getShieldedAddresses();
      
      setConnectedAPI(api);
      setWalletAddress(shieldedAddresses.shieldedCoinPublicKey);
      setNetwork(targetNetwork);
      setConnectionStatus('connected');
      
      // Save session info
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

  const getProviders = useCallback(async (api: ConnectedAPI): Promise<BBoardProviders> => {
    const zkConfigPath = window.location.origin;
    const keyMaterialProvider = new FetchZkConfigProvider<BBoardCircuitKeys>(zkConfigPath, fetch.bind(window));
    const config = await api.getConfiguration();
    const inMemoryBBoardPrivateStateProvider = inMemoryPrivateStateProvider<string, BBoardPrivateState>();
    const shieldedAddresses = await api.getShieldedAddresses();

    return {
      privateStateProvider: inMemoryBBoardPrivateStateProvider,
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

  const resolveContract = useCallback(async (address?: string) => {
    if (!connectedAPI) {
      throw new Error('Please connect your Lace wallet first.');
    }

    setIsWorking(true);
    setTxError(null);
    setTxSuccess(null);
    setTxHash(null);

    try {
      const providers = await getProviders(connectedAPI);
      let api: DeployedBBoardAPI;

      if (address) {
        api = await BBoardAPI.join(providers, address, logger);
      } else {
        api = await BBoardAPI.deploy(providers, logger);
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

  // Restore wallet session & active contract connection on reload
  useEffect(() => {
    const savedAddress = localStorage.getItem('midnight_wallet_address');
    if (savedAddress) {
      connectWallet()
        .then((api) => {
          const savedContract = localStorage.getItem('midnight_contract_address');
          if (savedContract && api) {
            // Re-resolve/join contract in the background
            setIsWorking(true);
            getProviders(api)
              .then((providers) => BBoardAPI.join(providers, savedContract, logger))
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

  // Subscribe to contract state changes
  useEffect(() => {
    if (!deployedAPI) return;
    const subscription = deployedAPI.state$.subscribe({
      next: (state) => {
        setBoardState(state);
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

  const postMessage = useCallback(async (message: string) => {
    if (!deployedAPI) throw new Error('Contract not initialized');
    setIsWorking(true);
    setTxError(null);
    setTxSuccess(null);
    setTxHash(null);

    try {
      await deployedAPI.post(message);
      setTxSuccess(true);
    } catch (err: any) {
      setTxSuccess(false);
      setTxError(err.message || 'Transaction failed during circuit call');
      throw err;
    } finally {
      setIsWorking(false);
    }
  }, [deployedAPI]);

  const takeDownMessage = useCallback(async () => {
    if (!deployedAPI) throw new Error('Contract not initialized');
    setIsWorking(true);
    setTxError(null);
    setTxSuccess(null);
    setTxHash(null);

    try {
      await deployedAPI.takeDown();
      setTxSuccess(true);
    } catch (err: any) {
      setTxSuccess(false);
      setTxError(err.message || 'Transaction failed during takeDown circuit call');
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
        boardState,
        resolveContract,
        postMessage,
        takeDownMessage,
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
