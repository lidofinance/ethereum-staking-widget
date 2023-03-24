import styled from 'styled-components';
import { InputGroup } from '@lidofinance/lido-ui';

export const InputGroupStyled = styled(InputGroup)`
  margin-bottom: ${({ theme }) => theme.spaceMap.md}px;
  z-index: 2;
`;

export const ButtonLinkWrap = styled.a`
  display: block;
`;

export const LinkWrapperStyled = styled.span`
  a {
    text-decoration: none;

    &:visited {
      color: var(--lido-color-primary);
    }
  }
`;
