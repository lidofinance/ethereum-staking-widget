import { useMatomoEventHandle } from 'shared/hooks';

import { Section } from 'shared/components';

import { WhatAreWithdrawals } from './list/what-are-withdrawals';
import { HowDoesWithdrawalsWork } from './list/how-does-withdrawals-work';
import { HowToWithdraw } from './list/how-to-withdraw';
import { ConvertSTETHtoETH } from './list/convert-steth-to-eth';
import { ConvertWSTETHtoETH } from './list/convert-wsteth-to-eth';
import { WhySTETH } from './list/why-steth';
import { SeparateClaim } from './list/separate-claim';
import { ClaimableAmountDifference } from './list/claimable-amount-difference';
import { WhatIsSlashing } from './list/what-is-slashing';

export const ClaimFaq: React.FC = () => {
  const onClickHandler = useMatomoEventHandle();

  return (
    <Section title="FAQ" onClick={onClickHandler}>
      <WhatAreWithdrawals />
      <HowDoesWithdrawalsWork />
      <HowToWithdraw />
      <ConvertSTETHtoETH />
      <ConvertWSTETHtoETH />
      <WhySTETH />
      <SeparateClaim />
      <ClaimableAmountDifference />
      <WhatIsSlashing />
    </Section>
  );
};
