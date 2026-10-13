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

export const Stake = () => {
  return (
    <>
      <StakeForm />
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
