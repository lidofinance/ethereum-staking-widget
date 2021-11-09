import { FC, useCallback } from 'react';
import { useConnectorLedger } from '@lido-sdk/web3-react';
import { LedgerCircle, LedgerCircleInversion } from '@lidofinance/icons';
import { useThemeToggle } from 'shared/hooks';
import { ConnectWalletProps } from './types';
import ConnectButton from './connectButton';

const ConnectLedger: FC<ConnectWalletProps> = (props) => {
  const { onConnect, disabled, ...rest } = props;
  const { connect } = useConnectorLedger();
  const { themeName } = useThemeToggle();

  const handleConnect = useCallback(async () => {
    onConnect?.();
    connect?.();
  }, [onConnect, connect]);

  return (
    <ConnectButton
      {...rest}
      disabled={disabled || !connect}
      iconSrcOrReactElement={
        themeName === 'dark' ? <LedgerCircleInversion /> : <LedgerCircle />
      }
      onClick={handleConnect}
    >
      Ledger
    </ConnectButton>
  );
};

export default ConnectLedger;
