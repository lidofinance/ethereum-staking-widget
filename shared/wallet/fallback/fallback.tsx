import { useDappStatus } from 'modules/web3';
import { wagmiChainMap } from 'modules/web3/web3-provider/web3-provider';
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
    config: { defaultChain },
  } = useConfig();
  const { isWalletConnected, walletChainId, isSupportedChain, setChainId } =
    useDappStatus();
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
        <ButtonStyle size={'xs'} onClick={() => setChainId(defaultChain)}>
          Switch to {wagmiChainMap[defaultChain].name}
        </ButtonStyle>
      </FallbackWalletStyle>
    );
  }

  if (!isWalletConnected) return null;

  return children;
};
