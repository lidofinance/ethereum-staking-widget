import { useWatch } from 'react-hook-form';
import { VaultWillReceive } from 'features/earn/shared/vault-will-receive';
import { TokenWstethIcon } from 'assets/earn';
import { useStETHByWstETH } from 'modules/web3';
import { getTokenSymbol } from 'utils/getTokenSymbol';
import { EthVaultWithdrawFormValues } from './form-context/types';
import { useEthVaultPreviewWithdraw } from './hooks/use-preview-withdraw';

export const EthVaultWithdrawWillReceive = () => {
  const { amount } = useWatch<EthVaultWithdrawFormValues>();

  const { data, isLoading } = useEthVaultPreviewWithdraw({ shares: amount });
  const wsteth = data.wsteth;
  const { data: eth, isLoading: isLoadingEth } = useStETHByWstETH(wsteth);

  return (
    <VaultWillReceive
      icon={<TokenWstethIcon width={16} height={16} viewBox="0 0 20 20" />}
      amount={wsteth}
      symbol={getTokenSymbol('wsteth')}
      usdAmount={data.usd}
      ethAmount={eth}
      isLoading={isLoading || isLoadingEth}
      help={
        <>
          The final claimable wstETH may differ slightly, since your request
          continues earning until processing is complete.
        </>
      }
    />
  );
};
