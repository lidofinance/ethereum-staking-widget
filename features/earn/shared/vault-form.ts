import styled from 'styled-components';

import { FormController } from 'shared/hook-form/form-controller';

type VaultFormProps = {
  $gap?: number;
};

export const VaultForm = styled(FormController)<VaultFormProps>`
  --earn-vault-form-gap: ${({ $gap = 8 }) => $gap}px;
  display: flex;
  flex-direction: column;
  gap: var(--earn-vault-form-gap);
`;
