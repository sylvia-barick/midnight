import { useMidnight } from './useMidnight';
import { NetworkService } from '../services/network.service';

export const useNetwork = () => {
  const { network, connectWallet } = useMidnight();
  const isWrongNetwork = network !== null && !NetworkService.isCorrectNetwork(network);
  const requiredNetwork = NetworkService.getRequiredNetwork();

  return {
    network,
    isWrongNetwork,
    requiredNetwork,
    reconnect: connectWallet,
  };
};
