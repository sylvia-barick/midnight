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
import { type Observable, firstValueFrom, interval, throwError } from 'rxjs';
import { map, filter, take, timeout, concatMap, tap, catchError } from 'rxjs/operators';
import { pipe as fnPipe } from 'fp-ts/function';
import semver from 'semver';
import { logger } from '../main';
import { type FinalizedTransaction, Transaction, SignatureEnabled, Proof, Binding, TransactionId } from '@midnight-ntwrk/midnight-js-protocol/ledger';
import type { UnboundTransaction } from '@midnight-ntwrk/midnight-js-types';
import * as utils from '../../../api/src/utils/index';

const COMPATIBLE_CONNECTOR_API_VERSION = '4.x';

export type WalletConnectionStatus = 'disconnected' | 'connecting' | 'connected';

export interface MidnightContextType {
  // Wallet state
  walletAddress: string | null;
  network: NetworkId | null;
  connectionStatus: WalletConnectionStatus;
  walletError: string | null;
  connectWallet: () => Promise<void>;
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

  // Restore wallet session if possible
  useEffect(() => {
    const savedAddress = localStorage.getItem('midnight_wallet_address');
    const savedNetwork = localStorage.getItem('midnight_network');
    if (savedAddress && savedNetwork) {
      setWalletAddress(savedAddress);
      setNetwork(savedNetwork as NetworkId);
      setConnectionStatus('connected');
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    localStorage.removeItem('midnight_wallet_address');
    localStorage.removeItem('midnight_network');
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
      const api = await firstValueFrom(
        fnPipe(
          interval(100),
          map(() => getFirstCompatibleWallet()),
          tap((connectorAPI) => {
            logger.info(connectorAPI, 'Check for wallet connector API');
          }),
          filter((connectorAPI): connectorAPI is InitialAPI => !!connectorAPI),
          tap((connectorAPI) => {
            logger.info(connectorAPI, 'Compatible wallet connector API found. Connecting.');
          }),
          take(1),
          timeout({
            first: 2000,
            with: () =>
              throwError(() => {
                logger.error('Could not find wallet connector API');
                return new Error('Midnight Lace wallet not installed. Please install the browser extension.');
              }),
          }),
          concatMap(async (initialAPI) => {
            try {
              const connectedAPI = await initialAPI.connect(targetNetwork);
              return connectedAPI;
            } catch (e) {
              logger.error(e, 'User rejected or error connecting to wallet');
              throw new Error('Wallet connection rejected by user.');
            }
          }),
          timeout({
            first: 10000,
            with: () =>
              throwError(() => {
                logger.error('Wallet connector API has failed to respond');
                return new Error('Midnight Lace wallet connection timeout. Is the extension enabled?');
              }),
          }),
          catchError((error) =>
            throwError(() => {
              logger.error('Unable to enable connector API' + error);
              return error instanceof Error ? error : new Error(String(error));
            })
          )
        )
      );

      const shieldedAddresses = await api.getShieldedAddresses();
      const walletConfig = await api.getConfiguration();

      setConnectedAPI(api);
      setWalletAddress(shieldedAddresses.shieldedCoinPublicKey);
      setNetwork(targetNetwork);
      setConnectionStatus('connected');
      
      // Save session
      localStorage.setItem('midnight_wallet_address', shieldedAddresses.shieldedCoinPublicKey);
      localStorage.setItem('midnight_network', targetNetwork);
    } catch (err: any) {
      setConnectionStatus('disconnected');
      setWalletError(err.message || 'Unknown wallet connection error');
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
    if (connectionStatus !== 'connected' || !connectedAPI) {
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
    } catch (err: any) {
      setTxError(err.message || 'Error deploying/joining contract');
      throw err;
    } finally {
      setIsWorking(false);
    }
  }, [connectedAPI, connectionStatus, getProviders]);

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
