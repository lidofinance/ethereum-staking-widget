import styled from 'styled-components';
import { CheckLarge, Close, Loader, Text } from '@lidofinance/lido-ui';

export const TxLoader = styled(Loader)`
  margin: 0 auto;
`;

export const BoldText = styled(Text)`
  text-align: center;
  margin-top: 24px;
  font-weight: 800;
`;

export const LightText = styled(Text)`
  text-align: center;
`;

export const IconWrapper = styled.div`
  height: 64px;
  width: 100%;
  text-align: center;
`;

export const SuccessIcon = styled(CheckLarge)`
  padding: 20px;
  border: 2px solid ${({ theme }) => theme.colors.success};
  border-radius: 50%;
  color: ${({ theme }) => theme.colors.success};
`;

export const FailIcon = styled(Close)`
  padding: 20px;
  border: 2px solid ${({ theme }) => theme.colors.error};
  border-radius: 50%;
  color: ${({ theme }) => theme.colors.error};
`;
