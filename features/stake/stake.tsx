import { useWeb3Key } from 'shared/hooks/useWeb3Key';
import NoSSRWrapper from 'shared/components/no-ssr-wrapper';

import { LidoStats } from './lido-stats/lido-stats';
import { StakeForm } from './stake-form';
import { GoerliSunsetBanner } from 'shared/banners/goerli-sunset';

export const Stake = () => {
  const key = useWeb3Key();
  return (
    <>
      <GoerliSunsetBanner />
      <NoSSRWrapper>
        <StakeForm key={key} />
      </NoSSRWrapper>
      <LidoStats />
    </>
  );
};
