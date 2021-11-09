import { FC, useCallback } from 'react';
import { useConnectorMetamask, helpers } from '@lido-sdk/web3-react';
import iconUrl from 'assets/icons/metamask.svg';
import { ConnectWalletProps } from './types';
import ConnectButton from './connectButton';

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

  let conflictApp = '';
  if (disabled) {
    conflictApp = helpers.isCoin98Provider() ? 'Coin98 Wallet' : conflictApp;
    conflictApp = helpers.isMathWalletProvider() ? 'MathWallet' : conflictApp;
  }
  const disabledMessage =
    `Your browser has a turned-on “${conflictApp}” extension.` +
    ' Please, turn off this extension and reload the page' +
    ' to enable the MetaMask wallet.';

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
