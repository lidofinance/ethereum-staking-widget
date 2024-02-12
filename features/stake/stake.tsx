import { dynamics } from 'config';
import { useWeb3Key } from 'shared/hooks/useWeb3Key';
import NoSSRWrapper from 'shared/components/no-ssr-wrapper';
import { GoerliSunsetBanner } from 'shared/banners/goerli-sunset';

import { StakeFaq } from './stake-faq/stake-faq';
import { LidoStats } from './lido-stats/lido-stats';
import { StakeForm } from './stake-form';

export const Stake = () => {
  const key = useWeb3Key();
  return (
    <>
      <GoerliSunsetBanner />
      <NoSSRWrapper>
        <StakeForm key={key} />
      </NoSSRWrapper>
      <LidoStats />
      {!dynamics.ipfsMode && <StakeFaq />}
    </>
  );
};
