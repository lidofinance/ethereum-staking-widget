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
import { useWeb3 } from '@lido-sdk/web3-react';
import { FormatToken } from 'shared/formatters';
import { TokenToWallet } from 'shared/components';
import { useWstethBySteth, useStethByWsteth } from 'shared/hooks';
import type { WalletComponentType } from 'shared/wallet/types';
import { CardBalance, CardRow, CardAccount, Fallback } from 'shared/wallet';
import { StyledCard } from './styles';

const WalletComponent: WalletComponentType = (props) => {
  const { account } = useSDK();
  const ethBalance = useEthereumBalance();
  const stethBalance = useSTETHBalance();
  const wstethBalance = useWSTETHBalance();

  const stethAddress = useTokenAddress(TOKENS.STETH);
  const wstethAddress = useTokenAddress(TOKENS.WSTETH);

  const wstethByStethBalance = useWstethBySteth(stethBalance.data);
  const stethByWstethBalance = useStethByWsteth(wstethBalance.data);

  return (
    <StyledCard {...props}>
      <CardRow>
        <CardBalance
          title="ETH Balance"
          loading={ethBalance.initialLoading}
          value={<FormatToken amount={ethBalance.data} symbol="ETH" />}
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
              <FormatToken amount={stethBalance.data} symbol="stETH" />
              <TokenToWallet address={stethAddress} />
              <Text size={'xxs'} color={'secondary'}>
                ≈ <FormatToken amount={wstethByStethBalance} symbol="wstETH" />
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
              <FormatToken amount={wstethBalance.data} symbol="wstETH" />
              <TokenToWallet address={wstethAddress} />
              <Text size={'xxs'} color={'secondary'}>
                ≈ <FormatToken amount={stethByWstethBalance} symbol="stETH" />
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
