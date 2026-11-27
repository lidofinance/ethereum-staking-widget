import { Button } from '@lidofinance/lido-app-ui';
import { useDappStatus } from 'modules/web3';
import styled from 'styled-components';
import { motionFade, toMotionState } from '../motion';
import { useConnectWallet } from 'shared/wallet/connect/use-connect-wallet';

type ConnectButtonProps = React.ComponentProps<typeof Button>;

const FadeInText = styled.span`
  ${motionFade()}
`;

export const ConnectButton = ({
  children,
  loading,
  onClick,
  disabled,
  type,
  ...props
}: ConnectButtonProps) => {
  const {
    isWalletResolving,
    isChainMatched,
    isConnecting,
    isWalletConnected,
    isSwitchChainPending,
    chainId,
    canSwitchChain,
    requestChangeChain,
  } = useDappStatus();
  const { handleConnect } = useConnectWallet();

  const showContent = !isWalletResolving;
  let buttonContent = children;
  let buttonLoading = loading ?? false;
  let buttonOnClick = onClick;
  let buttonDisabled = disabled ?? false;
  let buttonType = type;

  if (!isWalletConnected) {
    buttonContent = 'Connect Wallet';
    buttonLoading = showContent && isConnecting;
    buttonOnClick = isConnecting ? undefined : () => handleConnect();
    // connecting is not submitting, even inside a form
    buttonType = 'button';
  }

  if (!isChainMatched) {
    buttonContent = 'Switch Network';
    buttonLoading = isSwitchChainPending;
    buttonDisabled = !canSwitchChain;
    buttonOnClick = isSwitchChainPending
      ? undefined
      : () => requestChangeChain(chainId);
    buttonType = 'button';
  }

  const hackedPropsTyping = props as any;

  return (
    <Button
      fullWidth
      loading={buttonLoading}
      onClick={buttonOnClick}
      disabled={buttonDisabled}
      type={buttonType}
      {...hackedPropsTyping}
    >
      <FadeInText data-state={toMotionState(showContent)}>
        {buttonContent}
      </FadeInText>
    </Button>
  );
};
