import { FC, useCallback } from 'react';
import { helpers, useConnectorCoin98 } from '@lido-sdk/web3-react';
import { Coin98Circle } from '@lidofinance/icons';
import { ConnectWalletProps } from './types';
import ConnectButton from './connectButton';

const disabledMessage =
  'Your browser has a turned-on “MathWallet”' +
  ' extension. Please, turn off this extension to enable the Coin98 wallet.';

const ConnectCoin98: FC<ConnectWalletProps> = (props) => {
  const { onConnect, termsChecked, ...rest } = props;
  const { isMathWalletProvider } = helpers;
  const { connect } = useConnectorCoin98();

  const handleConnect = useCallback(async () => {
    onConnect?.();
    connect();
  }, [onConnect, connect]);

  const disabled = props.disabled || isMathWalletProvider();

  return (
    <ConnectButton
      {...rest}
      disabled={disabled}
      isTooltipTriggerShown={termsChecked && disabled}
      tooltipMessage={disabledMessage}
      iconSrcOrReactElement={<Coin98Circle />}
      onClick={handleConnect}
    >
      Coin98
    </ConnectButton>
  );
};

export default ConnectCoin98;
