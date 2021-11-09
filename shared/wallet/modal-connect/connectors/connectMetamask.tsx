import { FC, useCallback } from 'react';
import { useConnectorMetamask, helpers } from '@lido-sdk/web3-react';
import { MetaMaskCircle, MetaMaskCircleInversion } from '@lidofinance/icons';
import { useThemeToggle } from 'shared/hooks';
import { ConnectWalletProps } from './types';
import ConnectButton from './connectButton';

const ConnectMetamask: FC<ConnectWalletProps> = (props) => {
  const { onConnect, termsChecked, ...rest } = props;
  const { isCoin98Provider, isMathWalletProvider } = helpers;
  const { connect } = useConnectorMetamask();
  const { themeName } = useThemeToggle();

  const handleConnect = useCallback(async () => {
    onConnect?.();
    await connect();
  }, [onConnect, connect]);

  const disabled =
    props.disabled || isCoin98Provider() || isMathWalletProvider();

  let conflictApp = '';
  if (disabled) {
    conflictApp = isCoin98Provider() ? 'Coin98 Wallet' : conflictApp;
    conflictApp = isMathWalletProvider() ? 'MathWallet' : conflictApp;
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
      iconSrcOrReactElement={
        themeName === 'dark' ? <MetaMaskCircleInversion /> : <MetaMaskCircle />
      }
      onClick={handleConnect}
    >
      Metamask
    </ConnectButton>
  );
};

export default ConnectMetamask;
