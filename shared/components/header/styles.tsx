import { Container } from '@lidofinance/lido-ui';
import styled, { keyframes } from 'styled-components';

export const HeaderStyle = styled((props) => <Container {...props} />)`
  position: relative;
  padding-top: 18px;
  padding-bottom: 18px;
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
  margin-right: ${({ theme }) => theme.spaceMap.md}px;
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
  height: 6px;
  width: 6px;
  background-color: lightgreen;
  border-radius: 50%;
  animation: ${glimmer} 2s ease-in-out infinite;
  margin-right: 6px;
`;

export const IPFSInfoBoxWrap = styled.div`
  position: absolute;
  right: 0;
  top: calc(100% + 15px);
  width: 255px;
  z-index: 1;
`;
