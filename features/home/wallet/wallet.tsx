import { TOKENS } from '@lido-sdk/constants';
import { useSDK, useSTETHBalance, useTokenAddress } from '@lido-sdk/react';
import { useWeb3 } from '@lido-sdk/web3-react';
import { Divider, Question, Tooltip } from '@lidofinance/lido-ui';
import { LIDO_APR_TOOLTIP_TEXT } from 'config';
import { memo } from 'react';
import { TokenToWallet } from 'shared/components';
import { FormatToken } from 'shared/formatters';
import { useLidoApr } from 'shared/hooks';
import { DATA_UNAVAILABLE } from 'config';
import { CardAccount, CardBalance, CardRow, Fallback } from 'shared/wallet';
import type { WalletComponentType } from 'shared/wallet/types';
import { useStakeableEther } from '../hooks';
import { LimitMeter } from './limit-meter';
import { FlexCenter, LidoAprStyled, StyledCard } from './styles';

const WalletComponent: WalletComponentType = (props) => {
  const { account } = useSDK();
  const stakeableEther = useStakeableEther();
  const steth = useSTETHBalance();

  const stethAddress = useTokenAddress(TOKENS.STETH);
  const lidoApr = useLidoApr();

  return (
    <StyledCard {...props}>
      <CardRow>
        <CardBalance
          title={
            <FlexCenter>
              <span>Available to stake</span>
              <LimitMeter />
            </FlexCenter>
          }
          loading={stakeableEther.initialLoading}
          value={<FormatToken amount={stakeableEther.data} symbol="ETH" />}
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
              {lidoApr && lidoApr.data && (
                <Tooltip placement="bottom" title={LIDO_APR_TOOLTIP_TEXT}>
                  <Question />
                </Tooltip>
              )}
            </>
          }
          loading={lidoApr.initialLoading}
          value={
            <LidoAprStyled>
              {lidoApr.data ? `${lidoApr.data}%` : DATA_UNAVAILABLE}
            </LidoAprStyled>
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
