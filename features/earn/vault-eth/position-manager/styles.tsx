import styled from 'styled-components';
import { Switch } from 'shared/components/switch/switch';

export const SwitchStyled = styled(Switch)`
  margin: 0 0 ${({ theme }) => theme.spaceMap.lg}px;
  font-size: 14px;
  font-weight: 700;
`;
