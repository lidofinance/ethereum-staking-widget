import { useAccount } from 'wagmi';
import { useConnectorInfo } from 'reef-knot/core-react';
import { Divider, Text } from '@lidofinance/lido-ui';

import { useConfig } from 'config';

import { FormatToken } from 'shared/formatters';
import { TokenToWallet } from 'shared/components';
import {
  useDappStatus,
  useEthereumBalance,
  useStethBalance,
  useWstethBalance,
  useWstethBySteth,
  useStETHByWstETH,
} from 'modules/web3';
import { useIsLedgerLive } from 'shared/hooks/useIsLedgerLive';
import { CardBalance, CardRow, CardAccount, Fallback } from 'shared/wallet';
import { DAPP_CHAIN_TYPE } from 'modules/web3/consts/chains';

import { StyledCard } from './styles';

const WalletComponent = () => {
  const { chainType } = useDappStatus();
  const ethBalance = useEthereumBalance();
  const stethBalance = useStethBalance();
  const wstethBalance = useWstethBalance();

  const wstethBySteth = useWstethBySteth(stethBalance?.data);
  const stethByWsteth = useStETHByWstETH(wstethBalance?.data);

  const isOptimism = chainType === DAPP_CHAIN_TYPE.Optimism;
  const isSoneium = chainType === DAPP_CHAIN_TYPE.Soneium;

  return (
    <StyledCard
      data-testid="wrapCardSection"
      $optimism={isOptimism}
      $soneium={isSoneium}
    >
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
          loading={wstethBalance.isLoading || stethByWsteth.isLoading}
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
  const { isChainIdOnL2 } = useDappStatus();
  const { chain } = useAccount();

  const isLedgerLiveOnL2 =
    !featureFlags.ledgerLiveL2 && isLedgerLive && isChainIdOnL2;

  const isLedgerHardwareOnL2 = isLedgerHardware && isChainIdOnL2;

  if (isLedgerLiveOnL2 || isLedgerHardwareOnL2) {
    const error = `${chain?.name} is currently not supported in ${isLedgerLiveOnL2 ? 'Ledger Live' : 'Ledger Hardware'}.`;
    return <Fallback error={error} />;
  }

  return (
    <Fallback toActionText={`to ${isUnwrapMode ? 'unwrap' : 'wrap'}`}>
      <WalletComponent />
    </Fallback>
  );
};
