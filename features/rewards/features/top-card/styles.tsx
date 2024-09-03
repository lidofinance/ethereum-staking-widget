import styled from 'styled-components';
import { WalletCardStyle } from 'shared/wallet/card/styles';

export const WalletStyle = styled(WalletCardStyle)`
  background: linear-gradient(61.64deg, #413e58 17.53%, #30363f 100%);
  padding: 0 0 24px 0;
`;

export const WalletContentStyle = styled.div`
  padding: ${({ theme }) => theme.spaceMap.xxl}px;
`;
