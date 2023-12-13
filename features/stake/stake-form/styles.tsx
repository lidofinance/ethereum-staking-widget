import { FormController } from 'shared/hook-form/form-controller';
import styled from 'styled-components';

export const FormControllerStyled = styled(FormController)`
  display: flex;
  flex-direction: column;
  row-gap: ${({ theme }) => theme.spaceMap.md}px;
  margin-bottom: 24px;
`;
