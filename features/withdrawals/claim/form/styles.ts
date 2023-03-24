import styled from 'styled-components';
import { Button } from '@lidofinance/lido-ui';

export const EditClaimButtonStyled = styled(Button)`
  margin-bottom: ${({ theme }) => theme.spaceMap.md}px;
`;

export const LinkWrapperStyled = styled.span`
  a {
    text-decoration: none;

    &:visited {
      color: var(--lido-color-primary);
    }
  }
`;
