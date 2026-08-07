import { InitialAPI, ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import { NetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import semver from 'semver';

const COMPATIBLE_CONNECTOR_API_VERSION = '4.x';

export class WalletService {
  static getFirstCompatibleWallet(): InitialAPI | undefined {
    if (typeof window === 'undefined' || !window.midnight) return undefined;
    return Object.values(window.midnight).find(
      (wallet): wallet is InitialAPI =>
        !!wallet &&
        typeof wallet === 'object' &&
        'apiVersion' in wallet &&
        semver.satisfies(wallet.apiVersion, COMPATIBLE_CONNECTOR_API_VERSION),
    );
  }

  static async connect(targetNetwork: NetworkId): Promise<ConnectedAPI> {
    let wallet: InitialAPI | undefined = undefined;
    for (let i = 0; i < 20; i++) {
      wallet = this.getFirstCompatibleWallet();
      if (wallet) break;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    if (!wallet) {
      throw new Error('Midnight 1AM wallet not detected. Please ensure the extension is installed and enabled.');
    }

    try {
      return await wallet.connect(targetNetwork);
    } catch (err: any) {
      if (err.message && err.message.toLowerCase().includes('network')) {
        throw new Error(`Network Mismatch: Please check your 1AM Wallet configuration and ensure network is set to ${targetNetwork}.`);
      }
      throw new Error(err.message || '1AM Wallet connection was rejected or failed.');
    }
  }
}
