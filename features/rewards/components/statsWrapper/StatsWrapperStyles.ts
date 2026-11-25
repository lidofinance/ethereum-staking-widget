import styled from 'styled-components';
import { Block } from '@lidofinance/lido-ui';

// data-snow-surface: the holiday theme lays a snow drift on it
export const StatsWrapperStyle = styled(Block).attrs({
  'data-snow-surface': 'card',
})`
  padding: 0;
`;

export const StatsContentWrapper = styled(Block)`
  display: flex;
  flex-wrap: wrap;
`;
