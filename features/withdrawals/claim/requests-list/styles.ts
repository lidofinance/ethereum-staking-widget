import styled from 'styled-components';
import { InlineLoader, Link } from '@lidofinance/lido-ui';

export const REQUESTS_LIST_ITEM_SIZE = 57;
export const REQUESTS_LIST_LOADERS_COUNT = 3;
export const REQUESTS_LIST_MIN_HEIGHT = 3 * REQUESTS_LIST_ITEM_SIZE;

export const Wrapper = styled.div`
  border-radius: ${({ theme }) => theme.borderRadiusesMap.md}px
    ${({ theme }) => theme.borderRadiusesMap.md}px 0 0;
  border: 1px solid var(--lido-color-accentBorder);
  border-bottom: none;
  background-color: var(--lido-color-backgroundSecondary);
  overflow: hidden;
`;

export const EmptyText = styled.span`
  margin: 0 auto;
  justify-self: center;
  align-self: center;
`;

export const RequestStyled = styled.div<{
  $disabled?: boolean;
  $loading?: boolean;
}>`
  padding: 0 ${({ theme }) => theme.spaceMap.md}px;
  background-color: var(--lido-color-backgroundSecondary);
  border-bottom: 1px solid var(--lido-color-accentBorder);
  display: flex;
  align-items: center;
  height: ${REQUESTS_LIST_ITEM_SIZE}px;
  justify-content: space-between;
  width: 100%;
  box-sizing: border-box;
  &:last-child {
    border-bottom-color: var(--lido-color-backgroundSecondary);
  }

  ${({ $loading }) => $loading && `cursor: progress;`}

  a:visited {
    color: var(--lido-color-primary);
  }
`;

export const RequestsStatusStyled = styled.div<{
  $variant: 'ready' | 'pending';
}>`
  padding: 2px ${({ theme }) => theme.spaceMap.sm}px;
  background-color: ${({ $variant }) =>
    $variant === 'ready'
      ? 'var(--lido-color-success)'
      : 'var(--lido-color-warning)'};
  border-radius: 100px;
  color: white;
  line-height: 20px;
  font-size: 12px;
  margin-left: auto;
  margin-right: 8px;
`;

export const InlineLoaderStyled = styled(InlineLoader)`
  margin-left: ${({ theme }) => theme.spaceMap.lg}px;
`;

export const LinkStyled = styled(Link)`
  margin-right: -6px;
`;

export const WrapperEmpty = styled(Wrapper)`
  display: flex;
  height: ${REQUESTS_LIST_MIN_HEIGHT}px;
`;

export const WrapperLoader = styled(Wrapper)`
  height: ${REQUESTS_LIST_MIN_HEIGHT}px;
`;
