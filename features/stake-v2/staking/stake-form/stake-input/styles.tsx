import { Card, DataList, RichInput } from '@lidofinance/lido-app-ui';
import styled from 'styled-components';

export const WrapperCard = styled(Card).attrs({
  padding: 0,
  gap: 0,
})`
  border: 1px solid var(--lido-app-ui-color-border-default);
  border-radius: var(--lido-app-ui-border-radius-md);
  background-color: var(--lido-app-ui-color-background-default);
`;

export const FullWidthInput = styled(RichInput)`
  border-radius: var(--lido-app-ui-border-radius-md);
  width: calc(100% + 2px);
  margin-top: -1px;
  margin-left: -1px;
`;

export const DataListStyled = styled(DataList)`
  padding-block: var(--lido-app-ui-space-24);
`;
