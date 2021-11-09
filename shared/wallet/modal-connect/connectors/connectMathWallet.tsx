import { FC, useCallback } from 'react';
import { ConnectWalletProps } from './types';
import ConnectButton from './connectButton';
import {
  MathWalletCircle,
  MathWalletCircleInversion,
} from '@lidofinance/icons';
import { useThemeToggle } from 'shared/hooks';
import { useConnectorMathWallet } from '@lido-sdk/web3-react';

const ConnectMathWallet: FC<ConnectWalletProps> = (props) => {
  const { onConnect, ...rest } = props;
  const { connect } = useConnectorMathWallet();
  const { themeName } = useThemeToggle();

  const handleConnect = useCallback(async () => {
    onConnect?.();
    connect();
  }, [onConnect, connect]);

  return (
    <ConnectButton
      {...rest}
      iconSrcOrReactElement={
        themeName === 'dark' ? (
          <MathWalletCircleInversion />
        ) : (
          <MathWalletCircle />
        )
      }
      onClick={handleConnect}
    >
      MathWallet
    </ConnectButton>
  );
};

export default ConnectMathWallet;
