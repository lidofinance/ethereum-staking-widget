import { memo } from 'react';
import { useWeb3 } from 'reef-knot/web3-react';
import { TOKENS } from '@lido-sdk/constants';
import { useSDK, useTokenAddress } from '@lido-sdk/react';
import { Divider, Question, Tooltip } from '@lidofinance/lido-ui';

import { L2_CHAINS } from 'consts/chains';
import { LIDO_APR_TOOLTIP_TEXT, DATA_UNAVAILABLE } from 'consts/text';
import { TokenToWallet } from 'shared/components';
import { FormatToken } from 'shared/formatters';
import { useLidoApr } from 'shared/hooks';
import {
  CardAccount,
  CardBalance,
  CardRow,
  Fallback,
  L2Fallback,
} from 'shared/wallet';
import type { WalletComponentType } from 'shared/wallet/types';

import { LimitMeter } from './limit-meter';
import { FlexCenter, LidoAprStyled, StyledCard } from './styles';
import { useStakeFormData } from '../stake-form-context';

const WalletComponent: WalletComponentType = (props) => {
  const { account } = useSDK();
  const { stakeableEther, stethBalance, loading } = useStakeFormData();

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
          loading={loading.isStakeableEtherLoading}
          value={
            <FormatToken
              data-testid="ethAvailableToStake"
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
              Lido APR{' '}
              {lidoApr.data && (
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
  const { chainId, active } = useWeb3();

  // The widget currently doesn't support L2 networks so there is no point in checking `active from useWeb3()` first
  if (Object.values(L2_CHAINS).indexOf(chainId as unknown as L2_CHAINS) > -1) {
    return <L2Fallback {...props} />;
  }

  return active ? <WalletComponent {...props} /> : <Fallback {...props} />;
});
