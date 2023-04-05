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
import { TX_STAGE } from '../types';

export const iconsDict = {
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
    [TX_STAGE.BLOCK]: (
      <LedgerIconWrapper>
        <LedgerLoading fill="transparent" />
      </LedgerIconWrapper>
    ),
    [TX_STAGE.PERMIT]: (
      <LedgerIconWrapper>
        <LedgerLoading fill="transparent" />
      </LedgerIconWrapper>
    ),
    [TX_STAGE.BUNKER]: (
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
    [TX_STAGE.FAIL]: (
      <IconWrapper>
        <FailIcon />
      </IconWrapper>
    ),
    [TX_STAGE.SIGN]: <TxLoader size="large" />,
    [TX_STAGE.BLOCK]: <TxLoader size="large" />,
    [TX_STAGE.PERMIT]: <TxLoader size="large" />,
    [TX_STAGE.BUNKER]: (
      <IconWrapper>
        <WarningIcon />
      </IconWrapper>
    ),
  },
};
