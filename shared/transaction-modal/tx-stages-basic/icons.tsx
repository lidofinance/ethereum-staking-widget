import { useConnectorInfo } from 'reef-knot/core-react';

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

type StageIconProps = {
  showLedger?: boolean;
};

const createStageIcon = (
  iconEl: React.ReactNode,
  ledgerEl: React.ReactNode,
) => {
  return ({ showLedger = true }: StageIconProps) => {
    const { isLedger } = useConnectorInfo();
    if (isLedger && showLedger) {
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
  <TxLoader size="large" />,
  <LedgerConfirm fill="transparent" />,
);

export const StageIconLoader = createStageIcon(
  <TxLoader size="large" />,
  <LedgerLoading fill="transparent" />,
);

export const StageIconLimit = createStageIcon(
  <Warning />,
  <LedgerFail fill="transparent" />,
);

export const StageIconWarning = createStageIcon(
  <WarningIcon />,
  <WarningIcon />,
);
