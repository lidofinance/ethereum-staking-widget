import styled from 'styled-components';
import { Text } from '@lidofinance/lido-ui';
import { DescriptionText } from 'shared/transaction-modal/transaction-modal-content';

export const Amounts = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spaceMap.xs}px;
`;

export const Amount = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spaceMap.xs}px;
  font-size: 18px;
  font-weight: 700;
`;

export const TokenIcon = styled.span`
  display: flex;
  width: 24px;
  height: 24px;

  & > svg {
    width: 100%;
    height: 100%;
  }
`;

export const ClaimDescription = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spaceMap.lg}px;
  padding-top: ${({ theme }) => theme.spaceMap.md}px;
`;

export const ClaimResultItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spaceMap.xs}px;
`;

export const ClaimDetail = styled(DescriptionText)`
  margin: 0;
  line-height: 1.5;
`;

export const ClaimStatus = styled(Text).attrs({
  size: 'xs' as const,
  color: 'secondary' as const,
})`
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: ${({ theme }) => theme.spaceMap.xs}px;
  line-height: 1.5;

  & > span {
    white-space: nowrap;
  }
`;

// `forwardedAs`, not `as`: `as` would be consumed by this wrapper and replace
// Text with a bare span, dropping its styling and leaking `color` to the DOM.
export const ClaimStatusLabel = styled(Text).attrs({
  forwardedAs: 'span' as const,
  size: 'xs' as const,
})``;
