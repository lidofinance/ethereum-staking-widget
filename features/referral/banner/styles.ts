import styled, { css } from 'styled-components';

const textStyle = css`
  line-height: 20px;
`;

export const BannerHeader = styled.p`
  color: var(--lido-color-text);
  margin-bottom: ${({ theme }) => theme.spaceMap.sm}px;
  font-size: ${({ theme }) => theme.fontSizes[3]}px;
  font-weight: bold;
  line-height: 24px;
`;

export const BannerTextStyle = styled.p`
  ${textStyle}
`;

export const BannerMainTextStyle = styled.p`
  ${textStyle}

  color: var(--lido-color-text);
  font-weight: bold;
`;
