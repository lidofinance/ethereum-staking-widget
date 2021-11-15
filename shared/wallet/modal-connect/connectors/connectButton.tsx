import React, { FC, isValidElement } from 'react';
import { Tooltip } from '@lidofinance/lido-ui';
import {
  ConnectButtonStyle,
  ConnectButtonContentStyle,
  ConnectButtonIconStyle,
  ConnectButtonTitleStyle,
  ConnectButtonTooltipTriggerStyle,
} from './connectButtonStyles';
import { ConnectButtonProps } from './types';

const ConnectButton: FC<ConnectButtonProps> = (props) => {
  const {
    iconSrcOrReactElement,
    children,
    isTooltipTriggerShown,
    tooltipMessage,
    ...rest
  } = props;

  return (
    <ConnectButtonStyle {...rest}>
      <ConnectButtonContentStyle>
        <ConnectButtonTitleStyle>{children}</ConnectButtonTitleStyle>
        {isTooltipTriggerShown && tooltipMessage && (
          <Tooltip offset="sm" placement="bottomLeft" title={tooltipMessage}>
            <ConnectButtonTooltipTriggerStyle>
              How to enable?
            </ConnectButtonTooltipTriggerStyle>
          </Tooltip>
        )}
        <ConnectButtonIconStyle>
          {typeof iconSrcOrReactElement === 'string' && (
            <img src={iconSrcOrReactElement} alt="" />
          )}
          {isValidElement(iconSrcOrReactElement) && iconSrcOrReactElement}
        </ConnectButtonIconStyle>
      </ConnectButtonContentStyle>
    </ConnectButtonStyle>
  );
};

export default ConnectButton;
