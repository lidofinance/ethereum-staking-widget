import styled from 'styled-components';
import { SelectIcon } from '@lidofinance/lido-ui';

// Temporarily: The 'SelectIconStyle' is being used to fix the 'SelectIcon' from the UI lib.
export const SelectIconStyle = styled((props) => <SelectIcon {...props} />)`
  & > span {
    // The '!important' is important here,
    // because the 'lido-ui' lib has a bug with a disabled state
    // when we move the cursor away from a SelectIcon (without the '!important' the SelectIcon becomes active).
    border-color: ${({ disabled }) =>
      disabled && 'var(--lido-color-border)!important'};
    background: ${({ disabled }) => disabled && 'var(--lido-color-background)'};
  }

  &:hover {
    & > span {
      border-color: ${({ disabled }) => disabled && 'var(--lido-color-border)'};
      background: ${({ disabled }) =>
        disabled && 'var(--lido-color-background)'};
    }
    cursor: ${({ disabled }) => disabled && 'default'};
  }
`;
