import { TxStageSign } from '../tx-stages-basic/tx-stage-sign';
import { TxStagePending } from '../tx-stages-basic/tx-stage-pending';
import { TxAmount } from '../tx-stages-parts/tx-amount';

type TxStageSignOperationAmountProps = {
  amount: bigint;
  token: string;
  operationText: string;
  willReceive?: bigint;
  willReceiveToken?: string;
  isPending?: boolean;
  txHash?: string;
};

export const TxStageSignOperationAmount = ({
  amount,
  token,
  willReceive,
  willReceiveToken,
  operationText,
  isPending,
  txHash,
}: TxStageSignOperationAmountProps) => {
  const amountEl = <TxAmount amount={amount} symbol={token} />;
  const willReceiveEl = willReceive && willReceiveToken && (
    <TxAmount amount={willReceive} symbol={willReceiveToken} />
  );
  const Component = isPending ? TxStagePending : TxStageSign;

  return (
    <Component
      txHash={txHash}
      title={
        <>
          You are {operationText.toLowerCase()} {amountEl}
        </>
      }
      description={
        !isPending && (
          <>
            {operationText} {amountEl}.{' '}
            {willReceiveEl && (
              <>
                <br />
                You will receive {willReceiveEl}.
              </>
            )}
          </>
        )
      }
    />
  );
};
