import { FaqPlaceholder } from 'features/ipfs';
import { useWeb3Key } from 'shared/hooks/useWeb3Key';
import NoSSRWrapper from 'shared/components/no-ssr-wrapper';
import { GoerliSunsetBanner } from 'shared/banners/goerli-sunset';
import { OnlyInfraRender } from 'shared/components/only-infra-render';

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
      <OnlyInfraRender placeholder={<FaqPlaceholder />}>
        <StakeFaq />
      </OnlyInfraRender>
    </>
  );
};
