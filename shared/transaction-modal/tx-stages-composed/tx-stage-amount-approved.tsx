import { BigNumber } from 'ethers';
import { SuccessText } from '../tx-stages-parts/success-text';
import { TxAmount } from '../tx-stages-parts/tx-amount';
import { TxStageSuccess } from '../tx-stages-basic/tx-stage-success';

type TxStageAmountApprovedProps = {
  amount: BigNumber;
  token: string;
  txHash: string;
};

export const TxStageAmountApproved = ({
  amount,
  token,
  txHash,
}: TxStageAmountApprovedProps) => {
  const amountEl = <TxAmount amount={amount} symbol={token} />;
  return (
    <TxStageSuccess
      txHash={txHash}
      title={<>{amountEl} was unlocked to wrap.</>}
      description={<SuccessText operationText="Unlock" txHash={txHash} />}
    />
  );
};
