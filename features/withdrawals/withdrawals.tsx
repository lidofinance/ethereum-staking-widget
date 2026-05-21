import { WithdrawalsProvider } from './contexts/withdrawals-context';

import { WithdrawalsTabs } from './withdrawals-tabs';
import type { WithdrawalsMode } from './types/mode';

type WithdrawalsProps = {
  mode: WithdrawalsMode;
};

export const Withdrawals: React.FC<WithdrawalsProps> = ({ mode }) => {
  return (
    <WithdrawalsProvider mode={mode}>
      <WithdrawalsTabs />
    </WithdrawalsProvider>
  );
};
