import { memo } from 'react';

import { Divider, Text } from '@lidofinance/lido-ui';
import { TOKENS } from '@lido-sdk/constants';
import { useSDK, useTokenAddress } from '@lido-sdk/react';

import { FormatToken } from 'shared/formatters';
import { TokenToWallet } from 'shared/components';
import { useWstethBySteth, useStethByWsteth } from 'shared/hooks';
import { useDappStatus } from 'shared/hooks/use-dapp-status';
import { useLidoMultichainFallbackCondition } from 'shared/hooks/use-lido-multichain-fallback-condition';
import type { WalletComponentType } from 'shared/wallet/types';
import {
  CardBalance,
  CardRow,
  CardAccount,
  Fallback,
  LidoMultichainFallback,
} from 'shared/wallet';

import { StyledCard } from './styles';
import {
  useEthereumBalance,
  useStethBalance,
  useWstethBalance,
} from 'shared/hooks/use-balance';

const WalletComponent: WalletComponentType = (props) => {
  const { account } = useSDK();
  const ethBalance = useEthereumBalance();
  const stethBalance = useStethBalance();
  const wstethBalance = useWstethBalance();

  const stethAddress = useTokenAddress(TOKENS.STETH);
  const wstethAddress = useTokenAddress(TOKENS.WSTETH);

  const wstethBySteth = useWstethBySteth(stethBalance.data);
  const stethByWsteth = useStethByWsteth(wstethBalance.data);

  const { isDappActiveOnL2 } = useDappStatus();

  return (
    <StyledCard
      data-testid="wrapCardSection"
      $redBg={isDappActiveOnL2}
      {...props}
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
        <CardAccount account={account} />
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
                address={stethAddress}
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
                address={wstethAddress}
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

export const Wallet: WalletComponentType = memo((props) => {
  const { isDappActive, isDappActiveAndNetworksMatched } = useDappStatus();
  const { showLidoMultichainFallback } = useLidoMultichainFallbackCondition();

  if (showLidoMultichainFallback) {
    return <LidoMultichainFallback textEnding={'to wrap/unwrap'} {...props} />;
  }

  // TODO
  if (!isDappActive || !isDappActiveAndNetworksMatched) {
    return <Fallback {...props} />;
  }

  return <WalletComponent {...props} />;
});
