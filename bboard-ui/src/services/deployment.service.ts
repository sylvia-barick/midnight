export type DeploymentStatus = 'idle' | 'deploying' | 'success' | 'failure';

export interface DeploymentState {
  status: DeploymentStatus;
  contractAddress: string | null;
  txHash: string | null;
  error: string | null;
}

export class DeploymentService {
  static saveDeployedAddress(address: string): void {
    localStorage.setItem('midnight_contract_address', address);
  }

  static getDeployedAddress(): string | null {
    return localStorage.getItem('midnight_contract_address');
  }

  static clearDeployedAddress(): void {
    localStorage.removeItem('midnight_contract_address');
  }
}
