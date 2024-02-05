import { useSTETHBalance } from '@lido-sdk/react';
import { TxStageOperationSucceedBalanceShown } from 'shared/transaction-modal/tx-stages-composed/tx-stage-operation-succeed-balance-shown';
import { STRATEGY_LAZY } from 'utils/swrStrategies';

type TxStageStakeSucceedProps = {
  txHash?: string;
};

export const TxStageStakeSucceed = ({ txHash }: TxStageStakeSucceedProps) => {
  const { data: stethBalance } = useSTETHBalance(STRATEGY_LAZY);

  return (
    <TxStageOperationSucceedBalanceShown
      balance={stethBalance}
      balanceToken="stETH"
      operationText="Stake"
      txHash={txHash}
    />
  );
};
