import { css } from 'styled-components';
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
import {
  WalletCard,
  WalletCardBalance,
  WalletCardRow,
  WalletCardAccount,
} from 'components/walletCard';
import FormatToken from 'components/formatToken';
import FallbackWallet from 'components/fallbackWallet';
import TokenToWallet from 'components/tokenToWallet';
import { useWstethBySteth, useStethByWsteth } from 'hooks';
import { WalletComponent } from './types';

const Wallet: WalletComponent = (props) => {
  const { account } = useSDK();
  const ethBalance = useEthereumBalance();
  const stethBalance = useSTETHBalance();
  const wstethBalance = useWSTETHBalance();

  const stethAddress = useTokenAddress(TOKENS.STETH);
  const wstethAddress = useTokenAddress(TOKENS.WSTETH);

  const wstethByStethBalance = useWstethBySteth(stethBalance.data);
  const stethByWstethBalance = useStethByWsteth(wstethBalance.data);

  return (
    <WalletCard
      {...props}
      css={css`
        background: linear-gradient(52.01deg, #1b3349 0%, #25697e 100%);
      `}
    >
      <WalletCardRow>
        <WalletCardBalance
          title="ETH Balance"
          loading={ethBalance.initialLoading}
          value={<FormatToken amount={ethBalance.data} symbol="ETH" />}
        />
        <WalletCardAccount account={account} />
      </WalletCardRow>
      <Divider />
      <WalletCardRow>
        <WalletCardBalance
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
        <WalletCardBalance
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
      </WalletCardRow>
    </WalletCard>
  );
};

const WalletWrapper: WalletComponent = (props) => {
  const { active } = useWeb3();
  return active ? <Wallet {...props} /> : <FallbackWallet {...props} />;
};

export default memo(WalletWrapper);
