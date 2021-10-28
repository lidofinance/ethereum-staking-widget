import { FC, useCallback } from 'react';
import { useConnectorMetamask, helpers } from '@lido-sdk/web3-react';
import iconUrl from 'assets/icons/metamask.svg';
import { ConnectWalletProps } from './types';
import ConnectButton from './connectButton';

const disabledMessage =
  'Your browser has a turned-on “Coin98 Wallet” or "MathWallet"' +
  ' extension. Please, turn off this extensions to enable the MetaMask wallet.';

const ConnectMetamask: FC<ConnectWalletProps> = (props) => {
  const { onConnect, termsChecked, ...rest } = props;
  const { connect } = useConnectorMetamask();

  const handleConnect = useCallback(async () => {
    onConnect?.();
    await connect();
  }, [onConnect, connect]);

  const disabled =
    props.disabled ||
    helpers.isCoin98Provider() ||
    helpers.isMathWalletProvider();

  return (
    <ConnectButton
      {...rest}
      disabled={disabled}
      isTooltipTriggerShown={termsChecked && disabled}
      tooltipMessage={disabledMessage}
      iconSrc={iconUrl}
      onClick={handleConnect}
    >
      Metamask
    </ConnectButton>
  );
};

export default ConnectMetamask;
