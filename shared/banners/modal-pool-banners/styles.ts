import { Button } from '@lidofinance/lido-ui';
import styled from 'styled-components';

export const TextStyles = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  font-size: ${({ theme }) => theme.fontSizesMap.xs}px;

  & + div {
    margin-bottom: ${({ theme }) => theme.spaceMap.sm}px;
  }
`;

export const DescStyles = styled.span`
  color: var(--lido-color-textSecondary);
  margin-top: ${({ theme }) => theme.spaceMap.sm}px;
  margin-bottom: ${({ theme }) => theme.spaceMap.md}px;
  text-align: center;
`;

export const ButtonLinkWrap = styled.a`
  margin-top: ${({ theme }) => theme.spaceMap.sm}px;
  display: block;
`;

export const ButtonStyled = styled(Button)`
  &:not(:disabled):hover,
  &:focus-visible {
    background-color: #4ba886;
  }
`;
