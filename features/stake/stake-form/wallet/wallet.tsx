import { LIDO_TOKENS } from '@lidofinance/lido-ethereum-sdk/common';
import { Divider } from '@lidofinance/lido-ui';

import { TokenToWallet } from 'shared/components';
import { FormatToken } from 'shared/formatters';
import { useTokenAddress } from 'shared/hooks/use-token-address';
import { CardNetwork, CardBalance, CardRow, Fallback } from 'shared/wallet';
import { useDappStatus } from 'modules/web3';

import { useStakeFormData } from '../stake-form-context';

import { LimitMeter } from './limit-meter';
import { FlexCenter, StyledCard } from './styles';

import { WalletLidoApr } from 'features/stake/shared/wallet-lido-apr';

const WalletComponent = () => {
  const { chainId, isChainIdOnL2 } = useDappStatus();
  const {
    stakeableAmount,
    isStakeableAmountLoading,
    token,
    stethBalance,
    loading,
  } = useStakeFormData();

  const stethAddress = useTokenAddress(LIDO_TOKENS.steth);

  return (
    <StyledCard
      data-testid="stakeCardSection"
      data-winter-anchor="stake-top"
      multiChainId={isChainIdOnL2 ? chainId : undefined}
    >
      <CardRow>
        <CardBalance
          title={
            <FlexCenter>
              <span>Available to stake</span>
              <LimitMeter />
            </FlexCenter>
          }
          loading={isStakeableAmountLoading}
          value={
            <FormatToken
              data-testid="ethAvailableToStake"
              amount={stakeableAmount}
              symbol={token}
            />
          }
        />
        <CardNetwork />
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
        <WalletLidoApr />
      </CardRow>
    </StyledCard>
  );
};

export const Wallet = () => {
  return (
    // the error card stands in for the wallet card: Lido-man peeks over it
    <Fallback toActionText="to stake" data-winter-anchor="stake-top">
      <WalletComponent />
    </Fallback>
  );
};
