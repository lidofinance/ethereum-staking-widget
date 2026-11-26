import styled from 'styled-components';
import { FormController } from 'shared/hook-form/form-controller';

export const StyledFormController = styled(FormController)`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: var(--lido-app-ui-space-16);
  margin-top: var(--lido-app-ui-space-12);
`;
