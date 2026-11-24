import { useWatch } from 'react-hook-form';

import { TokenWethIcon, TokenWstethIcon } from 'assets/earn';

import { getTokenSymbol } from 'utils/get-token-symbol';
import { VaultWillReceive } from 'features/earn/shared/vault-will-receive';

import { useGGVPreviewWithdrawal } from './hooks/use-ggv-preview-withdrawal';
import { useGGVWithdrawForm } from './form-context';

import type { GGVWithdrawalFormValues } from './types';

const ICON_PROPS = { viewBox: '0 0 20 20', width: 16, height: 16 };

export const GGVWithdrawWillReceive = () => {
  const { amount } = useWatch<GGVWithdrawalFormValues>();
  const { isBulkWithdraw } = useGGVWithdrawForm();
  const { data, isLoading } = useGGVPreviewWithdrawal(amount);
  return (
    <VaultWillReceive
      icon={
        isBulkWithdraw ? (
          <TokenWethIcon {...ICON_PROPS} />
        ) : (
          <TokenWstethIcon {...ICON_PROPS} />
        )
      }
      amount={data.assets}
      symbol={getTokenSymbol(isBulkWithdraw ? 'WETH' : 'wstETH')}
      usdAmount={data.usd}
      ethAmount={data.eth}
      isLoading={isLoading}
    />
  );
};
