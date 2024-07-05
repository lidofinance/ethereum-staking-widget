import { WalletCardComponent } from 'shared/wallet/card/types';

import { FallbackWalletStyle, TextStyle } from './styles';
import { useErrorMessage } from './useErrorMessage';

export const Fallback: WalletCardComponent = (props) => {
  const error = useErrorMessage();

  if (error) {
    return (
      <FallbackWalletStyle {...props}>
        <TextStyle>{error}</TextStyle>
      </FallbackWalletStyle>
    );
  }

  return null;
};
