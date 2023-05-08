import styled from 'styled-components';
import { InputGroup } from '@lidofinance/lido-ui';

export const InputGroupStyled = styled(InputGroup)<{ success?: string }>`
  margin-bottom: ${({ theme }) => theme.spaceMap.md}px;
  z-index: 2;

  span:nth-of-type(2) {
    white-space: ${({ success }) => success && 'unset'};
  }
`;

export const ButtonLinkWrap = styled.a`
  display: block;
`;
