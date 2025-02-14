import { useDappStatus } from 'modules/web3';
import { useConfig } from 'config';
import { LIDO_MULTICHAIN_CHAINS } from 'consts/chains';
import { WalletCardComponent } from 'shared/wallet/card/types';

import { useErrorMessage } from './useErrorMessage';
import { LidoMultichainFallback } from './lido-multichain-fallback';
import { ButtonStyle, FallbackWalletStyle, TextStyle } from './styles';

type FallbackProps = React.ComponentProps<WalletCardComponent> & {
  showMultichainBanner?: boolean;
  toActionText?: string;
  error?: string;
};
export const Fallback = ({
  showMultichainBanner = true,
  children,
  toActionText,
  error: errorProp,
  ...props
}: FallbackProps) => {
  const {
    externalConfig: { multiChainBanner },
  } = useConfig();
  const {
    isWalletConnected,
    walletChainId,
    isSupportedChain,
    switchChainId,
    wagmiDefaultChain,
  } = useDappStatus();
  let error = useErrorMessage();

  const isLidoMultichain =
    !!walletChainId &&
    !!LIDO_MULTICHAIN_CHAINS[walletChainId] &&
    !isSupportedChain &&
    multiChainBanner.includes(walletChainId);

  if (errorProp) error = errorProp;

  if (showMultichainBanner && isLidoMultichain) {
    return (
      <LidoMultichainFallback textEnding={toActionText ?? ''} {...props} />
    );
  }

  if (error) {
    return (
      <FallbackWalletStyle {...props}>
        <TextStyle>{error}</TextStyle>
        <ButtonStyle
          size={'xs'}
          onClick={async () => {
            try {
              await switchChainId(wagmiDefaultChain.id);
            } catch (err) {
              console.warn(`[fallback.tsx] ${err}`);
            }
          }}
        >
          Switch to {wagmiDefaultChain.name}
        </ButtonStyle>
      </FallbackWalletStyle>
    );
  }

  if (!isWalletConnected) return null;

  return children;
};
