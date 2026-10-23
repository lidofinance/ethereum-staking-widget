import styled from 'styled-components';
import { Block } from '@lidofinance/lido-ui';
import { ReactComponent as EthereumIcon } from 'assets/icons/eth-slow-stake.svg';
import { FormatToken } from 'shared/formatters';

export const SlowStakeStatusListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spaceMap.sm}px;
  margin-bottom: ${(props) => props.theme.spaceMap.xxl}px;
`;

export const SlowStakeStatusItemContainer = styled(Block)`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spaceMap.sm}px;

  color: var(--lido-color-textSecondary);
  font-size: ${(props) => props.theme.fontSizesMap.xxs}px;
`;

export const StatusContent = styled.div`
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) max-content;
  grid-template-rows: 24px 20px;
  column-gap: ${(props) => props.theme.spaceMap.sm}px;
  row-gap: 0px;
  align-items: end;

  font-size: ${(props) => props.theme.fontSizesMap.xxs}px;
`;

// the third column sizes to its widest cell; the narrower one is pushed to
// the column's right edge rather than sitting at its left
export const EndCell = styled.span`
  justify-self: end;
  text-align: right;
`;

export const AmountStyled = styled(FormatToken)`
  font-size: ${(props) => props.theme.fontSizesMap.xs}px;
  font-weight: 700;
  color: ${(props) => props.theme.colors.text};
`;

export const EthIconStyled = styled(EthereumIcon).attrs({
  width: 28,
  height: 28,
})`
  grid-column: 1;
  grid-row: 1 / span 3;
  align-self: center;
`;
