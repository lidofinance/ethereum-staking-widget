import { CowswapDex } from 'modules/dexes/cowswap';

import { useWithdrawalDex } from './use-withdrawal-dex';
import { WITHDRAWALS_COWSWAP_PROFILE, useRefetchBalances } from './cowswap';

export const DexWithdrawal = () => {
  const { integration } = useWithdrawalDex();
  const refetchBalances = useRefetchBalances();

  // eslint-disable-next-line sonarjs/no-small-switch
  switch (integration) {
    case 'cowswap':
      return (
        <CowswapDex
          profile={WITHDRAWALS_COWSWAP_PROFILE}
          refetchBalances={refetchBalances}
        />
      );
    default:
      return null;
  }
};
