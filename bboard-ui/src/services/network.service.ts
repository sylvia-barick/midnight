import { NetworkId } from '@midnight-ntwrk/midnight-js-network-id';

export class NetworkService {
  static getRequiredNetwork(): NetworkId {
    return (import.meta.env.VITE_NETWORK_ID || 'preprod') as NetworkId;
  }

  static isCorrectNetwork(currentNetwork: NetworkId | null): boolean {
    if (!currentNetwork) return false;
    return currentNetwork === this.getRequiredNetwork();
  }
}
