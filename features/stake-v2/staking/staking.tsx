import { useState } from 'react';
import { SectionTitle, SegmentedControl } from '@lidofinance/lido-app-ui';

import { StakeForm } from './stake-form';
import { AuditDisclaimer } from './audit-disclaimer';

import { StakingCard, TabsSizer } from './styles';

// TODO: move to routing
const items = [
  { value: 'Stake', label: 'Stake' },
  { value: 'Withdraw', label: 'Withdraw' },
];
const Tabs = () => {
  const [value, setValue] = useState('Stake');
  return (
    <TabsSizer>
      <SegmentedControl items={items} value={value} onChange={setValue} />
    </TabsSizer>
  );
};

export const Staking = () => {
  return (
    <StakingCard gap={12} align="center">
      <SectionTitle size="large" title="Liquid staking" action={<Tabs />} />
      <StakeForm />
      <AuditDisclaimer />
    </StakingCard>
  );
};
