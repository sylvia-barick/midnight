import { useMidnight } from './useMidnight';

export const useWallet = () => {
  const {
    walletAddress,
    network,
    connectionStatus,
    walletError,
    connectWallet,
    disconnectWallet,
  } = useMidnight();

  return {
    walletAddress,
    network,
    connectionStatus,
    walletError,
    connectWallet,
    disconnectWallet,
    isConnected: connectionStatus === 'connected',
    isConnecting: connectionStatus === 'connecting',
    isDisconnected: connectionStatus === 'disconnected',
  };
};
