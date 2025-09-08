import { LIDO_TOKENS } from '@lidofinance/lido-ethereum-sdk/common';
import { Divider, Question, Tooltip } from '@lidofinance/lido-ui';

import { LIDO_APR_TOOLTIP_TEXT, DATA_UNAVAILABLE } from 'consts/text';

import { TokenToWallet } from 'shared/components';
import { FormatToken } from 'shared/formatters';
import { useLidoApr } from 'shared/hooks';
import { useTokenAddress } from 'shared/hooks/use-token-address';
import { CardAccount, CardBalance, CardRow, Fallback } from 'shared/wallet';

import { useStakeFormData } from '../stake-form-context';

import { LimitMeter } from './limit-meter';
import { FlexCenter, LidoAprStyled, StyledCard } from './styles';

const WalletComponent = () => {
  const { stakeableEther, stethBalance, loading } = useStakeFormData();

  const stethAddress = useTokenAddress(LIDO_TOKENS.steth);
  const lidoApr = useLidoApr();

  return (
    <StyledCard data-testid="stakeCardSection">
      <CardRow>
        <CardBalance
          title={
            <FlexCenter>
              <span>Available to stake</span>
              <LimitMeter />
            </FlexCenter>
          }
          loading={loading.isStakeableEtherLoading}
          value={
            <FormatToken
              data-testid="ethAvailableToStake"
              amount={stakeableEther}
              symbol="ETH"
            />
          }
        />
        <CardAccount />
      </CardRow>
      <Divider />
      <CardRow>
        <CardBalance
          small
          title="Staked amount"
          loading={loading.isStethBalanceLoading}
          value={
            <>
              <FormatToken
                data-testid="stEthStaked"
                amount={stethBalance}
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
              Lido APR *{' '}
              {lidoApr.data && (
                <Tooltip placement="bottom" title={LIDO_APR_TOOLTIP_TEXT}>
                  <Question />
                </Tooltip>
              )}
            </>
          }
          loading={lidoApr.isLoading}
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

export const Wallet = () => {
  return (
    <Fallback toActionText="to stake">
      <WalletComponent />
    </Fallback>
  );
};
