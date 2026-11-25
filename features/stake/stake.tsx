import { useEffect } from 'react';

import { FaqPlaceholder } from 'features/ipfs';
import { OnlyInfraRender } from 'shared/components/only-infra-render';
import {
  DisclaimerSection,
  AprDisclaimer,
  LegalDisclaimer,
} from 'shared/components';
import { useDappStatus } from 'modules/web3';
import { clearFormState } from 'shared/hook-form/form-controller';

import { StakeFaq } from './stake-faq/stake-faq';
import { LidoStats } from './lido-stats/lido-stats';
import { StakeForm } from './stake-form';
import { L2Stake } from './l2-stake';

export const Stake = () => {
  const { isChainIdOnL2 } = useDappStatus();
  useEffect(() => {
    // clear form state syncing on page unmount
    return () => {
      clearFormState(['stake', 'stakeL2']);
    };
  }, []);
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
