import { FC, useCallback } from 'react';
import { useConnectorImToken } from '@lido-sdk/web3-react';
import { ImtokenCircle } from '@lidofinance/icons';
import { ConnectWalletProps } from './types';
import ConnectButton from './connectButton';

const ConnectImToken: FC<ConnectWalletProps> = (props) => {
  const { onConnect, disabled, ...rest } = props;
  const { connect } = useConnectorImToken();

  const handleConnect = useCallback(async () => {
    onConnect?.();
    connect?.();
  }, [onConnect, connect]);

  return (
    <ConnectButton
      {...rest}
      disabled={disabled || !connect}
      iconSrcOrReactElement={<ImtokenCircle />}
      onClick={handleConnect}
    >
      imToken
    </ConnectButton>
  );
};

export default ConnectImToken;
