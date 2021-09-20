import { memo } from 'react';
import { css } from 'styled-components';
import { Divider, Question, Tooltip } from '@lidofinance/lido-ui';
import { TOKENS } from '@lido-sdk/constants';
import {
  useEthereumBalance,
  useSDK,
  useSTETHBalance,
  useTokenAddress,
} from '@lido-sdk/react';
import { useWeb3 } from '@lido-sdk/web3-react';
import { LIDO_APR_TOOLTIP_TEXT } from 'config';
import {
  WalletCard,
  WalletCardBalance,
  WalletCardRow,
  WalletCardAccount,
} from 'components/walletCard';
import FormatToken from 'components/formatToken';
import FallbackWallet from 'components/fallbackWallet';
import TokenToWallet from 'components/tokenToWallet';
import { useLidoApr } from 'hooks/useLidoApr';
import { WalletComponent } from './types';
import { LidoAprStyled } from './styles';

const Wallet: WalletComponent = (props) => {
  const { account } = useSDK();
  const eth = useEthereumBalance();
  const steth = useSTETHBalance();

  const stethAddress = useTokenAddress(TOKENS.STETH);
  const lidoApr = useLidoApr();

  return (
    <WalletCard
      {...props}
      css={css`
        background: linear-gradient(65.21deg, #37394a 19.1%, #3e4b4f 100%);
      `}
    >
      <WalletCardRow>
        <WalletCardBalance
          title="Available to stake"
          loading={eth.initialLoading}
          value={<FormatToken amount={eth.data} symbol="ETH" />}
        />
        <WalletCardAccount account={account} />
      </WalletCardRow>
      <Divider />
      <WalletCardRow>
        <WalletCardBalance
          small
          title="Staked amount"
          loading={steth.initialLoading}
          value={
            <>
              <FormatToken amount={steth.data} symbol="stETH" />
              <TokenToWallet address={stethAddress} />
            </>
          }
        />
        <WalletCardBalance
          small
          title={
            <>
              Lido APR{' '}
              <Tooltip placement="bottom" title={LIDO_APR_TOOLTIP_TEXT}>
                <Question />
              </Tooltip>
            </>
          }
          loading={lidoApr.initialLoading}
          value={<LidoAprStyled>{lidoApr.data}%</LidoAprStyled>}
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
