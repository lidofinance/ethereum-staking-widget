import {
  WalletCard,
  WalletCardBalance,
  WalletCardRow,
  WalletCardAccount,
} from 'components/walletCard';
import { Divider, Text } from '@lidofinance/lido-ui';
import {
  useSDK,
  useEthereumBalance,
  useSTETHBalance,
  useWSTETHBalance,
  useTokenAddress,
} from '@lido-sdk/react';
import { useWeb3 } from '@lido-sdk/web3-react';
import FormatToken from 'components/formatToken';
import FallbackWallet from 'components/fallbackWallet';
import TokenToWallet from 'components/tokenToWallet';
import { useWstethBySteth, useStethByWsteth } from 'hooks';
import { WalletComponent } from './types';
import { TOKENS } from '@lido-sdk/constants';
import { css } from 'styled-components';
import { memo } from 'react';

const Wallet: WalletComponent = (props) => {
  const { account } = useSDK();
  const eth = useEthereumBalance();
  const steth = useSTETHBalance();
  const wsteth = useWSTETHBalance();

  const stethAddress = useTokenAddress(TOKENS.STETH);
  const wstethAddress = useTokenAddress(TOKENS.WSTETH);

  const wstethConverted = useWstethBySteth(steth.data);
  const stethConverted = useStethByWsteth(wsteth.data);

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
          loading={eth.initialLoading}
          value={<FormatToken amount={eth.data} symbol="ETH" />}
        />
        <WalletCardAccount account={account} />
      </WalletCardRow>
      <Divider />
      <WalletCardRow>
        <WalletCardBalance
          small
          title="stETH Balance"
          loading={steth.initialLoading}
          value={
            <>
              <FormatToken amount={steth.data} symbol="stETH" />
              <TokenToWallet address={stethAddress} />
              <Text size={'xxs'} color={'secondary'}>
                ≈ <FormatToken amount={wstethConverted} symbol="wstETH" />
              </Text>
            </>
          }
        />
        <WalletCardBalance
          small
          title="wstETH Balance"
          loading={wsteth.initialLoading}
          value={
            <>
              <FormatToken amount={wsteth.data} symbol="wstETH" />
              <TokenToWallet address={wstethAddress} />
              <Text size={'xxs'} color={'secondary'}>
                ≈ <FormatToken amount={stethConverted} symbol="stETH" />
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
