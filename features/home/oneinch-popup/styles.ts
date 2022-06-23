import { Button } from '@lidofinance/lido-ui';
import styled from 'styled-components';

export const ButtonWithMargin = styled(Button)`
  margin: ${({ theme }) => theme.spaceMap.md}px 0;
`;

export const GreenSpan = styled.span`
  color: ${({ theme }) => theme.colors.success};
  font-size: large;
  font-weight: bold;
`;
