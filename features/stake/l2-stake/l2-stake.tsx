import { Wallet } from './wallet';
import { L2StakeForm } from './l2-stake-form';
import { L2StakeFormProvider } from './l2-stake-form-context';
import { SlowStakeStatusesList } from './slow-lane/slow-stake-statuses';

export const L2Stake = () => {
  return (
    <L2StakeFormProvider>
      <SlowStakeStatusesList />
      <Wallet />
      <L2StakeForm />
    </L2StakeFormProvider>
  );
};
