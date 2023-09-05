import {
  LedgerFail,
  LedgerConfirm,
  LedgerLoading,
  LedgerSuccess,
} from '@lidofinance/lido-ui';

import {
  LedgerIconWrapper,
  IconWrapper,
  SuccessIcon,
  FailIcon,
  TxLoader,
  WarningIcon,
} from './iconsStyles';
import { TX_STAGE } from 'shared/transaction-modal';

export const iconsDict = {
  ledger: {
    [TX_STAGE.SUCCESS]: (
      <LedgerIconWrapper>
        <LedgerSuccess fill="transparent" />
      </LedgerIconWrapper>
    ),
    [TX_STAGE.SUCCESS_MULTISIG]: (
      <LedgerIconWrapper>
        <LedgerSuccess fill="transparent" />
      </LedgerIconWrapper>
    ),
    [TX_STAGE.SIGN]: (
      <LedgerIconWrapper>
        <LedgerConfirm fill="transparent" />
      </LedgerIconWrapper>
    ),
    [TX_STAGE.FAIL]: (
      <LedgerIconWrapper>
        <LedgerFail fill="transparent" />
      </LedgerIconWrapper>
    ),
    [TX_STAGE.BLOCK]: (
      <LedgerIconWrapper>
        <LedgerLoading fill="transparent" />
      </LedgerIconWrapper>
    ),
    ['DIALOG']: (
      <LedgerIconWrapper>
        <WarningIcon />
      </LedgerIconWrapper>
    ),
  },
  default: {
    [TX_STAGE.SUCCESS]: (
      <IconWrapper>
        <SuccessIcon />
      </IconWrapper>
    ),
    [TX_STAGE.SUCCESS_MULTISIG]: (
      <IconWrapper>
        <SuccessIcon />
      </IconWrapper>
    ),
    [TX_STAGE.FAIL]: (
      <IconWrapper>
        <FailIcon />
      </IconWrapper>
    ),
    [TX_STAGE.SIGN]: <TxLoader size="large" />,
    [TX_STAGE.BLOCK]: <TxLoader size="large" />,
    ['DIALOG']: (
      <IconWrapper>
        <WarningIcon />
      </IconWrapper>
    ),
  },
};

export const getStageIcon = (isLedger: boolean, stage: TX_STAGE | 'DIALOG') => {
  if (stage === TX_STAGE.NONE) return null;
  return iconsDict[isLedger ? 'ledger' : 'default'][stage] ?? null;
};
