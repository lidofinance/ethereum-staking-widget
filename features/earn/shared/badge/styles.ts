import { Tooltip } from '@lidofinance/lido-ui';
import styled from 'styled-components';

export const BadgeStyled = styled.div`
  display: flex;
  padding: 4px 8px 4px 4px;
  justify-content: center;
  align-items: center;
  gap: 4px;
  border-radius: 2px;
  background: rgba(83, 186, 149, 0.1);
  font-size: 10px;
  font-weight: 700;
  line-height: 10px;
  color: var(--lido-color-success);
`;

export const TooltipStyled = styled(Tooltip)`
  margin-top: 16px;
`;
