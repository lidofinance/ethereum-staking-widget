import { useDappStatus } from 'modules/web3';
import { LIDO_MULTICHAIN_CHAINS } from 'consts/chains';
import { WalletCardComponent } from 'shared/wallet/card/types';
import { useConfig } from 'config';

import { useErrorMessage } from './useErrorMessage';
import { LidoMultichainFallback } from './lido-multichain-fallback';
import { FallbackWalletStyle, TextStyle } from './styles';

type FallbackProps = React.ComponentProps<WalletCardComponent> & {
  showMultichainBanner?: boolean;
  toActionText?: string;
  error?: string;
  // text of the Lido Multichain banner instead of the default one
  multichainMessage?: React.ReactNode;
};
export const Fallback = ({
  showMultichainBanner = true,
  children,
  toActionText,
  error: errorProp,
  multichainMessage,
  ...props
}: FallbackProps) => {
  const { multiChainBanner } = useConfig().externalConfig;
  const { isWalletConnected, walletChainId, isSupportedChain } =
    useDappStatus();
  let error = useErrorMessage(toActionText);

  const isLidoMultichain =
    !!walletChainId &&
    !!LIDO_MULTICHAIN_CHAINS[walletChainId] &&
    !isSupportedChain &&
    multiChainBanner.includes(walletChainId);

  if (errorProp) error = errorProp;

  if (showMultichainBanner && isLidoMultichain) {
    return (
      <LidoMultichainFallback
        textEnding={toActionText ?? ''}
        message={multichainMessage}
        {...props}
      />
    );
  }

  if (error) {
    return (
      <FallbackWalletStyle {...props}>
        <TextStyle>{error}</TextStyle>
      </FallbackWalletStyle>
    );
  }

  if (!isWalletConnected) return null;

  return children;
};
