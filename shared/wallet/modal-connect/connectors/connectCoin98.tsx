import { FC, useCallback } from 'react';
import { helpers, useConnectorCoin98 } from '@lido-sdk/web3-react';
import iconUrl from 'assets/icons/coin98.svg';
import { ConnectWalletProps } from './types';
import ConnectButton from './connectButton';

const disabledMessage =
  'Your browser has a turned-on “MathWallet”' +
  ' extension. Please, turn off this extension to enable the Coin98 wallet.';

const ConnectCoin98: FC<ConnectWalletProps> = (props) => {
  const { onConnect, termsChecked, ...rest } = props;
  const { connect } = useConnectorCoin98();

  const handleConnect = useCallback(async () => {
    onConnect?.();
    connect();
  }, [onConnect, connect]);

  const disabled = props.disabled || helpers.isMathWalletProvider();

  return (
    <ConnectButton
      {...rest}
      disabled={disabled}
      isTooltipTriggerShown={termsChecked && disabled}
      tooltipMessage={disabledMessage}
      iconSrc={iconUrl}
      onClick={handleConnect}
    >
      Coin98
    </ConnectButton>
  );
};

export default ConnectCoin98;
