import { FaqPlaceholder } from 'features/ipfs';
import NoSSRWrapper from 'shared/components/no-ssr-wrapper';
import { OnlyInfraRender } from 'shared/components/only-infra-render';
import { AprDisclaimer } from 'shared/components/apr-disclaimer/apr-disclaimer';

import { StakeFaq } from './stake-faq/stake-faq';
import { LidoStats } from './lido-stats/lido-stats';
import { StakeForm } from './stake-form';

export const Stake = () => {
  return (
    <>
      <NoSSRWrapper>
        <StakeForm />
      </NoSSRWrapper>
      <LidoStats />
      <OnlyInfraRender renderIPFS={<FaqPlaceholder />}>
        <StakeFaq />
      </OnlyInfraRender>
      <AprDisclaimer />
    </>
  );
};
