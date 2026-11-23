import { FC } from 'react';
import { Button, ButtonProps } from '@lidofinance/lido-ui';

import { useConnectWallet } from './use-connect-wallet';

export const Connect: FC<ButtonProps> = (props) => {
  const { onClick, ...rest } = props;
  const { isWalletConnectionAllowed, handleConnect } = useConnectWallet();

  return (
    <Button
      disabled={!isWalletConnectionAllowed}
      onClick={handleConnect}
      data-testid="connectBtn"
      {...rest}
    >
      Connect wallet
    </Button>
  );
};
