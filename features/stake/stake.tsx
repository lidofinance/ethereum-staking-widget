import { FaqPlaceholder } from 'features/ipfs';
import { useWagmiKey } from 'shared/hooks/use-wagmi-key';
import NoSSRWrapper from 'shared/components/no-ssr-wrapper';
import { OnlyInfraRender } from 'shared/components/only-infra-render';

import { StakeFaq } from './stake-faq/stake-faq';
import { LidoStats } from './lido-stats/lido-stats';
import { StakeForm } from './stake-form';
import { SupportOnlyL1Chains } from 'providers/supported-chain';

export const Stake = () => {
  const key = useWagmiKey();

  return (
    <SupportOnlyL1Chains>
      <NoSSRWrapper>
        <StakeForm key={key} />
      </NoSSRWrapper>
      <LidoStats />
      <OnlyInfraRender renderIPFS={<FaqPlaceholder />}>
        <StakeFaq />
      </OnlyInfraRender>
    </SupportOnlyL1Chains>
  );
};
