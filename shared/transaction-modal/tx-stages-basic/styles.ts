import styled from 'styled-components';
import { Button } from '@lidofinance/lido-ui';

export const BottomButtons = styled.div`
  margin-top: 44px;
  line-height: 20px;
  display: flex;
  justify-content: space-between;

  button:first-of-type {
    margin-right: ${({ theme }) => theme.spaceMap.lg}px;
  }

  ${({ theme }) => theme.mediaQueries.md} {
    display: flex;
    flex-direction: column;

    button:first-of-type {
      margin-right: 0;
      margin-bottom: ${({ theme }) => theme.spaceMap.lg}px;
    }
  }
`;

export const RetryButtonStyled = styled.span`
  cursor: pointer;
  color: var(--lido-color-primary);
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: auto auto;
  column-gap: ${({ theme }) => theme.spaceMap.md}px;
`;

export const RetryButton = styled(Button)`
  height: 44px;
  font-size: ${({ theme }) => theme.fontSizesMap.xs}px;
  padding: 12px 44px;
  font-weight: normal;
`;

export const ButtonLinkSmall = styled.a`
  display: flex;
  justify-content: center;
  align-items: center;
  text-decoration: none;
  text-align: center;
  line-height: 1em;
  box-sizing: border-box;
  height: 44px;
  margin: 0;
  border: none;
  outline: none;
  white-space: nowrap;
  overflow: hidden;
  font-family: inherit;
  font-weight: normal;
  font-size: ${({ theme }) => theme.fontSizesMap.xs}px;
  border-radius: ${({ theme }) => theme.borderRadiusesMap.md}px;
  padding: 12px;
  color: var(--lido-color-primaryContrast);
  background-color: var(--lido-color-primary);
  color: var(--lido-color-primaryContrast) !important;
  :not(:disabled):hover,
  :focus-visible {
    background-color: var(--lido-color-primaryHover);
  }
`;

export const LoaderWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;
