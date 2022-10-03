import styled from 'styled-components';
import { Popover } from '@lidofinance/popover';

export const TooltipPopoverStyle = styled(Popover)`
  && {
    padding: 12px;
    background: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.accentContrast};
    font-size: ${({ theme }) => theme.fontSizesMap.xxxs}px;
    line-height: 1.8em;
    font-weight: 400;
    max-width: 256px;
    border-radius: ${({ theme }) => theme.borderRadiusesMap.md}px;
    box-shadow: ${({ theme }) =>
      `${theme.boxShadows.sm} ${theme.colors.shadowLight}`};
    pointer-events: default !important;

    & a {
      text-decoration: none;
      color: ${(props) => props.theme.colors.primary};
    }
  }
`;
