import styled from 'styled-components';

import { useTokenAddress } from '@lido-sdk/react';
import { TOKENS } from '@lido-sdk/constants';
import { InlineLoader } from '@lidofinance/lido-ui';
import { L2AfterStake } from 'shared/banners/l2-banners/l2-after-stake';
import { L2AfterWrap } from 'shared/banners/l2-banners/l2-after-wrap';
import { VaultsBannerStrategies } from 'shared/banners/vaults-banner-strategies';
import { TxAmount } from '../tx-stages-parts/tx-amount';
import { SuccessText } from '../tx-stages-parts/success-text';
import { TxStageSuccess } from '../tx-stages-basic';

import type { BigNumber } from 'ethers';
import { useFeatureFlag, VAULTS_BANNER_IS_ENABLED } from 'config/feature-flags';
import { TokenToWallet } from '../../components';

export const SkeletonBalance = styled(InlineLoader).attrs({
  color: 'text',
})`
  margin-left: ${({ theme }) => theme.spaceMap.xs}px;
  width: 100px;
`;

type TxStageOperationSucceedBalanceShownProps = {
  balance?: BigNumber;
  balanceToken: string;
  operationText: string;
  txHash?: string;
};

export const TxStageOperationSucceedBalanceShown = ({
  balance,
  balanceToken,
  operationText,
  txHash,
}: TxStageOperationSucceedBalanceShownProps) => {
  const { vaultsBannerIsEnabled } = useFeatureFlag(VAULTS_BANNER_IS_ENABLED);
  const stethAddress = useTokenAddress(TOKENS.STETH);
  const wstethAddress = useTokenAddress(TOKENS.WSTETH);
  const tokenToWalletAddress =
    balanceToken === 'wstETH' ? wstethAddress : stethAddress;

  const balanceEl = balance && (
    <TxAmount amount={balance} symbol={balanceToken} />
  );

  const renderBanner = () => {
    if (vaultsBannerIsEnabled) return <VaultsBannerStrategies />;
    if (balanceToken === 'stETH') return <L2AfterStake />;
    if (balanceToken === 'wstETH') return <L2AfterWrap />;
    return undefined;
  };

  return (
    <TxStageSuccess
      txHash={txHash}
      title={
        <>
          Your new balance is <wbr />
          {balance ? balanceEl : <SkeletonBalance />}
          <TokenToWallet
            data-testid="txSuccessAddToken"
            address={tokenToWalletAddress}
          />
        </>
      }
      description={
        <SuccessText operationText={operationText} txHash={txHash} />
      }
      showEtherscan={false}
      footer={renderBanner()}
    />
  );
};
