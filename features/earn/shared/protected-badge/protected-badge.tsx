import type { ReactNode } from 'react';
import styled from 'styled-components';
import { Badge, IconShield, Tooltip } from '@lidofinance/lido-app-ui';

const Trigger = styled.span`
  display: inline-flex;
`;

// the library Badge has no tone, the design uses the info colours
const InfoBadge = styled(Badge)`
  && {
    gap: 0;
    padding: 6px 8px;
    border-color: var(--lido-app-ui-color-border-info);
    background-color: var(--lido-app-ui-color-tint-info);
    color: var(--lido-app-ui-color-text-info);
  }

  && > span:first-child {
    align-items: center;
    justify-content: center;
    color: var(--lido-app-ui-color-text-info);
  }

  && > span:first-child svg {
    width: 20px;
    height: 20px;
  }

  && > span:last-child {
    padding: 0 6px;
  }
`;

type ProtectedBadgeProps = {
  tooltip: ReactNode;
  className?: string;
};

export const ProtectedBadge = ({ tooltip, className }: ProtectedBadgeProps) => (
  <Tooltip content={tooltip} width={360}>
    <Trigger tabIndex={0} className={className} data-testid="protected-badge">
      <InfoBadge icon={<IconShield />}>Protected</InfoBadge>
    </Trigger>
  </Tooltip>
);
