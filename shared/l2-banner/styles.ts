import styled from 'styled-components';
import { Button } from '@lidofinance/lido-ui';
import Icons from 'assets/icons/l2-banner-icons.svg';

export const Wrapper = styled.div`
  margin-top: 16px;
  position: relative;
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 0 ${({ theme }) => theme.spaceMap.lg}px;
  border-radius: ${({ theme }) => theme.borderRadiusesMap.lg}px;
  height: 100px;
  overflow: hidden;
  background-color: #07080c;
  background: radial-gradient(
    100% 459.2% at 0% 0%,
    #3c64b6 0%,
    #2e1d7b 48.8%,
    #142698 100%
  );
  box-sizing: border-box;

  ${({ theme }) => theme.mediaQueries.md} {
    flex-wrap: wrap;
    height: 100px;
    cursor: pointer;
    padding: 0 ${({ theme }) => theme.spaceMap.md}px;
  }

  ${({ theme }) => theme.mediaQueries.sm} {
    padding: 0 ${({ theme }) => theme.spaceMap.sm}px;
    padding-top: ${({ theme }) => theme.spaceMap.sm}px;
    padding-bottom: ${({ theme }) => theme.spaceMap.sm}px;
    gap: 10px;
  }
`;

export const L2Icons = styled.img.attrs({
  src: Icons,
  alt: '',
})`
  position: relative;
  display: block;
  width: 40px;
  height: 40px;
`;

export const TextWrap = styled.div`
  flex: 1 1 auto;
  color: #fff;
  font-size: 12px;
  font-weight: 400;
  position: relative;

  & > b {
    font-weight: 700;
  }

  /* Padding (20px * 2) + Gap (20px) + Logo (40px) = 100px */
  ${({ theme }) => theme.mediaQueries.md} {
    width: calc(100% - 100px);
  }
`;

export const ButtonWrap = styled.div`
  flex: 0 0 auto;
`;

export const ButtonLinkWrap = styled.a`
  display: block;

  ${({ theme }) => theme.mediaQueries.md} {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }
`;

export const ButtonStyle = styled(Button)`
  ${({ theme }) => theme.mediaQueries.md} {
    display: none;
  }
`;
