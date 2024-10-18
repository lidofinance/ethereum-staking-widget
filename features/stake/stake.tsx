import { FaqPlaceholder } from 'features/ipfs';
import { useWagmiKey } from 'modules/web3';
import NoSSRWrapper from 'shared/components/no-ssr-wrapper';
import { OnlyInfraRender } from 'shared/components/only-infra-render';

import { StakeFaq } from './stake-faq/stake-faq';
import { LidoStats } from './lido-stats/lido-stats';
import { StakeForm } from './stake-form';

export const Stake = () => {
  const key = useWagmiKey();

  return (
    <>
      <NoSSRWrapper>
        <StakeForm key={key} />
      </NoSSRWrapper>
      <LidoStats />
      <OnlyInfraRender renderIPFS={<FaqPlaceholder />}>
        <StakeFaq />
      </OnlyInfraRender>
    </>
  );
};
