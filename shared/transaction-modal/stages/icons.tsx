import { useConnectorInfo } from 'reef-knot/web3-react';

import {
  LedgerFail,
  LedgerConfirm,
  LedgerLoading,
  LedgerSuccess,
  Warning,
} from '@lidofinance/lido-ui';

import {
  LedgerIconWrapper,
  IconWrapper,
  SuccessIcon,
  FailIcon,
  TxLoader,
  WarningIcon,
} from './iconsStyles';

const createStageIcon = (
  iconEl: React.ReactNode,
  ledgerEl: React.ReactNode,
) => {
  return () => {
    const { isLedger } = useConnectorInfo();
    if (isLedger) {
      return <LedgerIconWrapper>{ledgerEl}</LedgerIconWrapper>;
    }
    return <IconWrapper>{iconEl}</IconWrapper>;
  };
};

export const StageIconSuccess = createStageIcon(
  <SuccessIcon />,
  <LedgerSuccess fill="transparent" />,
);

export const StageIconFail = createStageIcon(
  <FailIcon />,
  <LedgerFail fill="transparent" />,
);

export const StageIconSign = createStageIcon(
  <TxLoader size="large" />, // maybe no wrapper
  <LedgerConfirm fill="transparent" />,
);

export const StageIconBlock = createStageIcon(
  <TxLoader size="large" />, // maybe no wrapper
  <LedgerLoading fill="transparent" />,
);

export const StageIconLimit = createStageIcon(
  <Warning />,
  <LedgerFail fill="transparent" />,
);

export const StageIconDialog = createStageIcon(
  <WarningIcon />,
  <WarningIcon />,
);
