import styled from 'styled-components';
import { Button } from '@lidofinance/lido-ui';
import Icons from 'assets/icons/l2-wsteth.svg';

export const Banner = styled.div`
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
  width: 28px;
  height: 72px;
`;

export const LinkButton = styled(Button)`
  padding: 7px 16px;
  font-size: 12px;
  line-height: 20px;
`;

export const TextContent = styled.p`
  color: var(--lido-color-primaryContrast);
`;
