import styled from 'styled-components';

import { useTokenAddress } from '@lido-sdk/react';
import { TOKENS } from '@lido-sdk/constants';
import { InlineLoader } from '@lidofinance/lido-ui';
import { TxAmount } from '../tx-stages-parts/tx-amount';
import { SuccessText } from '../tx-stages-parts/success-text';
import { TxStageSuccess } from '../tx-stages-basic';

import type { BigNumber } from 'ethers';
import { TokenToWallet } from '../../components';

export const SkeletonBalance = styled(InlineLoader).attrs({
  color: 'text',
})`
  margin-left: ${({ theme }) => theme.spaceMap.xs}px;
  width: 100px;
`;

export const BalanceContainer = styled('div')`
  display: inline-block;
  white-space: nowrap;
`;

type TxStageOperationSucceedBalanceShownProps = {
  balance?: BigNumber;
  balanceToken: string;
  operationText: string;
  txHash?: string;
  footer?: React.ReactNode;
};

export const TxStageOperationSucceedBalanceShown = ({
  balance,
  balanceToken,
  operationText,
  txHash,
  footer,
}: TxStageOperationSucceedBalanceShownProps) => {
  const stethAddress = useTokenAddress(TOKENS.STETH);
  const wstethAddress = useTokenAddress(TOKENS.WSTETH);
  const tokenToWalletAddress =
    balanceToken === 'wstETH' ? wstethAddress : stethAddress;

  const balanceEl = balance && (
    <TxAmount amount={balance} symbol={balanceToken} />
  );

  return (
    <TxStageSuccess
      txHash={txHash}
      title={
        <>
          Your new balance is <wbr />
          <BalanceContainer>
            {balance ? balanceEl : <SkeletonBalance />}
            <TokenToWallet
              data-testid="txSuccessAddToken"
              address={tokenToWalletAddress}
            />
          </BalanceContainer>
        </>
      }
      description={
        <SuccessText operationText={operationText} txHash={txHash} />
      }
      showEtherscan={false}
      footer={footer}
    />
  );
};
