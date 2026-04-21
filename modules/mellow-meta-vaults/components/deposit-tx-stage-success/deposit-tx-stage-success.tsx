import { Hash } from 'viem';
import { TxStageSuccess } from 'shared/transaction-modal/tx-stages-basic';
import { TxAmount } from 'shared/transaction-modal/tx-stages-parts/tx-amount';
import { type TokenSymbol } from 'consts/tokens';

type Props = {
  txHash?: Hash;
  receivedShares?: bigint;
  willReceiveToken: TokenSymbol;
};

export const DepositTxStageSuccess = ({
  txHash,
  receivedShares,
  willReceiveToken,
}: Props) => {
  return (
    <TxStageSuccess
      txHash={txHash}
      title={
        receivedShares !== undefined ? (
          <>
            You received{' '}
            <TxAmount amount={receivedShares} symbol={willReceiveToken} />
          </>
        ) : (
          'Deposit successful'
        )
      }
      description="Depositing operation was successful"
      showEtherscan
    />
  );
};
