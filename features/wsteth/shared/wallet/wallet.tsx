import { memo } from 'react';

import { Divider, Text } from '@lidofinance/lido-ui';

import { config } from 'config';
import { CHAINS } from 'consts/chains';
import { FormatToken } from 'shared/formatters';
import { TokenToWallet } from 'shared/components';
import { useWstethBySteth, useStethByWsteth } from 'shared/hooks';
import {
  useDappStatus,
  useEthereumBalance,
  useStethBalance,
  useWstethBalance,
  useStETHByWstETHOnL2,
  useWstETHByStETHOnL2,
  DAPP_CHAIN_TYPE,
} from 'modules/web3';
import type { WalletComponentType } from 'shared/wallet/types';
import {
  CardBalance,
  CardRow,
  CardAccount,
  Fallback,
  LidoMultichainFallback,
} from 'shared/wallet';

import { capitalize } from 'utils/capitalize';

import { StyledCard } from './styles';

const WalletComponent: WalletComponentType = (props) => {
  const { isDappActiveOnL2, address } = useDappStatus();
  const ethBalance = useEthereumBalance();
  const stethBalance = useStethBalance();
  const wstethBalance = useWstethBalance();

  // TODO merge those hooks and only fetch current chain
  const wstethByStethOnL1 = useWstethBySteth(
    !isDappActiveOnL2 && stethBalance.data ? stethBalance.data : undefined,
  );
  const wstethByStethOnL2 = useWstETHByStETHOnL2(
    isDappActiveOnL2 && stethBalance.data ? stethBalance.data : undefined,
  );
  const wstethBySteth = isDappActiveOnL2
    ? wstethByStethOnL2
    : wstethByStethOnL1;

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
        <CardAccount account={address} />
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
  const {
    isDappActive,
    isLidoMultichainChain,
    chainType,
    isDappChainTypedMatched,
  } = useDappStatus();
  const isOptimism = chainType === DAPP_CHAIN_TYPE.Optimism;

  if (isLidoMultichainChain) {
    return <LidoMultichainFallback textEnding={'to wrap/unwrap'} {...props} />;
  }

  if (isDappActive && !isDappChainTypedMatched) {
    const switchToOptimism =
      config.supportedChains.indexOf(CHAINS.Optimism) > -1
        ? capitalize(DAPP_CHAIN_TYPE.Optimism)
        : 'Optimism Sepolia';
    const error = `Wrong network. Please switch to ${isOptimism ? switchToOptimism : capitalize(CHAINS[config.defaultChain])} in your wallet to wrap/unwrap.`;
    return <Fallback error={error} {...props} />;
  }

  if (!isDappActive) {
    return <Fallback {...props} />;
  }

  return <WalletComponent {...props} />;
});
