import { CowswapDex } from './cowswap';
import { useWithdrawalDex } from './use-withdrawal-dex';

export const DexWithdrawal = () => {
  const { integration } = useWithdrawalDex();

  // eslint-disable-next-line sonarjs/no-small-switch
  switch (integration) {
    case 'cowswap':
      return <CowswapDex />;
    default:
      return null;
  }
};
