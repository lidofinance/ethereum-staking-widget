import styled, { css } from 'styled-components';
import WarningIconSrc from 'assets/icons/attention-triangle.svg';
import InfoIconSrc from 'assets/icons/info-warning.svg';
import { BannerProps } from './info-banner';

export const WarningIcon = styled.img.attrs({
  src: WarningIconSrc,
  alt: 'warning',
})`
  display: block;
  width: 24px;
  height: 24px;
`;

export const InfoWarningIcon = styled.img.attrs({
  src: InfoIconSrc,
  alt: 'info',
})`
  display: block;
  width: 14px;
  height: 14px;
  margin: 5px;
`;

export const WarningContainer = styled.div<BannerProps>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spaceMap.sm}px;
  padding: ${({ theme }) => theme.spaceMap.md}px;

  border-radius: ${({ theme }) => theme.borderRadiusesMap.lg}px;
  background-color: #fdf3e5;

  ${({ variant }) =>
    variant === 'info' &&
    css`
      background-color: ${({ theme }) =>
        theme.name === 'light' ? `#F6F7F8` : 'var(--lido-color-controlBg)'};
    `}

  ${({ theme }) => theme.mediaQueries.md} {
    padding: 12px;
  }
`;

export const WarningContent = styled.div<BannerProps>`
  flex: 0 1 auto;

  font-size: 12px;
  font-weight: 700;
  line-height: 20px;

  ${({ theme }) => theme.mediaQueries.md} {
    padding-right: 0px;
  }

  color: var(--lido-color-warning);
  ${({ variant }) =>
    variant === 'info' &&
    css`
      font-weight: 400;
      color: var(--lido-color-textSecondary);
    `}
`;
