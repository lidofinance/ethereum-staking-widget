import styled from 'styled-components';
import { ButtonIcon } from '@lidofinance/lido-ui';

export const DrawerRightStyled = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 300;
  outline: none;
  background-color: ${({ isOpen }) =>
    isOpen ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0)'};
  pointer-events: ${({ isOpen }) => (isOpen ? 'auto' : 'none')};
  transition: background-color 0.15s ease-out;

  @media (max-width: 600px) {
    background-color: ${({ isOpen }) =>
      isOpen ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0)'};
  }
`;

export const DrawerRightClose = styled(ButtonIcon)`
  margin-left: auto;
  color: var(--lido-color-textSecondary);
`;

export const DrawerRightWrapper = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 600px;
  box-shadow: -2px 0 2px 0 var(--lido-color-shadowLight);
  transform: translateX(${({ isOpen }) => (isOpen ? '0' : '100%')});
  transition: transform 0.15s ease-out;

  @media (max-width: 600px) {
    left: 0;
    width: 100%;
    transform: translateY(${({ isOpen }) => (isOpen ? '0' : '100%')});
  }
`;

export const DrawerRightContent = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  padding: ${({ theme }) => theme.spaceMap.xxl}px;
  background-color: var(--lido-color-foreground);
  color: var(--lido-color-text);
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spaceMap.xl}px;
  overflow: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;

  @media (max-width: 600px) {
    top: 84px;
    border-radius: 24px 24px 0 0;
  }

  ${({ theme }) => theme.mediaQueries.md} {
    padding: ${({ theme }) => theme.spaceMap.xl}px;
  }
`;

export const DrawerRightHeader = styled.div`
  font-size: ${({ theme }) => theme.fontSizesMap.lg}px;
  font-weight: 700;
  line-height: 28px;
  display: flex;
  align-items: flex-start;
`;

export const DrawerDescription = styled.div`
  font-size: ${({ theme }) => theme.fontSizesMap.xs}px;
  font-weight: 400;
  line-height: 24px;
`;

export const DrawerRightFooter = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const DrawerRightText = styled.div`
  font-size: ${({ theme }) => theme.fontSizesMap.xs}px;
  font-weight: 400;
  line-height: 24px;
  color: var(--lido-color-textSecondary);
`;
