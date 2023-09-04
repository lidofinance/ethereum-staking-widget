import {
  TX_STAGE,
  TX_OPERATION,
} from 'features/withdrawals/shared/tx-stage-modal';
import {
  TX_STAGE as TX_STAGE_LEGACY,
  TX_OPERATION as TX_OPERATION_LEGACY,
} from 'shared/components/tx-stage-modal';

export const convertTxStageToLegacy = (txStage: TX_STAGE) => {
  switch (txStage) {
    case TX_STAGE.SIGN:
      return TX_STAGE_LEGACY.SIGN;
    case TX_STAGE.BLOCK:
      return TX_STAGE_LEGACY.BLOCK;
    case TX_STAGE.FAIL:
      return TX_STAGE_LEGACY.FAIL;
    case TX_STAGE.SUCCESS:
      return TX_STAGE_LEGACY.SUCCESS;
    case TX_STAGE.SUCCESS_MULTISIG:
      return TX_STAGE_LEGACY.SUCCESS_MULTISIG;
    case TX_STAGE.NONE:
      return TX_STAGE_LEGACY.IDLE;
  }
};

export const convertTxStageToLegacyTxOperationWrap = (
  txOperation: TX_OPERATION,
) => {
  if (txOperation === TX_OPERATION.APPROVE)
    return TX_OPERATION_LEGACY.APPROVING;
  return TX_OPERATION_LEGACY.WRAPPING;
};
