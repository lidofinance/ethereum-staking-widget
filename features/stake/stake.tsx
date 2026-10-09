import { FaqPlaceholder } from 'features/ipfs';
import { OnlyInfraRender } from 'shared/components/only-infra-render';
import {
  DisclaimerSection,
  AprDisclaimer,
  LegalDisclaimer,
} from 'shared/components';
import { StakeFaq } from './stake-faq/stake-faq';
import { LidoStats } from './lido-stats/lido-stats';
import { StakeForm } from './stake-form';
import { L2Stake } from './l2-stake';
import { useDappStatus } from 'modules/web3';

export const Stake = () => {
  const { isChainIdOnL2 } = useDappStatus();
  return (
    <>
      {isChainIdOnL2 ? <L2Stake /> : <StakeForm />}
      <LidoStats />
      <OnlyInfraRender renderIPFS={<FaqPlaceholder />}>
        <StakeFaq />
      </OnlyInfraRender>
      <DisclaimerSection>
        <AprDisclaimer />
        <LegalDisclaimer />
      </DisclaimerSection>
    </>
  );
};
