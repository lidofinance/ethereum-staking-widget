import styled from 'styled-components';
import { Link, InlineLoader } from '@lidofinance/lido-ui';

export const StylableLink = styled(Link)`
  &[aria-disabled='true'] {
    cursor: not-allowed;
    opacity: 0.5 !important;
  }
`;

export const SkeletonBalance = styled(InlineLoader).attrs({
  color: 'text',
})`
  margin-left: ${({ theme }) => theme.spaceMap.xs}px;
  width: 100px;
`;
