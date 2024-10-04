import { memo } from 'react';
import { useAccount } from 'wagmi';

import { TOKENS } from '@lido-sdk/constants';
import { useTokenAddress } from '@lido-sdk/react';
import { Divider, Question, Tooltip } from '@lidofinance/lido-ui';

import { LIDO_APR_TOOLTIP_TEXT, DATA_UNAVAILABLE } from 'consts/text';

import { TokenToWallet } from 'shared/components';
import { FormatToken } from 'shared/formatters';
import { useLidoApr } from 'shared/hooks';
import { useDappStatus } from 'shared/hooks/use-dapp-status';
import { useLidoMultichainFallbackCondition } from 'shared/hooks/use-lido-multichain-fallback-condition';
import {
  CardAccount,
  CardBalance,
  CardRow,
  Fallback,
  LidoMultichainFallback,
} from 'shared/wallet';
import type { WalletComponentType } from 'shared/wallet/types';

import { LimitMeter } from './limit-meter';
import { FlexCenter, LidoAprStyled, StyledCard } from './styles';
import { useStakeFormData } from '../stake-form-context';

const WalletComponent: WalletComponentType = (props) => {
  const { address } = useAccount();
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
        <CardAccount account={address as `0x${string}`} />
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
  const { isDappActive, isAccountActiveOnL2 } = useDappStatus();
  const { showLidoMultichainFallback } = useLidoMultichainFallbackCondition();

  if (showLidoMultichainFallback) {
    return <LidoMultichainFallback textEnding={'to stake'} {...props} />;
  }

  if (isAccountActiveOnL2) {
    return (
      <LidoMultichainFallback chainId={10} textEnding={'to stake'} {...props} />
    );
  }

  if (!isDappActive) {
    return <Fallback {...props} />;
  }

  return <WalletComponent {...props} />;
});
