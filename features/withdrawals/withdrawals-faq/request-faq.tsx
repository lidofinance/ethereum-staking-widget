import { useMatomoEventHandle } from 'shared/hooks';

import { Button } from '@lidofinance/lido-ui';
import { Section } from 'shared/components';
import { ButtonLinkWrap } from './styles';

import { WhatAreWithdrawals } from './list/what-are-withdrawals';
import { HowDoesWithdrawalsWork } from './list/how-does-withdrawals-work';
import { HowToWithdraw } from './list/how-to-withdraw';
import { ConvertSTETHtoETH } from './list/convert-steth-to-eth';
import { ConvertWSTETHtoETH } from './list/convert-wsteth-to-eth';
import { HowLongToWithdraw } from './list/how-long-to-withdraw';
import { WithdrawalPeriodCircumstances } from './list/withdrawal-period-circumstances';
import { ClaimableAmountDifference } from './list/claimable-amount-difference';
import { WithdrawalFee } from './list/withdrawaal-fee';
import { BunkerMode } from './list/bunker-mode';
import { BunkerModeReasons } from './list/bunker-mode-reasons';
import { WhatIsSlashing } from './list/what-is-slashing';
import { RewardsAfterWithdraw } from './list/rwards-after-withdraw';
import { SlashingWhileRequestOngoing } from './list/slashing-while-request-ongoing';
import { UnstakeAmountBoundaries } from './list/unstake-amount-boundaries';

const LEARN_MORE_LINK =
  'https://hackmd.io/@lido/SyaJQsZoj#Lido-on-Ethereum-Withdrawals-Landscape';

export const RequestFaq: React.FC = () => {
  const onClickHandler = useMatomoEventHandle();

  return (
    <Section title="FAQ" onClick={onClickHandler}>
      <WhatAreWithdrawals />
      <HowDoesWithdrawalsWork />
      <HowToWithdraw />
      <ConvertSTETHtoETH />
      <ConvertWSTETHtoETH />
      <HowLongToWithdraw />
      <WithdrawalPeriodCircumstances />
      <ClaimableAmountDifference />
      <WithdrawalFee />
      <BunkerMode />
      <BunkerModeReasons />
      <WhatIsSlashing />
      <RewardsAfterWithdraw />
      <SlashingWhileRequestOngoing />
      <UnstakeAmountBoundaries />

      <ButtonLinkWrap
        target="_blank"
        rel="noopener noreferrer"
        href={LEARN_MORE_LINK}
      >
        <Button>Learn more</Button>
      </ButtonLinkWrap>
    </Section>
  );
};
