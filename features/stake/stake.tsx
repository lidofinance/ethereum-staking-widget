import { useWeb3Key } from 'shared/hooks/useWeb3Key';
import NoSSRWrapper from 'shared/components/no-ssr-wrapper';

import { StakeFaq } from './stake-faq/stake-faq';
import { LidoStats } from './lido-stats/lido-stats';
import { StakeForm } from './stake-form';
import { GoerliSunsetBanner } from 'shared/banners/goerli-sunset';
import { OutdatedHashBanner } from 'features/ipfs/outdated-hash-banner';

export const Stake = () => {
  const key = useWeb3Key();
  return (
    <>
      <OutdatedHashBanner />
      <GoerliSunsetBanner />
      <NoSSRWrapper>
        <StakeForm key={key} />
      </NoSSRWrapper>
      <LidoStats />
      <StakeFaq />
    </>
  );
};
