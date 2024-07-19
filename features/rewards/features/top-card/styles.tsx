import styled, { css } from 'styled-components';
import { WalletCardStyle } from 'shared/wallet/card/styles';
import { AddressBadge } from 'shared/wallet/components/address-badge/address-badge';

export const WalletStyle = styled(WalletCardStyle)`
  background: linear-gradient(
    52.01deg,
    #37394a 0%,
    #363749 0.01%,
    #40504f 100%
  );
  padding: 0 0 24px 0;
`;

export const WalletContentStyle = styled.div`
  display: flex;
  flex-wrap: nowrap;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  padding: ${({ theme }) => theme.spaceMap.xxl}px;

  ${({ theme }) => theme.mediaQueries.md} {
    align-items: end;
    flex-direction: column-reverse;
  }
`;

export const WalletContentAddressBadgeStyle = styled(AddressBadge)`
  background: #00000033;
`;

export const ConnectWalletStyle = styled(WalletCardStyle)`
  padding: 27px 27px 47px 27px;
  text-align: center;

  ${({ theme }) =>
    theme.name === 'dark'
      ? css`
          color: var(--lido-color-text);
          background: linear-gradient(48.34deg, #46464f -5.55%, #3b3b47 100%);
        `
      : css`
          color: var(--lido-color-secondary);
          background: linear-gradient(48.34deg, #d2ddff -5.55%, #e6e6e6 100%);
        `}
`;

export const ConnectWalletTextStyle = styled.p`
  margin-bottom: 12px;
`;
