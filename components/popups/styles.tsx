import styled from 'styled-components';
import { Button, Container } from '@lidofinance/lido-ui';

export const LayoutContainer = styled(Container)`
  position: relative;
  justify-content: flex-end;
  align-items: flex-start;
  display: flex;
  height: 0;
  top: 80px;
  z-index: 3;
`;

// TODO: make a better slide transition
export const Wrapper = styled.div`
  width: 280px;
  position: relative;
  background-color: ${({ theme }) => theme.colors.foreground};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  transition: transform 0.3s ease;
  transition-property: transform, opacity;
  margin-left: auto;

  &.slide-enter {
    opacity: 0;
    transform: translateX(20px);
  }

  &.slide-enter-active {
    opacity: 1;
    transform: translateX(0);
  }

  &.slide-exit-active {
    opacity: 1;
    transform: translateX(0);
  }

  &.slide-exit {
    opacity: 0;
    transform: translateX(20px);
  }
`;

export const ActionsWrapper = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: grid;
  grid-template-columns: 1fr 1fr;
  font-size: ${({ theme }) => theme.fontSizesMap.xxs}px;
  line-height: 1.8em;
`;

export const Action = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};

  :first-of-type {
    border-right: 1px solid ${({ theme }) => theme.colors.border};
  }
`;

export const Content = styled.div`
  font-weight: 500;
  font-size: ${({ theme }) => theme.fontSizesMap.xxs}px;
  line-height: 1.5em;
  padding: 12px 20px;
  display: flex;
  align-items: center;
`;

export const Data = styled.div`
  margin-left: 16px;
  color: ${({ theme }) => theme.colors.textSecondary};

  .label {
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  .rate {
    font-size: ${({ theme }) => theme.fontSizesMap.xs}px;
    line-height: 1.6em;
    font-weight: 800;
    color: ${({ theme }) => theme.colors.text};
  }
`;

export const DismissButton = styled(Button)`
  padding: 13px 18px;

  font-weight: 400;
  color: rgb(122, 138, 160);

  :before {
    background: transparent;
  }

  :hover {
    cursor: pointer;
  }
`;
