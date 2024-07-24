import { memo } from 'react';
import { useAccount } from 'wagmi';

import { TOKENS } from '@lido-sdk/constants';
import { useTokenAddress } from '@lido-sdk/react';
import { Divider, Question, Tooltip } from '@lidofinance/lido-ui';

import { useConfig } from 'config';
import { LIDO_APR_TOOLTIP_TEXT, DATA_UNAVAILABLE } from 'consts/text';
import { CHAINS } from 'consts/chains';

import { TokenToWallet } from 'shared/components';
import { FormatToken } from 'shared/formatters';
import { useLidoApr } from 'shared/hooks';
import { useDappStatus } from 'shared/hooks/use-dapp-status';
import {
  CardAccount,
  CardBalance,
  CardRow,
  Fallback,
  L2Fallback,
} from 'shared/wallet';
import type { WalletComponentType } from 'shared/wallet/types';
import { overrideWithQAMockBoolean } from 'utils/qa';

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
  const { config } = useConfig();
  const { isL2Chain, isDappActive } = useDappStatus();

  // Display L2 banners only for defaultChain=Mainnet
  // Or via QA helpers override
  const showL2Chain = overrideWithQAMockBoolean(
    isL2Chain && config.defaultChain === CHAINS.Mainnet,
    'mock-qa-helpers-show-l2-banners-on-testnet',
  );

  if (showL2Chain) {
    return <L2Fallback {...props} />;
  }

  if (!isDappActive) {
    return <Fallback {...props} />;
  }

  return <WalletComponent {...props} />;
});
