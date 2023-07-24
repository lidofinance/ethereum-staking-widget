import {
  LedgerFail,
  LedgerConfirm,
  LedgerLoading,
  LedgerSuccess,
  Warning,
} from '@lidofinance/lido-ui';

import {
  FailIcon,
  IconWrapper,
  SuccessIcon,
  TxLoader,
  LedgerIconWrapper,
} from './icons-styles';

import { TX_STAGE } from 'shared/components/tx-stage-modal/types';

export const TX_STAGE_MODAL_ICONS = {
  ledger: {
    [TX_STAGE.SUCCESS]: (
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
    [TX_STAGE.LIMIT]: (
      <LedgerIconWrapper>
        <LedgerFail fill="transparent" />
      </LedgerIconWrapper>
    ),
    [TX_STAGE.BLOCK]: (
      <LedgerIconWrapper>
        <LedgerLoading fill="transparent" />
      </LedgerIconWrapper>
    ),
  },
  default: {
    [TX_STAGE.SUCCESS]: (
      <IconWrapper>
        <SuccessIcon />
      </IconWrapper>
    ),
    [TX_STAGE.FAIL]: (
      <IconWrapper>
        <FailIcon />
      </IconWrapper>
    ),
    [TX_STAGE.LIMIT]: (
      <IconWrapper>
        <Warning />
      </IconWrapper>
    ),
    [TX_STAGE.SIGN]: <TxLoader size="large" />,
    [TX_STAGE.BLOCK]: <TxLoader size="large" />,
  },
};
