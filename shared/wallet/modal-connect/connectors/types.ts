import React from 'react';
import { ButtonProps } from '@lidofinance/lido-ui';

export type ConnectButtonProps = {
  iconSrcOrReactElement: string | React.ReactElement;
  isTooltipTriggerShown?: boolean;
  tooltipMessage?: string;
} & ButtonProps;

export type ConnectWalletProps = {
  onConnect?: () => void;
  termsChecked?: boolean;
} & ButtonProps;
