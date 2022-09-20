import styled from 'styled-components';
import {
  Button,
  CheckLarge,
  Close,
  Link,
  Loader,
  Text,
} from '@lidofinance/lido-ui';

export const TxLoader = styled((props) => <Loader {...props} />)`
  margin: 0 auto;
`;

export const BoldText = styled((props) => <Text {...props} />)`
  text-align: center;
  margin-top: 24px;
  font-weight: 800;
`;

export const LightText = styled((props) => <Text {...props} />)<{
  marginTop: number;
}>`
  text-align: center;
  margin-top: ${(props) => props.marginTop}px;
`;

export const LowercaseSpan = styled.span`
  text-transform: lowercase;
`;

export const StylableLink = styled((props) => <Link {...props} />)`
  cursor: pointer;
`;

export const IconWrapper = styled.div`
  height: 64px;
  width: 100%;
  text-align: center;
`;

export const LedgerIconWrapper = styled.div`
  width: 100%;
  text-align: center;

  svg {
    max-width: 100%;
  }
`;

export const SuccessIcon = styled((props) => <CheckLarge {...props} />)`
  padding: 20px;
  border: 2px solid var(--lido-color-success);
  border-radius: 50%;
  color: var(--lido-color-success);
`;

export const FailIcon = styled((props) => <Close {...props} />)`
  padding: 20px;
  border: 2px solid var(--lido-color-error);
  border-radius: 50%;
  color: var(--lido-color-error);
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: auto auto;
  column-gap: ${({ theme }) => theme.spaceMap.md}px;
  margin-top: ${({ theme }) => theme.spaceMap.md}px;
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
