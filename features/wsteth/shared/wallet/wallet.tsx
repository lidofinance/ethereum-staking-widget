import { memo } from 'react';

import { Divider, Text } from '@lidofinance/lido-ui';
import { TOKENS } from '@lido-sdk/constants';
import {
  useSDK,
  useEthereumBalance,
  useSTETHBalance,
  useWSTETHBalance,
  useTokenAddress,
} from '@lido-sdk/react';

import { useConfig } from 'config';
import { CHAINS } from 'consts/chains';
import { STRATEGY_LAZY } from 'consts/swr-strategies';
import { FormatToken } from 'shared/formatters';
import { TokenToWallet } from 'shared/components';
import { useWstethBySteth, useStethByWsteth } from 'shared/hooks';
import { useDappStatus } from 'shared/hooks/use-dapp-status';
import type { WalletComponentType } from 'shared/wallet/types';
import {
  CardBalance,
  CardRow,
  CardAccount,
  Fallback,
  L2Fallback,
} from 'shared/wallet';
import { overrideWithQAMockBoolean } from 'utils/qa';

import { StyledCard } from './styles';

const WalletComponent: WalletComponentType = (props) => {
  const { account } = useSDK();
  const ethBalance = useEthereumBalance(undefined, STRATEGY_LAZY);
  const stethBalance = useSTETHBalance(STRATEGY_LAZY);
  const wstethBalance = useWSTETHBalance(STRATEGY_LAZY);

  const stethAddress = useTokenAddress(TOKENS.STETH);
  const wstethAddress = useTokenAddress(TOKENS.WSTETH);

  const wstethBySteth = useWstethBySteth(stethBalance.data);
  const stethByWsteth = useStethByWsteth(wstethBalance.data);

  return (
    <StyledCard data-testid="wrapCardSection" {...props}>
      <CardRow>
        <CardBalance
          title="ETH balance"
          loading={ethBalance.initialLoading}
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
          loading={stethBalance.initialLoading || wstethBySteth.initialLoading}
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
          loading={wstethBalance.initialLoading || stethByWsteth.initialLoading}
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
  const { config } = useConfig();
  const { isL2Chain, isDappActive } = useDappStatus();

  // Display L2 banners only if defaultChain=Mainnet
  // Or via QA helpers override
  const showL2Chain = overrideWithQAMockBoolean(
    config.defaultChain === CHAINS.Mainnet,
    'mock-qa-helpers-show-l2-banners-on-testnet',
  );

  if (isL2Chain && showL2Chain) {
    return <L2Fallback textEnding={'to wrap/unwrap'} {...props} />;
  }

  if (!isDappActive) {
    return <Fallback {...props} />;
  }

  return <WalletComponent {...props} />;
});
