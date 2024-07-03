import { memo } from 'react';
import { useWeb3 } from 'reef-knot/web3-react';
import { useAccount } from 'wagmi';

import { Divider, Text } from '@lidofinance/lido-ui';
import { TOKENS } from '@lido-sdk/constants';
import {
  useSDK,
  useEthereumBalance,
  useSTETHBalance,
  useWSTETHBalance,
  useTokenAddress,
} from '@lido-sdk/react';

import { L2_CHAINS } from 'consts/chains';
import { STRATEGY_LAZY } from 'consts/swr-strategies';
import { FormatToken } from 'shared/formatters';
import { TokenToWallet } from 'shared/components';
import { useChainIdWithoutAccount } from 'shared/hooks/use-chain-id-without-account';
import { useWstethBySteth, useStethByWsteth } from 'shared/hooks';
import type { WalletComponentType } from 'shared/wallet/types';
import {
  CardBalance,
  CardRow,
  CardAccount,
  Fallback,
  L2Fallback,
} from 'shared/wallet';

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
          title="ETH Balance"
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
          title="stETH Balance"
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
          title="wstETH Balance"
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
  const chainIdWithoutAccount = useChainIdWithoutAccount();
  const { chainId: accountChainId } = useAccount();
  const { active } = useWeb3();

  const _chainId = accountChainId || chainIdWithoutAccount;

  // The widget currently doesn't support L2 networks so there is no point in checking `active from useWeb3()` first
  if (Object.values(L2_CHAINS).indexOf(_chainId as unknown as L2_CHAINS) > -1) {
    return <L2Fallback {...props} />;
  }

  return active ? <WalletComponent {...props} /> : <Fallback {...props} />;
});
