import { useConfig } from 'config';
import { useDappStatus } from 'shared/hooks/use-dapp-status';
import { CHAINS } from 'consts/chains';
import { overrideWithQAMockBoolean } from 'utils/qa';

export const useLidoMultichainFallbackCondition = () => {
  const { config } = useConfig();
  const { isLidoMultichainChain } = useDappStatus();

  // Display Lido Multichain banners only if defaultChain=Mainnet
  // Or via QA helpers override
  const isLidoMultichainFallbackEnabled = overrideWithQAMockBoolean(
    config.defaultChain === CHAINS.Mainnet,
    'mock-qa-helpers-show-lido-multichain-banners-on-testnet',
  );

  const showLidoMultichainFallback =
    isLidoMultichainChain && isLidoMultichainFallbackEnabled;

  return {
    showLidoMultichainFallback,
  };
};
