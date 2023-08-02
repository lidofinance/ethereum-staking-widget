import styled from 'styled-components';
import { InfoBox } from 'shared/components';

export const InfoBoxStyled = styled(InfoBox)`
  margin-bottom: ${({ theme }) => theme.spaceMap.md}px;
`;
