import styled from 'styled-components';
import { WalletCardStyle } from 'shared/wallet/card/styles';

export const SunsetMessageStyle = styled(WalletCardStyle)`
  text-align: center;
  background: radial-gradient(
      90% 110% at 50% 100%,
      #5f2144 0%,
      rgb(247 38 138 / 0%) 100%
    ),
    linear-gradient(0deg, #e54f64, #f89371);

  > * {
    color: var(--lido-color-accentContrast);
  }

  a {
    color: var(--lido-color-primary);
  }

  > p:not(:last-child) {
    margin-bottom: 6px;
  }
`;
