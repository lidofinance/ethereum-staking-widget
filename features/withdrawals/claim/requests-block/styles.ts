import styled from 'styled-components';
import Download from 'assets/icons/download.svg';
import { InlineLoader, Link } from '@lidofinance/lido-ui';

export const Wrapper = styled.div`
  border-radius: ${({ theme }) => theme.borderRadiusesMap.md}px;
  border: 1px solid rgba(0, 10, 61, 0.12);
  background-color: var(--lido-color-backgroundSecondary);
  width: 100%;
  margin-bottom: ${({ theme }) => theme.spaceMap.md}px;
  overflow: hidden;
`;

export const EmptyText = styled.span`
  margin: 0 auto;
  justify-self: center;
  align-self: center;
`;

export const RequestStyled = styled.div<{
  disabled?: boolean;
  pending?: boolean;
}>`
  padding: ${({ theme }) => theme.spaceMap.md}px;
  background-color: var(--lido-color-backgroundSecondary);
  border-bottom: 1px solid rgba(0, 10, 61, 0.12);
  display: flex;
  justify-content: space-between;
  width: 100%;
  box-sizing: border-box;
  &:last-child {
    border-bottom-width: 0;
  }
  &:disabled {
    cursor: not-allowed;
  }
  cursor: ${({ disabled, pending }) => {
    switch (true) {
      case disabled:
        return 'not-allowed';
      case pending:
        return 'progress';
      default:
        return 'pointer';
    }
  }};

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

export const DownloadIcon = styled.img.attrs({
  src: Download,
  alt: '',
})`
  display: block;
  width: 16px;
  height: 16px;
  margin: 0 auto;
`;

export const InlineLoaderStyled = styled(InlineLoader)`
  margin-left: ${({ theme }) => theme.spaceMap.lg}px;
`;

export const LinkStyled = styled(Link)`
  margin-right: -6px;
`;

export const ButtonStyled = styled.button`
  background: none;
  color: var(--lido-color-primary);
  border: none;
  font-weight: 400;
  font-size: 12px;
  line-height: 20px;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:focus {
    outline: none;
  }

  &:first-of-type {
    padding-right: 16px;
    border-right: 1px solid var(--lido-color-textSecondary);
    line-height: 8px;
  }

  &:nth-of-type(2) {
    padding-left: 16px;
  }
`;

export const SettingsWrapperStyled = styled.div`
  padding: 10px 20px;
  border-bottom: 1px solid rgba(0, 10, 61, 0.12);
`;

export const EmptyWrapperStyled = styled.div<{ $height: number }>`
  display: flex;
  height: ${({ $height }) => $height}px;
`;
