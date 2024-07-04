import { FC } from 'react';
import { useWeb3 } from 'reef-knot/web3-react';
import { useAccount } from 'wagmi';

import { StatsWrapper } from 'features/rewards/components/statsWrapper';
import { Stats } from 'features/rewards/components/stats';
import { Fallback } from 'shared/wallet';

import { Wallet } from './wallet';
import { ConnectWallet } from './connect-wallet';

export const TopCard: FC = () => {
  const { address } = useAccount();
  const { active } = useWeb3();

  return (
    <>
      {address ? active ? <Wallet /> : <Fallback /> : <ConnectWallet />}
      <StatsWrapper>
        <Stats />
      </StatsWrapper>
    </>
  );
};
