import { Divider, Text } from '@lidofinance/lido-ui';

import { FormatToken } from 'shared/formatters';
import { TokenToWallet } from 'shared/components';
import { useStethByWsteth } from 'shared/hooks';
import {
  useDappStatus,
  useEthereumBalance,
  useStethBalance,
  useWstethBalance,
  useStETHByWstETHOnL2,
  useWstethBySteth,
  DAPP_CHAIN_TYPE,
} from 'modules/web3';
import { CardBalance, CardRow, CardAccount, Fallback } from 'shared/wallet';

import { StyledCard } from './styles';
import { useIsLedgerLive } from 'shared/hooks/useIsLedgerLive';
import { useConfig } from 'config';
import { useConnectorInfo } from 'reef-knot/core-react';

const WalletComponent = () => {
  const { isDappActiveOnL2 } = useDappStatus();
  const ethBalance = useEthereumBalance();
  const stethBalance = useStethBalance();
  const wstethBalance = useWstethBalance();

  // TODO: NEW_SDK (not use ?.toBigInt())
  const wstethBySteth = useWstethBySteth(stethBalance?.data?.toBigInt());

  const stethByWstethOnL1 = useStethByWsteth(
    !isDappActiveOnL2 && wstethBalance.data ? wstethBalance.data : undefined,
  );
  const stethByWstethOnL2 = useStETHByWstETHOnL2(
    isDappActiveOnL2 && wstethBalance.data ? wstethBalance.data : undefined,
  );
  const stethByWsteth = isDappActiveOnL2
    ? stethByWstethOnL2
    : stethByWstethOnL1;

  return (
    <StyledCard data-testid="wrapCardSection" $redBg={isDappActiveOnL2}>
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
          loading={stethBalance.isLoading || wstethBySteth.initialLoading}
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
              <Text size={'xxs'} color={'secondary'}>
                <FormatToken
                  data-testid="wstEthBalanceOption"
                  amount={wstethBySteth.data}
                  symbol="wstETH"
                  approx={true}
                />
              </Text>
            </>
          }
        />
        <CardBalance
          small
          title="wstETH balance"
          loading={wstethBalance.isLoading || stethByWsteth.initialLoading}
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
              <Text size={'xxs'} color={'secondary'}>
                <FormatToken
                  data-testid="stethBalanceOption"
                  amount={stethByWsteth.data}
                  symbol="stETH"
                  approx={true}
                />
              </Text>
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
  const { isLedger: isLedgerHardware } = useConnectorInfo();
  const { featureFlags } = useConfig().externalConfig;
  const { chainType } = useDappStatus();

  const isLedgerLiveOptimism =
    !featureFlags.ledgerLiveL2 &&
    isLedgerLive &&
    chainType === DAPP_CHAIN_TYPE.Optimism;
  const isLedgerHardwareOptimism =
    isLedgerHardware && chainType === DAPP_CHAIN_TYPE.Optimism;

  if (isLedgerLiveOptimism || isLedgerHardwareOptimism) {
    const error = `Optimism is currently not supported in ${isLedgerLiveOptimism ? 'Ledger Live' : 'Ledger Hardware'}.`;
    return <Fallback error={error} />;
  }

  return (
    <Fallback toActionText={`to ${isUnwrapMode ? 'unwrap' : 'wrap'}`}>
      <WalletComponent />
    </Fallback>
  );
};
