import { Divider } from '@lidofinance/lido-ui';

import { TokenToWallet } from 'shared/components';
import { FormatToken } from 'shared/formatters';
import {
  CardNetwork,
  CardBalance,
  CardRow,
  Fallback,
  MultiChainWalletBackdrop,
} from 'shared/wallet';
import { CHAINS } from 'config';

import {
  useDappStatus,
  useStETHByWstETH,
  useWstethBalance,
} from 'modules/web3';

import { WalletLidoApr } from '../shared/wallet-lido-apr';
import { useL2StakeFormData } from './l2-stake-form-context';
import { useL2StakeState } from './hooks/use-l2-stake-state';

const WalletComponent = () => {
  const { chainId, isChainIdOnL2 } = useDappStatus();
  const {
    data: wstethBalance,
    isLoading: wstethBalanceLoading,
    tokenAddress,
  } = useWstethBalance();
  const { data: stethByWsteth, isLoading: stethByWstethLoading } =
    useStETHByWstETH(wstethBalance, CHAINS.Mainnet);
  const { stakeableAmount, isStakeableAmountLoading, token } =
    useL2StakeFormData();

  return (
    <MultiChainWalletBackdrop
      data-testid="stakeCardSection"
      multiChainId={isChainIdOnL2 ? chainId : undefined}
    >
      <CardRow>
        <CardBalance
          title={'Available to stake'}
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
          loading={stethByWstethLoading || wstethBalanceLoading}
          extra={
            <FormatToken
              data-testid="stEthByWstEth"
              amount={stethByWsteth}
              symbol="ETH"
              approx={true}
            />
          }
          value={
            <>
              <FormatToken
                data-testid="wstEthStaked"
                amount={wstethBalance}
                symbol="wstETH"
              />
              <TokenToWallet
                data-testid="addWstethToWalletBtn"
                address={tokenAddress}
              />
            </>
          }
        />
        <WalletLidoApr />
      </CardRow>
    </MultiChainWalletBackdrop>
  );
};

export const Wallet = () => {
  const { isEnabled, reason } = useL2StakeState();

  if (!isEnabled) {
    return <Fallback error={reason ?? 'Staking is currently not available'} />;
  }
  return (
    <Fallback toActionText="to stake">
      <WalletComponent />
    </Fallback>
  );
};
