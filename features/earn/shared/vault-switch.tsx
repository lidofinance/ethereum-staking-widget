import styled from 'styled-components';
import { Switch } from 'shared/components/switch/switch';

export const VaultSwitch = styled(Switch)`
  font-size: 10px;
  text-transform: uppercase;
  font-weight: 800;
  letter-spacing: 0.3px;
  margin-top: ${({ theme }) => theme.spaceMap.xl}px;
  margin-bottom: ${({ theme }) => theme.spaceMap.lg}px;
`;
