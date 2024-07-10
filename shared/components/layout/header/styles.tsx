import { Container } from '@lidofinance/lido-ui';
import styled, { keyframes } from 'styled-components';
import { devicesHeaderMedia } from 'styles/global';

export const HeaderStyle = styled((props) => <Container {...props} />)`
  position: relative;
  padding-top: var(--header-padding-y);
  padding-bottom: var(--header-padding-y);
  display: flex;
  align-items: center;
`;

export const HeaderActionsStyle = styled.div`
  position: relative;
  margin-left: auto;
  display: flex;
  align-items: center;
  flex-shrink: 1;
`;

export const HeaderWalletChainStyle = styled.span<{ $color: string }>`
  margin-right: ${({ theme }) => theme.spaceMap.sm}px;
  color: ${({ $color }) => $color};
  line-height: 1.2em;
`;

const glimmer = keyframes`
  0% { opacity: 0; }
  50% { opacity: 1; }
  60% { opacity: 1; }
  100% { opacity: 0; }
`;

export const DotStyle = styled.p`
  height: var(--dot-size);
  width: var(--dot-size);
  background-color: lightgreen;
  border-radius: 50%;
  animation: ${glimmer} 2s ease-in-out infinite;
  margin-right: ${({ theme }) => theme.spaceMap.sm}px;
  margin-left: ${({ theme }) => theme.spaceMap.sm}px;
`;

export const IPFSInfoBoxOnlyDesktopWrapper = styled.div`
  position: absolute;
  right: 0;
  top: calc(100% + 15px);
  width: 255px;
  z-index: 3;

  @media ${devicesHeaderMedia.mobile} {
    display: none;
  }
`;
