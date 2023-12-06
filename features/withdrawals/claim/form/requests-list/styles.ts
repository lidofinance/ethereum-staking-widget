import styled from 'styled-components';
import { InlineLoader, Link, ThemeName } from '@lidofinance/lido-ui';

import RequestReady from 'assets/icons/request-ready.svg';
import RequestPending from 'assets/icons/request-pending.svg';

export const REQUESTS_LIST_ITEM_SIZE = 57;
export const REQUESTS_LIST_LOADERS_COUNT = 3;
export const REQUESTS_LIST_MIN_HEIGHT = 3 * REQUESTS_LIST_ITEM_SIZE;

export const Wrapper = styled.div`
  border-radius: ${({ theme }) => theme.borderRadiusesMap.md}px
    ${({ theme }) => theme.borderRadiusesMap.md}px 0 0;
  border: 1px solid var(--lido-color-foreground);
  border-bottom: none;
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
  padding: ${({ theme }) => theme.spaceMap.md}px
    ${({ theme }) => theme.spaceMap.lg}px;
  padding-right: 12px;
  border-bottom: 1px solid var(--lido-color-foreground);
  background-color: ${({ theme }) =>
    theme.name === ThemeName.light ? '#F2F5F8' : '#2A2A31'};
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

type RequestProps = {
  $variant: 'ready' | 'pending';
};

export const RequestsStatusStyled = styled.div<RequestProps>`
  height: 24px;
  margin-left: auto;
  margin-right: 8px;
  padding: 2px ${({ theme }) => theme.spaceMap.sm}px;
  ${({ theme }) => theme.mediaQueries.sm} {
    min-width: 24px;
    justify-content: center;
  }
  gap: 8px;
  border-radius: 48px;
  display: flex;
  align-items: center;

  background-color: ${({ $variant }) =>
    $variant === 'ready'
      ? 'rgba(83, 186, 149, 0.16)'
      : 'rgba(236, 134, 0, 0.16)'};

  ${({ $variant }) =>
    $variant === 'pending' &&
    `&:hover {
        background-color: rgba(236, 134, 0, 0.26);
      }`}

  color: ${({ $variant }) => ($variant === 'ready' ? '#53BA95' : '#EC8600')};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const StatusText = styled.span`
  font-size: 12px;
  font-weight: 600;
`;

export const StatusIcon = styled.img.attrs<RequestProps>(({ $variant }) => ({
  alt: $variant,
  src: $variant === 'ready' ? RequestReady : RequestPending,
}))<RequestProps>`
  display: block;
  width: 16px;
  height: 16px;
`;

export const InlineLoaderStyled = styled(InlineLoader)`
  margin-left: ${({ theme }) => theme.spaceMap.lg}px;
`;

export const LinkStyled = styled(Link)`
  display: flex;
  width: 24px;
  height: 24px;

  background: rgba(0, 163, 255, 0.1);
  border-radius: 4px;

  &:hover {
    background: rgba(0, 163, 255, 0.2);
  }
`;

export const WrapperEmpty = styled(Wrapper)`
  display: flex;
  height: ${REQUESTS_LIST_MIN_HEIGHT}px;
`;

export const WrapperLoader = styled(Wrapper)`
  height: ${REQUESTS_LIST_MIN_HEIGHT}px;
`;
