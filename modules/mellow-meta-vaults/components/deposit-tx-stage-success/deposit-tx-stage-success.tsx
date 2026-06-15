import { Hash } from 'viem';
import { TxStageSuccess } from 'shared/transaction-modal/tx-stages-basic';
import { TxAmount } from 'shared/transaction-modal/tx-stages-parts/tx-amount';
import { type TokenSymbol } from 'consts/tokens';

type DepositData = { amount: bigint; token: TokenSymbol };

type Props = {
  txHash?: Hash;
  syncDeposit?: DepositData;
  asyncDeposit?: DepositData;
};

export const DepositTxStageSuccess = ({
  txHash,
  syncDeposit,
  asyncDeposit,
}: Props) => {
  if (asyncDeposit) {
    return (
      <TxStageSuccess
        txHash={txHash}
        title="Request to deposit has been sent"
        description={
          <>
            <TxAmount
              amount={asyncDeposit.amount}
              symbol={asyncDeposit.token}
            />{' '}
            deposit request has been sent
          </>
        }
        showEtherscan
      />
    );
  }

  return (
    <TxStageSuccess
      txHash={txHash}
      title={
        syncDeposit ? (
          <>
            You received{' '}
            <TxAmount amount={syncDeposit.amount} symbol={syncDeposit.token} />
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
