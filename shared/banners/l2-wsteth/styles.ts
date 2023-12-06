import styled from 'styled-components';
import { Button } from '@lidofinance/lido-ui';
import Icons from 'assets/icons/l2-wsteth.svg';

export const Banner = styled.div`
  height: 112px;
  position: relative;
  display: flex;
  text-align: left;
  align-items: center;
  padding: ${({ theme }) => theme.spaceMap.lg}px;
  border-radius: ${({ theme }) => theme.borderRadiusesMap.lg}px;
  gap: 20px;
  overflow: hidden;
  background-color: #07080c;
  background: radial-gradient(
    93.45% 103.1% at 6.55% 17.29%,
    #3c64b6 0%,
    #2e1d7b 55.75%,
    #142698 100%
  );
  box-sizing: border-box;

  ${({ theme }) => theme.mediaQueries.md} {
    cursor: pointer;
  }
`;

export const L2Icons = styled.img.attrs({
  src: Icons,
  alt: '',
})`
  position: relative;
  display: block;
  width: 28px;
  height: 72px;
`;

export const LinkButton = styled(Button)`
  padding: 7px 16px;
  font-size: 12px;
  line-height: 20px;

  ${({ theme }) => theme.mediaQueries.md} {
    display: none;
  }
`;

export const OverlayLink = styled.a`
  display: block;

  ${({ theme }) => theme.mediaQueries.md} {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }
`;

export const TextContent = styled.p`
  color: var(--lido-color-primaryContrast);
`;
