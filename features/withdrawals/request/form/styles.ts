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

export const RequestsInfoStyled = styled.div`
  background-color: var(--lido-color-backgroundSecondary);
  padding: ${({ theme }) => theme.spaceMap.lg}px;
  border-radius: ${({ theme }) => theme.borderRadiusesMap.lg}px;
  margin-bottom: ${({ theme }) => theme.spaceMap.md}px;
`;

export const RequestsInfoDescStyled = styled.div`
  font-size: 12px;
  line-height: 20px;
`;
