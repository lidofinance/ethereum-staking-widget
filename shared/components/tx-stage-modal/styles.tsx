import styled from 'styled-components';
import { CheckLarge, Close, Link, Loader, Text } from '@lidofinance/lido-ui';

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
  border: 2px solid ${({ theme }) => theme.colors.success};
  border-radius: 50%;
  color: ${({ theme }) => theme.colors.success};
`;

export const FailIcon = styled((props) => <Close {...props} />)`
  padding: 20px;
  border: 2px solid ${({ theme }) => theme.colors.error};
  border-radius: 50%;
  color: ${({ theme }) => theme.colors.error};
`;
