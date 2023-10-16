import styled from 'styled-components';
import { Button } from '@lidofinance/lido-ui';
import Icons from 'assets/icons/l2-swap.svg';

export const Wrapper = styled.div`
  text-align: left;
  margin-top: 16px;
  position: relative;
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spaceMap.lg}px;
  border-radius: ${({ theme }) => theme.borderRadiusesMap.lg}px;
  height: 174px;
  gap: 20px;
  overflow: hidden;
  background-color: #07080c;
  background: linear-gradient(90deg, #3487e5 0%, #006ae3 46.27%);
  box-sizing: border-box;

  ${({ theme }) => theme.mediaQueries.md} {
    gap: 2px;
    padding: ${({ theme }) => theme.spaceMap.md}px;
  }

  @media (max-width: 396px) {
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
  margin-bottom: 4px;
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

  @media (max-width: 396px) {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }
`;

export const ButtonStyle = styled(Button)`
  @media (max-width: 396px) {
    display: none;
  }
  padding: 7px 16px;
  font-size: 12px;
  line-height: 20px;
`;
