import { IdenticonBadge } from '@lidofinance/lido-ui';
import styled from 'styled-components';

export const AddressBadgeStyle = styled((props) => (
  <IdenticonBadge {...props} />
))`
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;

  margin: 0;

  & > * {
    flex-shrink: 0;
  }

  & > :first-child {
    flex-shrink: 1;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;
