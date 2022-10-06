import styled from 'styled-components';
import { Popover } from '@lidofinance/lido-ui';

export const TooltipPopoverStyle = styled(Popover)`
  && {
    padding: 12px;
    background: var(--lido-color-accent);
    color: var(--lido-color-accentContrast);
    font-size: ${({ theme }) => theme.fontSizesMap.xxxs}px;
    line-height: 1.8em;
    font-weight: 400;
    max-width: 256px;
    border-radius: ${({ theme }) => theme.borderRadiusesMap.md}px;
    box-shadow: ${({ theme }) => theme.boxShadows.sm}
      var(--lido-color-shadowLight);
    pointer-events: default !important;

    & a {
      text-decoration: none;
      color: var(--lido-color-primary);
    }
  }
`;
