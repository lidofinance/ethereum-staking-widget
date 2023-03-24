import styled from 'styled-components';

import { FormatToken } from 'shared/formatters';

export const ClaimCardStyled = styled.div`
  border: 1px solid #000a3d1f;
  border-radius: ${({ theme }) => theme.borderRadiusesMap.lg}px;
  margin-bottom: ${({ theme }) => theme.spaceMap.md}px;
`;

export const ClaimInfoStyled = styled.div`
  background-color: var(--lido-color-backgroundSecondary);
  display: flex;
  justify-content: space-around;
  padding: ${({ theme }) => theme.spaceMap.lg}px;

  ${({ theme }) => theme.mediaQueries.md} {
    flex-direction: column;
  }
`;

export const ClaimInfoStatStyled = styled.div`
  ${({ theme }) => theme.mediaQueries.md} {
    margin-bottom: ${({ theme }) => theme.spaceMap.lg}px;

    &:last-of-type {
      margin: 0;
    }
  }
`;

export const ClaimCardEditStyled = styled.div<{ $disabled?: boolean }>`
  text-align: center;
  line-height: 20px;
  padding: 12px 0;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  color: ${({ $disabled }) =>
    $disabled ? '#ade1ff' : 'var(--lido-color-primary)'};

  &:hover {
    color: ${({ $disabled }) => !$disabled && 'var(--lido-color-primaryHover)'};
  }
`;

export const ClaimStatItemWrapperStyled = styled.div<{ $bold?: boolean }>`
  font-weight: ${({ $bold }) => ($bold ? '700' : '400')};
`;

export const ClaimStatItemTitleStyled = styled.div`
  font-weight: 400;
  color: var(--lido-color-textSecondary);
  padding-bottom: ${({ theme }) => theme.spaceMap.xs}px;
`;

export const FormatTokenStyled = styled(FormatToken)`
  font-size: ${({ theme }) => theme.fontSizesMap.sm}px;
  color: var(--lido-color-textDark);
`;
