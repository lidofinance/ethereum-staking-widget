import styled from 'styled-components';
import { Loader } from '@lidofinance/lido-ui';

export const LoaderStyled = styled(Loader)`
  margin: 0 auto;
`;

export const ModalContentStyled = styled.div`
  max-height: calc(100vh - 300px);
  height: 100vh;
  overflow: hidden;
  margin-bottom: ${({ theme }) => theme.spaceMap.md}px;
  margin-top: ${({ theme }) => theme.spaceMap.md}px;
  border-radius: ${({ theme }) => theme.borderRadiusesMap.lg}px;
`;

export const ButtonStyled = styled.button`
  background: none;
  color: var(--lido-color-primary);
  border: none;
  font-weight: 400;
  font-size: 12px;
  line-height: 20px;
  cursor: pointer;

  &:focus {
    outline: none;
  }

  &:first-of-type {
    padding-right: 16px;
    border-right: 1px solid var(--lido-color-textSecondary);
    line-height: 8px;
  }

  &:nth-of-type(2) {
    padding-left: 16px;
  }
`;
