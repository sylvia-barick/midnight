import { useMidnight } from './useMidnight';

export const useDeployment = () => {
  const {
    contractAddress,
    isWorking,
    resolveContract,
    txHash,
    txSuccess,
    txError,
  } = useMidnight();

  return {
    deploy: () => resolveContract(),
    isDeploying: isWorking && !contractAddress,
    contractAddress,
    txHash,
    txSuccess,
    error: txError,
  };
};
