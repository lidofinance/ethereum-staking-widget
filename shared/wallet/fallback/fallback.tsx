import { WalletCardComponent } from 'shared/wallet/card/types';
import { FallbackWalletStyle } from './styles';
import { useErrorMessage } from './useErrorMessage';

export const Fallback: WalletCardComponent = (props) => {
  const error = useErrorMessage();

  if (error) {
    return <FallbackWalletStyle {...props}>{error}</FallbackWalletStyle>;
  }

  return null;
};
