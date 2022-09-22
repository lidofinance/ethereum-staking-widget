import styled, { css } from 'styled-components';

const textStyle = css`
  margin-top: ${({ theme }) => theme.spaceMap.lg}px;
  line-height: 20px;
`;

export const BannerHeader = styled.p`
  color: ${({ theme }) => theme.colors.text};
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

  color: ${({ theme }) => theme.colors.text};
  font-weight: bold;
`;
