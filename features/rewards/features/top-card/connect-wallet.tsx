import { FC } from 'react';
import styled from 'styled-components';
import { Button } from '@lidofinance/lido-ui';

import { WalletCardStyle } from 'shared/wallet/card/styles';

const ConnectWalletStyle = styled(WalletCardStyle)`
  padding: 27px 27px 47px 27px;
  text-align: center;
  background: linear-gradient(48.34deg, #d2ddff -5.55%, #e6e6e6 100%);

  > p {
    color: var(--lido-color-secondary);
  }

  > p:not(:last-child) {
    margin-bottom: 12px;
  }
`;

export const ConnectWallet: FC = () => {
  return (
    <ConnectWalletStyle>
      <p>Connect your wallet to view staking stats</p>
      <Button color={'secondary'} variant={'outlined'} size={'sm'}>
        Connect wallet
      </Button>
    </ConnectWalletStyle>
  );
};
