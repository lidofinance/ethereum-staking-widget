import styled from 'styled-components';

import { FormController } from 'shared/hook-form/form-controller';

type VaultFormProps = {
  $gap?: number;
};

export const VaultForm = styled(FormController)<VaultFormProps>`
  display: flex;
  flex-direction: column;
  gap: ${({ $gap = 8 }) => $gap}px;
`;
