import styled from 'styled-components';
import { Button } from '@lidofinance/lido-ui';
import Icons from 'assets/icons/l2-swap.svg';

export const Wrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spaceMap.lg}px;
  border-radius: ${({ theme }) => theme.borderRadiusesMap.lg}px;
  height: 160px;
  gap: 10px;
  overflow: hidden;
  background-color: #07080c;
  background: radial-gradient(
      138.42% 124.8% at 6.55% 17.29%,
      #3c64b6 0%,
      #2e1d7b 55.75%,
      #142698 100%
    ),
    linear-gradient(90deg, #3487e5 0%, #006ae3 46.27%);
  box-sizing: border-box;

  ${({ theme }) => theme.mediaQueries.md} {
    gap: 6px;
    padding: ${({ theme }) => theme.spaceMap.md}px;
  }

  ${({ theme }) => theme.mediaQueries.sm} {
    cursor: pointer;
    padding: ${({ theme }) => theme.spaceMap.sm}px;
  }
`;

export const L2Icons = styled.img.attrs({
  src: Icons,
  alt: '',
})`
  position: relative;
  display: block;
  width: 44px;
  height: 120px;
`;

export const ContentWrap = styled.div`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
`;

export const TextHeader = styled.div`
  font-size: 14px;
  line-height: 24px;
  font-weight: 700;
  color: #fff;
`;

export const TextWrap = styled.div`
  flex: 1 1 auto;
  color: #fff;
  line-height: 20px;
  font-size: 12px;
  font-weight: 400;
  position: relative;
`;

export const ButtonWrap = styled.div`
  display: flex;
  margin-top: 12px;
`;

export const ButtonLinkWrap = styled.a`
  display: block;

  ${({ theme }) => theme.mediaQueries.sm} {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }
`;

export const ButtonStyle = styled(Button)`
  ${({ theme }) => theme.mediaQueries.sm} {
    display: none;
  }
  padding: 7px 16px;
  font-size: 12px;
  line-height: 20px;
`;
