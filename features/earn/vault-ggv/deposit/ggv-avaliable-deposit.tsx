import { FormatToken } from 'shared/formatters';

import { useGGVDepositForm } from './form-context';

export const GGVAvailableDeposit = () => {
  const { maxAmount, token } = useGGVDepositForm();
  return (
    <div>
      Available to deposit <FormatToken symbol={token} amount={maxAmount} />
    </div>
  );
};
