import { useMidnight } from './useMidnight';

export const useContract = () => {
  const {
    contractAddress,
    isWorking,
    resolveContract,
    txError,
  } = useMidnight();

  return {
    contractAddress,
    isWorking,
    joinContract: (address: string) => resolveContract(address),
    error: txError,
  };
};
