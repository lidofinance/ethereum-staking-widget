import { WalletCardComponent } from 'shared/wallet/card/types';

import { FallbackWalletStyle, TextStyle } from './styles';
import { useErrorMessage } from './useErrorMessage';

export const Fallback: WalletCardComponent = (props) => {
  const error = useErrorMessage();

  if (props.error || error) {
    return (
      <FallbackWalletStyle {...props}>
        <TextStyle>{props.error || error || ''}</TextStyle>
      </FallbackWalletStyle>
    );
  }

  return null;
};
