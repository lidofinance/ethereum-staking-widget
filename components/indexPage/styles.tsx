import styled from 'styled-components';
import { CheckLarge, Close, Input, Loader, Text } from '@lidofinance/lido-ui';

export const LidoAprStyled = styled.span`
  color: rgb(97, 183, 95);
`;

export const FlexCenterVertical = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
`;

export const InputStyled = styled(Input)`
  margin-bottom: ${({ theme }) => theme.spaceMap.md}px;
  z-index: 2;
`;

export const FormStyled = styled.form`
  margin-bottom: 24px;
`;

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
