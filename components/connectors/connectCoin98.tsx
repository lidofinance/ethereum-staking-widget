import { FC, useCallback } from 'react';
import { useConnectorCoin98 } from '@lido-sdk/web3-react';
import iconUrl from 'assets/icons/coin98.svg';
import { ConnectWalletProps } from './types';
import ConnectButton from './connectButton';

const ConnectCoin98: FC<ConnectWalletProps> = (props) => {
  const { onConnect, ...rest } = props;
  const { connect } = useConnectorCoin98();

  const handleConnect = useCallback(async () => {
    onConnect?.();
    connect();
  }, [onConnect, connect]);

  return (
    <ConnectButton {...rest} iconSrc={iconUrl} onClick={handleConnect}>
      Coin98
    </ConnectButton>
  );
};

export default ConnectCoin98;
