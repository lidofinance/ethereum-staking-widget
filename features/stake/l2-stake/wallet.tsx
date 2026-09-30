import { Divider } from '@lidofinance/lido-ui';

import { TokenToWallet } from 'shared/components';
import { FormatToken } from 'shared/formatters';
import { CardNetwork, CardBalance, CardRow, Fallback } from 'shared/wallet';
import { CHAINS } from 'config';

import {
  useDappStatus,
  useStETHByWstETH,
  useWstethBalance,
} from 'modules/web3';

// TODO:  to shared
import { WalletCardBackdrop } from 'shared/wallet/fallback/lido-multichain-fallback';

import { WalletLidoApr } from '../shared/wallet-lido-apr';
import { useL2StakeFormData } from './l2-stake-form-context';

const WalletComponent = () => {
  const { chainId, isChainIdOnL2 } = useDappStatus();
  const {
    data: wstethBalance,
    isLoading: wstethBalanceLoading,
    tokenAddress,
  } = useWstethBalance();
  const { data: stethByWsteth, isLoading: stethByWstethLoading } =
    useStETHByWstETH(wstethBalance, CHAINS.Mainnet);
  const { stakeableEther, loading } = useL2StakeFormData();

  return (
    <WalletCardBackdrop
      data-testid="stakeCardSection"
      multiChainId={isChainIdOnL2 ? chainId : undefined}
    >
      <CardRow>
        <CardBalance
          title={'Available to stake'}
          loading={loading.isStakeableEtherLoading}
          value={
            <FormatToken
              data-testid="ethAvailableToStake"
              amount={stakeableEther}
              symbol="ETH"
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
    </WalletCardBackdrop>
  );
};

export const Wallet = () => {
  return (
    <Fallback toActionText="to stake">
      <WalletComponent />
    </Fallback>
  );
};
