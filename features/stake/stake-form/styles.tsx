import styled from 'styled-components';
import { Block } from '@lidofinance/lido-ui';
import { FormController } from 'shared/hook-form/form-controller';

export const StakeBlock = styled(Block)`
  display: flex;
  gap: ${({ theme }) => theme.spaceMap.md}px;
  flex-direction: column;
`;

export const FormControllerStyled = styled(FormController)`
  display: flex;
  flex-direction: column;
  row-gap: ${({ theme }) => theme.spaceMap.md}px;
`;
