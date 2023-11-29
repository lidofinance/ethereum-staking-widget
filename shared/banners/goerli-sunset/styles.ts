import styled from 'styled-components';
import { WalletCardStyle } from 'shared/wallet/card/styles';

export const SunsetMessageStyle = styled(WalletCardStyle)`
  text-align: center;
  background: radial-gradient(
      50% 110% at 50% 100%,
      #ff984e 0%,
      rgba(255, 67, 157, 0) 100%
    ),
    linear-gradient(0deg, #8f1e7d, #8f1e7d);

  > * {
    color: var(--lido-color-accentContrast);
  }

  > p:not(:last-child) {
    margin-bottom: 6px;
  }
`;
