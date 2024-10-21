import { WalletCardComponent } from 'shared/wallet/card/types';

import { FallbackWalletStyle, TextStyle } from './styles';
import { useErrorMessage } from './useErrorMessage';
import { useDappStatus } from 'modules/web3';
import { LidoMultichainFallback } from '../lido-multichain-fallback/lido-multichain-fallback';

type FallbackProps = React.ComponentProps<WalletCardComponent> & {
  showMultichainBanner?: boolean;
  toActionText?: string;
  error?: string;
};
export const Fallback = ({
  showMultichainBanner = true,
  children,
  toActionText,
  error,
  ...props
}: FallbackProps) => {
  const { isLidoMultichainChain, isWalletConnected } = useDappStatus();
  let errorMessage = useErrorMessage();
  if (error) errorMessage = error;

  if (showMultichainBanner && isLidoMultichainChain) {
    return (
      <LidoMultichainFallback textEnding={toActionText ?? ''} {...props} />
    );
  }

  if (error) {
    return (
      <FallbackWalletStyle {...props}>
        <TextStyle>{errorMessage}</TextStyle>
      </FallbackWalletStyle>
    );
  }

  if (!isWalletConnected) return null;

  return children;
};
