import { memo } from 'react';
import { useAccount } from 'wagmi';

import { Divider, Text } from '@lidofinance/lido-ui';
import { useSDK } from '@lido-sdk/react';

import { config } from 'config';
import { CHAINS } from 'consts/chains';
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
import {
  useEthereumBalance,
  useStethBalance,
  useWstethBalance,
} from 'shared/hooks/use-balance';
import { OPTIMISM, useDappChain } from 'providers/dapp-chain';
import { capitalizeFirstLetter } from 'utils/capitalize-string';

import { StyledCard } from './styles';
import { useStETHByWstETHOnL2 } from 'shared/hooks/use-stETH-by-wstETH-on-l2';
import { useWstETHByStETHOnL2 } from 'shared/hooks/use-wstETH-by-stETH-on-l2';

const WalletComponent: WalletComponentType = (props) => {
  const { account } = useSDK();
  const { isAccountActiveOnL2, isDappActiveOnL2 } = useDappStatus();
  const ethBalance = useEthereumBalance();
  const stethBalance = useStethBalance();
  const wstethBalance = useWstethBalance();

  // TODO merge those hooks and only fetch current chain
  const wstethByStethOnL1 = useWstethBySteth(
    !isAccountActiveOnL2 && stethBalance.data ? stethBalance.data : undefined,
  );
  const wstethByStethOnL2 = useWstETHByStETHOnL2(
    isAccountActiveOnL2 && stethBalance.data ? stethBalance.data : undefined,
  );
  const wstethBySteth = isAccountActiveOnL2
    ? wstethByStethOnL2
    : wstethByStethOnL1;

  const stethByWstethOnL1 = useStethByWsteth(
    !isAccountActiveOnL2 && wstethBalance.data ? wstethBalance.data : undefined,
  );
  const stethByWstethOnL2 = useStETHByWstETHOnL2(
    isAccountActiveOnL2 && wstethBalance.data ? wstethBalance.data : undefined,
  );
  const stethByWsteth = isAccountActiveOnL2
    ? stethByWstethOnL2
    : stethByWstethOnL1;

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

export const Wallet: WalletComponentType = memo((props) => {
  const { chainId } = useAccount();
  const { isDappActive, isDappActiveOnL2 } = useDappStatus();
  const { showLidoMultichainFallback } = useLidoMultichainFallbackCondition();
  const { chainName, isMatchDappChainAndWalletChain } = useDappChain();

  if (isDappActive && !isMatchDappChainAndWalletChain(chainId)) {
    const switchToOptimism =
      config.supportedChains.indexOf(CHAINS.Optimism) > -1
        ? capitalizeFirstLetter(OPTIMISM)
        : 'Optimism Sepolia';
    const error = `Wrong network. Please switch to ${chainName === OPTIMISM ? switchToOptimism : capitalizeFirstLetter(CHAINS[config.defaultChain])} in your wallet to wrap/unwrap.`;
    return <Fallback error={error} {...props} />;
  }

  if (!isDappActiveOnL2 && showLidoMultichainFallback) {
    return <LidoMultichainFallback textEnding={'to wrap/unwrap'} {...props} />;
  }

  if (!isDappActive) {
    return <Fallback {...props} />;
  }

  return <WalletComponent {...props} />;
});
