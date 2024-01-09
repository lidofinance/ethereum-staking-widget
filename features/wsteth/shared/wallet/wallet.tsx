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
import { useWeb3 } from 'reef-knot/web3-react';
import { FormatToken } from 'shared/formatters';
import { TokenToWallet } from 'shared/components';
import { useWstethBySteth, useStethByWsteth } from 'shared/hooks';
import type { WalletComponentType } from 'shared/wallet/types';
import { CardBalance, CardRow, CardAccount, Fallback } from 'shared/wallet';
import { StyledCard } from './styles';
import { STRATEGY_LAZY } from 'utils/swrStrategies';

const WalletComponent: WalletComponentType = (props) => {
  const { account } = useSDK();
  const ethBalance = useEthereumBalance(undefined, STRATEGY_LAZY);
  const stethBalance = useSTETHBalance(STRATEGY_LAZY);
  const wstethBalance = useWSTETHBalance(STRATEGY_LAZY);

  const stethAddress = useTokenAddress(TOKENS.STETH);
  const wstethAddress = useTokenAddress(TOKENS.WSTETH);

  const wstethByStethBalance = useWstethBySteth(stethBalance.data);
  const stethByWstethBalance = useStethByWsteth(wstethBalance.data);

  return (
    <StyledCard data-testid="wrapCardSection" {...props}>
      <CardRow>
        <CardBalance
          title="ETH Balance"
          loading={ethBalance.initialLoading}
          value={
            <FormatToken
              data-testid="ethBalance"
              showAmountTip
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
          title="stETH Balance"
          loading={stethBalance.initialLoading}
          value={
            <>
              <FormatToken
                data-testid="stEthBalance"
                showAmountTip
                amount={stethBalance.data}
                symbol="stETH"
              />
              <TokenToWallet
                data-testid="addStethToWalletBtn"
                address={stethAddress}
              />
              <Text size={'xxs'} color={'secondary'}>
                ≈{' '}
                <FormatToken
                  data-testid="wstEthBalanceOption"
                  amount={wstethByStethBalance}
                  symbol="wstETH"
                />
              </Text>
            </>
          }
        />
        <CardBalance
          small
          title="wstETH Balance"
          loading={wstethBalance.initialLoading}
          value={
            <>
              <FormatToken
                data-testid="wstEthBalance"
                showAmountTip
                amount={wstethBalance.data}
                symbol="wstETH"
              />
              <TokenToWallet
                data-testid="addWstethToWalletBtn"
                address={wstethAddress}
              />
              <Text size={'xxs'} color={'secondary'}>
                ≈{' '}
                <FormatToken
                  data-testid="stethBalanceOption"
                  amount={stethByWstethBalance}
                  symbol="stETH"
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
  const { active } = useWeb3();
  return active ? <WalletComponent {...props} /> : <Fallback {...props} />;
});
