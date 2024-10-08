import { useDappStatus } from 'shared/hooks/use-dapp-status';

export const useLidoMultichainFallbackCondition = () => {
  const { isLidoMultichainChain } = useDappStatus();
  const showLidoMultichainFallback = isLidoMultichainChain;

  return {
    showLidoMultichainFallback,
  };
};
