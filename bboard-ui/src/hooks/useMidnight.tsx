import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { type ContractAddress, toHex, fromHex } from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';
import { type NotesDerivedState, type DeployedNotesAPI, NotesAPI, type NotesProviders, type NotesCircuitKeys } from '../../../api/src/index';
import { ConnectedAPI, type InitialAPI } from '@midnight-ntwrk/dapp-connector-api';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { inMemoryPrivateStateProvider } from '../in-memory-private-state-provider';
import { NotesPrivateState, createNotesPrivateState } from '../../../contract/src/witnesses';
import { notesPrivateStateKey } from '../../../api/src/common-types';
import { NetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { logger } from '../main';
import { type FinalizedTransaction, Transaction, SignatureEnabled, Proof, Binding, TransactionId } from '@midnight-ntwrk/midnight-js-protocol/ledger';
import type { UnboundTransaction } from '@midnight-ntwrk/midnight-js-types';
import * as utils from '../../../api/src/utils/index';
import { WalletService } from '../services/wallet.service';
import { NetworkService } from '../services/network.service';

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
  notesState: NotesDerivedState | null;

  // Actions
  resolveContract: (address?: string) => Promise<void>;
  createNote: (title: string, content: string) => Promise<void>;
  updateNote: (idHex: string, title: string, content: string) => Promise<void>;
  deleteNote: (idHex: string) => Promise<void>;
}

const MidnightContext = createContext<MidnightContextType | undefined>(undefined);

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
  const [notesState, setNotesState] = useState<NotesDerivedState | null>({ notes: [] });

  const [connectedAPI, setConnectedAPI] = useState<ConnectedAPI | null>(null);
  const [deployedAPI, setDeployedAPI] = useState<DeployedNotesAPI | null>(null);

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
    setNotesState({ notes: [] });
    setTxHash(null);
    setTxSuccess(null);
    setTxError(null);
  }, []);

  const connectWallet = useCallback(async () => {
    setConnectionStatus('connecting');
    setWalletError(null);
    const targetNetwork = NetworkService.getRequiredNetwork();

    try {
      const api = await WalletService.connect(targetNetwork);
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

  const getProviders = useCallback(async (api: ConnectedAPI): Promise<NotesProviders> => {
    const zkConfigPath = window.location.origin;
    const keyMaterialProvider = new FetchZkConfigProvider<NotesCircuitKeys>(zkConfigPath, fetch.bind(window));
    const config = await api.getConfiguration();
    
    // Custom private state provider that persists private states locally in localStorage
    const inMemoryNotesPrivateStateProvider = inMemoryPrivateStateProvider<string, NotesPrivateState>();
    
    // Wrap set/get to persist private state across page reloads
    const originalSet = inMemoryNotesPrivateStateProvider.set.bind(inMemoryNotesPrivateStateProvider);
    const originalGet = inMemoryNotesPrivateStateProvider.get.bind(inMemoryNotesPrivateStateProvider);
    
    inMemoryNotesPrivateStateProvider.set = async (key, state) => {
      await originalSet(key, state);
      // Persist to localStorage
      const address = localStorage.getItem('midnight_contract_address') || '0000000000000000000000000000000000000000000000000000000000000000';
      localStorage.setItem(`midnight_private_state_${address}_${key}`, JSON.stringify({
        secretKey: toHex(state.secretKey),
        notes: state.notes,
      }));
    };

    inMemoryNotesPrivateStateProvider.get = async (key) => {
      const address = localStorage.getItem('midnight_contract_address') || '0000000000000000000000000000000000000000000000000000000000000000';
      const stored = localStorage.getItem(`midnight_private_state_${address}_${key}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const state = {
            secretKey: fromHex(parsed.secretKey),
            notes: parsed.notes,
          };
          await originalSet(key, state);
          return state;
        } catch (e) {
          logger.error(e, 'Error restoring private state from localStorage');
        }
      }
      return await originalGet(key);
    };

    const shieldedAddresses = await api.getShieldedAddresses();

    return {
      privateStateProvider: inMemoryNotesPrivateStateProvider,
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
      throw new Error('Please connect your wallet first.');
    }

    setIsWorking(true);
    setTxError(null);
    setTxSuccess(null);
    setTxHash(null);

    try {
      const providers = await getProviders(connectedAPI);
      let api: DeployedNotesAPI;

      if (address && address.length > 50) {
        api = await NotesAPI.join(providers, address, logger);
      } else {
        api = await NotesAPI.deploy(providers, logger);
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
              .then((providers) => NotesAPI.join(providers, savedContract, logger))
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
        setNotesState(state);
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

  const createNote = useCallback(async (title: string, content: string) => {
    if (!deployedAPI) throw new Error('Contract not initialized');
    setIsWorking(true);
    setTxError(null);
    setTxSuccess(null);
    setTxHash(null);

    try {
      await deployedAPI.createNote(title, content);
      setTxSuccess(true);
    } catch (err: any) {
      setTxSuccess(false);
      setTxError(err.message || 'Transaction failed during circuit call');
      throw err;
    } finally {
      setIsWorking(false);
    }
  }, [deployedAPI]);

  const updateNote = useCallback(async (idHex: string, title: string, content: string) => {
    if (!deployedAPI) throw new Error('Contract not initialized');
    setIsWorking(true);
    setTxError(null);
    setTxSuccess(null);
    setTxHash(null);

    try {
      await deployedAPI.updateNote(idHex, title, content);
      setTxSuccess(true);
    } catch (err: any) {
      setTxSuccess(false);
      setTxError(err.message || 'Transaction failed during circuit call');
      throw err;
    } finally {
      setIsWorking(false);
    }
  }, [deployedAPI]);

  const deleteNote = useCallback(async (idHex: string) => {
    if (!deployedAPI) throw new Error('Contract not initialized');
    setIsWorking(true);
    setTxError(null);
    setTxSuccess(null);
    setTxHash(null);

    try {
      await deployedAPI.deleteNote(idHex);
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
        notesState,
        resolveContract,
        createNote,
        updateNote,
        deleteNote,
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
