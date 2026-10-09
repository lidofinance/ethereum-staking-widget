import { Divider } from '@lidofinance/lido-ui';

import { FormatToken } from 'shared/formatters';
import { TokenToWallet } from 'shared/components';
import {
  useDappStatus,
  useEthereumBalance,
  useStethBalance,
  useWstethBalance,
  useWstethBySteth,
  useStETHByWstETH,
  useIsLedgerLive,
} from 'modules/web3';
import { CardBalance, CardRow, CardAccount, Fallback } from 'shared/wallet';

import { StyledCard } from './styles';
import { useConfig } from 'config';

const WalletComponent = () => {
  const { chainType } = useDappStatus();
  const ethBalance = useEthereumBalance();
  const stethBalance = useStethBalance();
  const wstethBalance = useWstethBalance();

  const wstethBySteth = useWstethBySteth(stethBalance?.data);
  const stethByWsteth = useStETHByWstETH(wstethBalance?.data);

  return (
    <StyledCard data-testid="wrapCardSection" $chainType={chainType}>
      <CardRow>
        <CardBalance
          title="ETH balance"
          loading={ethBalance.isLoading}
          value={
            <FormatToken
              data-testid="ethBalance"
              amount={ethBalance.data}
              symbol="ETH"
            />
          }
        />
        <CardAccount />
      </CardRow>
      <Divider />
      <CardRow>
        <CardBalance
          small
          title="stETH balance"
          loading={stethBalance.isLoading || wstethBySteth.isLoading}
          extra={
            <FormatToken
              data-testid="wstEthBalanceOption"
              amount={wstethBySteth.data}
              symbol="wstETH"
              approx={true}
            />
          }
          value={
            <>
              <FormatToken
                data-testid="stEthBalance"
                amount={stethBalance.data}
                symbol="stETH"
              />
              <TokenToWallet
                data-testid="addStethToWalletBtn"
                address={stethBalance.tokenAddress}
              />
            </>
          }
        />
        <CardBalance
          small
          title="wstETH balance"
          loading={wstethBalance.isLoading || stethByWsteth.isLoading}
          extra={
            <FormatToken
              data-testid="stethBalanceOption"
              amount={stethByWsteth.data}
              symbol="stETH"
              approx={true}
            />
          }
          value={
            <>
              <FormatToken
                data-testid="wstEthBalance"
                amount={wstethBalance.data}
                symbol="wstETH"
              />
              <TokenToWallet
                data-testid="addWstethToWalletBtn"
                address={wstethBalance.tokenAddress}
              />
            </>
          }
        />
      </CardRow>
    </StyledCard>
  );
};

type WrapWalletProps = {
  isUnwrapMode: boolean;
};

export const Wallet = ({ isUnwrapMode }: WrapWalletProps) => {
  const isLedgerLive = useIsLedgerLive();
  const { featureFlags } = useConfig().externalConfig;
  const { isChainIdOnL2, wagmiChain } = useDappStatus();

  const isLedgerLiveOnL2 =
    !featureFlags.ledgerLiveL2 && isLedgerLive && isChainIdOnL2;

  if (isLedgerLiveOnL2) {
    const error = `${wagmiChain.name} is currently not supported in Ledger Live.`;
    return <Fallback error={error} />;
  }

  return (
    <Fallback toActionText={`to ${isUnwrapMode ? 'unwrap' : 'wrap'}`}>
      <WalletComponent />
    </Fallback>
  );
};
