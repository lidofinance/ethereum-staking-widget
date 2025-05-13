import styled from 'styled-components';

export const BannerWrap = styled.div`
  position: relative;
  text-align: left;
  padding: 16px;
  border-radius: 16px;
  background-color: ${({ theme }) =>
    theme.name === 'dark' ? '#28282f' : '#f2f3fc'};
`;

export const BannerTitleText = styled.div`
  font-size: 20px;
  line-height: 28px;
  font-weight: 400;
  color: var(--lido-color-text);

  ${({ theme }) => theme.mediaQueries.md} {
    font-size: 16px;
    line-height: 24px;
  }
`;
