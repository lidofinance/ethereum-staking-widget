import styled from 'styled-components';
import { ButtonIcon } from '@lidofinance/lido-ui';

export const DrawerRightStyled = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: ${({ isOpen }) => (isOpen ? '0' : '-600px')};
  bottom: 0;
  background-color: var(--lido-color-background);
  z-index: 300;
  box-shadow: -2px 0 2px 0 var(--lido-color-shadowLight);
  width: 600px;
  outline: none;
  transition: right 0.15s ease-out;
  display: flex;
  flex-direction: column;
`;

export const DrawerRightClose = styled(ButtonIcon)`
  position: absolute;
  top: ${({ theme }) => theme.spaceMap.xxl}px;
  right: ${({ theme }) => theme.spaceMap.xxl}px;
  color: var(--lido-color-textSecondary);
`;

export const DrawerRightWrapper = styled.div`
  flex-grow: 1;
  position: relative;
  z-index: 1;
`;

export const DrawerRightContent = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  padding: ${({ theme }) => theme.spaceMap.xxl}px;
  color: var(--lido-color-text);
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spaceMap.xl}px;
  overflow: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
`;

export const DrawerRightHeader = styled.div`
  font-size: ${({ theme }) => theme.fontSizesMap.lg}px;
  font-weight: 700;
  line-height: 28px;
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
