import { useMemo } from 'react';
import { useSwitchChain } from 'wagmi';
import { mainnet } from '@wagmi/core/chains';

import { useUserConfig } from 'config/user-config';
import { WalletCardComponent } from 'shared/wallet/card/types';

import { FallbackWalletStyle, TextStyle, ButtonStyle } from './styles';
import { useErrorMessage } from './useErrorMessage';

export const Fallback: WalletCardComponent = (props) => {
  const { chains, switchChain } = useSwitchChain();
  const { defaultChain: defaultChainId } = useUserConfig();
  const error = useErrorMessage();

  const switchToChain = useMemo(() => {
    const foundChain = chains.find((obj) => obj.id === defaultChainId);
    return !foundChain ? mainnet : foundChain;
  }, [chains, defaultChainId]);

  if (error) {
    return (
      <FallbackWalletStyle {...props}>
        <TextStyle>{error}</TextStyle>
        <ButtonStyle
          size={'xs'}
          onClick={() => switchChain({ chainId: switchToChain.id })}
        >
          Switch to {switchToChain.name}
        </ButtonStyle>
      </FallbackWalletStyle>
    );
  }

  return null;
};
