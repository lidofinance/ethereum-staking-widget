import { Ldo, Ldopl } from '@lidofinance/lido-ui';
import styled from 'styled-components';

export const LogoLDOStyle = styled((props) => <Ldo {...props} />)`
  width: 40px;
  height: 40px;
`;

export const LogoLDOPLStyle = styled((props) => <Ldopl {...props} />)`
  width: 40px;
  height: 40px;
`;

export const LogoLidoStyle = styled.div`
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  cursor: pointer;

  ${({ theme }) => theme.mediaQueries.md} {
    width: 14px;
    justify-content: flex-start;
  }
`;
