import { FC, useCallback } from 'react';
import { useConnectorTrust } from '@lido-sdk/web3-react';
import { TrustCircle } from '@lidofinance/icons';
import { ConnectWalletProps } from './types';
import ConnectButton from './connectButton';

const ConnectTrust: FC<ConnectWalletProps> = (props) => {
  const { onConnect, disabled, ...rest } = props;
  const { connect } = useConnectorTrust();

  const handleConnect = useCallback(async () => {
    onConnect?.();
    connect?.();
  }, [onConnect, connect]);

  return (
    <ConnectButton
      {...rest}
      disabled={disabled || !connect}
      iconSrcOrReactElement={<TrustCircle />}
      onClick={handleConnect}
    >
      Trust
    </ConnectButton>
  );
};

export default ConnectTrust;
