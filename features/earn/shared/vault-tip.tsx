import styled from 'styled-components';

import { Question, Tooltip } from '@lidofinance/lido-ui';

type VaultTipProps = {
  placement?: React.ComponentProps<typeof Tooltip>['placement'];
} & React.ComponentProps<typeof Question>;

const StyledTooltip = styled(Tooltip)`
  font-size: ${({ theme }) => theme.fontSizesMap.xxs}px !important;
  max-width: 290px;
`;

export const VaultTip = ({
  children,
  placement = 'bottom',
  ...rest
}: React.PropsWithChildren<VaultTipProps>) => {
  if (children) {
    return (
      <StyledTooltip title={children} placement={placement}>
        <Question {...rest} />
      </StyledTooltip>
    );
  }
};
