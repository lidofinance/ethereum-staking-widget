import styled from 'styled-components';
import { Button, Link, InlineLoader } from '@lidofinance/lido-ui';

export const Grid = styled.div`
  display: grid;
  grid-template-columns: auto auto;
  column-gap: ${({ theme }) => theme.spaceMap.md}px;
`;

export const LowercaseSpan = styled.span`
  text-transform: lowercase;
`;

export const StylableLink = styled(Link)`
  cursor: pointer;
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

export const SkeletonBalance = styled(InlineLoader).attrs({
  color: 'text',
})`
  margin-left: ${({ theme }) => theme.spaceMap.xs}px;
  width: 100px;
`;
