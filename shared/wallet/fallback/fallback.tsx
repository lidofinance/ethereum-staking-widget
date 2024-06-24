import { useSDK } from '@lido-sdk/react';
import { CHAINS } from 'consts/chains';
import { WalletCardComponent } from 'shared/wallet/card/types';
import { FallbackWalletStyle, TextStyle, ButtonStyle } from './styles';
import { useErrorMessage } from './useErrorMessage';

export const Fallback: WalletCardComponent = (props) => {
  const error = useErrorMessage();
  const { supportedChainIds } = useSDK();

  // Show mainnet if there is in supportedChainIds
  let switchToChain;
  if (supportedChainIds.length === 0 || supportedChainIds.indexOf(1) > -1) {
    switchToChain = 'Mainnet';
  } else {
    switchToChain =
      Object.keys(CHAINS)[
        Object.values(CHAINS).indexOf(supportedChainIds[0] as unknown as CHAINS)
      ];
  }

  if (error) {
    return (
      <FallbackWalletStyle {...props}>
        <TextStyle>{error}</TextStyle>
        <ButtonStyle size={'xs'}>Switch to {switchToChain}</ButtonStyle>
      </FallbackWalletStyle>
    );
  }

  return null;
};
