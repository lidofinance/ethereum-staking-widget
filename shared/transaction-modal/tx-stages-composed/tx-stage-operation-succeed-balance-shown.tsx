import { TxStageSuccess } from '../tx-stages-basic';

import { TxAmount } from '../tx-stages-parts/tx-amount';
import type { BigNumber } from 'ethers';
import { L2LowFee } from 'shared/banners/l2-low-fee';
import { SkeletonBalance } from '../transaction-modal-stages-routed/styles';
import { SuccessText } from '../tx-stages-parts/success-text';

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
  const balanceEl = balance && (
    <TxAmount amount={balance} symbol={balanceToken} />
  );

  return (
    <TxStageSuccess
      txHash={txHash}
      title={
        <>
          Your new balance is <wbr />
          {balance ? balanceEl : <SkeletonBalance />}
        </>
      }
      description={
        <SuccessText operationText={operationText} txHash={txHash} />
      }
      showEtherscan={false}
      footer={
        balanceToken === 'stETH' || balanceToken === 'wstETH' ? (
          <L2LowFee token={balanceToken} />
        ) : undefined
      }
    />
  );
};
