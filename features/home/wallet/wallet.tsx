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
import { useLidoApr, useEthApr } from 'shared/hooks';
import { TokenToWallet } from 'shared/components';
import {
  Card,
  CardBalance,
  CardRow,
  CardAccount,
  Fallback,
} from 'shared/wallet';
import type { WalletComponentType } from 'shared/wallet/types';
import { FormatToken } from 'shared/formatters';
import { LidoAprStyled } from './styles';

const WalletComponent: WalletComponentType = (props) => {
  const { account } = useSDK();
  const eth = useEthereumBalance();
  const steth = useSTETHBalance();

  const stethAddress = useTokenAddress(TOKENS.STETH);
  const lidoApr = useLidoApr();
  const etrApr = useEthApr();

  return (
    <Card
      {...props}
      css={css`
        background: linear-gradient(65.21deg, #37394a 19.1%, #3e4b4f 100%);
      `}
    >
      <CardRow>
        <CardBalance
          title="Available to stake"
          loading={eth.initialLoading}
          value={<FormatToken amount={eth.data} symbol="ETH" />}
        />
        <CardAccount account={account} />
      </CardRow>
      <Divider />
      <CardRow>
        <CardBalance
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
        <CardBalance
          small
          title={
            <>
              Lido APR{' '}
              {etrApr && etrApr.data && (
                <Tooltip
                  placement="bottom"
                  title={LIDO_APR_TOOLTIP_TEXT.replaceAll(
                    '${apr.eth}',
                    etrApr.data as string,
                  )}
                >
                  <Question />
                </Tooltip>
              )}
            </>
          }
          loading={lidoApr.initialLoading}
          value={<LidoAprStyled>{lidoApr.data}%</LidoAprStyled>}
        />
      </CardRow>
    </Card>
  );
};

export const Wallet: WalletComponentType = memo((props) => {
  const { active } = useWeb3();
  return active ? <WalletComponent {...props} /> : <Fallback {...props} />;
});
