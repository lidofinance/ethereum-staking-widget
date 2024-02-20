import { memo } from 'react';
import { useWeb3 } from 'reef-knot/web3-react';

import { TOKENS } from '@lido-sdk/constants';
import { useSDK, useSTETHBalance, useTokenAddress } from '@lido-sdk/react';
import { Divider, Question, Tooltip } from '@lidofinance/lido-ui';

import { LIDO_APR_TOOLTIP_TEXT, DATA_UNAVAILABLE } from 'consts/text';
import { TokenToWallet } from 'shared/components';
import { FormatToken } from 'shared/formatters';
import { useLidoApr } from 'shared/hooks';
import { CardAccount, CardBalance, CardRow, Fallback } from 'shared/wallet';
import type { WalletComponentType } from 'shared/wallet/types';
import { STRATEGY_LAZY } from 'utils/swrStrategies';

import { LimitMeter } from './limit-meter';
import { FlexCenter, LidoAprStyled, StyledCard } from './styles';
import { useStakeFormData } from '../stake-form-context';

const WalletComponent: WalletComponentType = (props) => {
  const { account } = useSDK();
  const { stakeableEther } = useStakeFormData();
  const steth = useSTETHBalance(STRATEGY_LAZY);

  const stethAddress = useTokenAddress(TOKENS.STETH);
  const lidoApr = useLidoApr();

  return (
    <StyledCard data-testid="stakeCardSection" {...props}>
      <CardRow>
        <CardBalance
          title={
            <FlexCenter>
              <span>Available to stake</span>
              <LimitMeter />
            </FlexCenter>
          }
          loading={!stakeableEther}
          value={
            <FormatToken
              data-testid="ethAvailableToStake"
              showAmountTip
              amount={stakeableEther}
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
          title="Staked amount"
          loading={steth.initialLoading}
          value={
            <>
              <FormatToken
                data-testid="stEthStaked"
                showAmountTip
                amount={steth.data}
                symbol="stETH"
              />
              <TokenToWallet
                data-testid="addStethToWalletBtn"
                address={stethAddress}
              />
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
            <LidoAprStyled data-testid="lidoAprHeader">
              {lidoApr.apr ? `${lidoApr.apr}%` : DATA_UNAVAILABLE}
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
