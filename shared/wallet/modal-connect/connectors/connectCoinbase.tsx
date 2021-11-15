import { FC, useCallback } from 'react';
import { useConnectorCoinbase } from '@lido-sdk/web3-react';
import { Coinbase } from '@lidofinance/icons';
import { ConnectWalletProps } from './types';
import ConnectButton from './connectButton';

const ConnectCoinbase: FC<ConnectWalletProps> = (props) => {
  const { onConnect, ...rest } = props;
  const { connect } = useConnectorCoinbase();

  const handleConnect = useCallback(async () => {
    onConnect?.();
    await connect();
  }, [onConnect, connect]);

  return (
    <ConnectButton
      {...rest}
      iconSrcOrReactElement={<Coinbase />}
      onClick={handleConnect}
    >
      Coinbase Wallet
    </ConnectButton>
  );
};

export default ConnectCoinbase;
