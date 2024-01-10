import styled from 'styled-components';
import { WalletCardStyle } from 'shared/wallet/card/styles';

import { Link } from '@lidofinance/lido-ui';

export const Arrow = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5 10.4165L15 10.4165"
      stroke="white"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11.25 6.6665L15 10.4165L11.25 14.1665"
      stroke="white"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const HashBanner = styled(WalletCardStyle)`
  text-align: center;
  background: radial-gradient(
      75.89% 107.96% at 48.38% 100%,
      #e54f64 0%,
      rgba(255, 136, 153, 0.192157) 100%
    ),
    linear-gradient(0deg, #29006b, #29006b);
  padding-top: 50px;

  > * {
    color: var(--lido-color-accentContrast);
  }

  > p:not(:last-child) {
    margin-bottom: 16px;
  }
`;

export const ArrowLink = styled(Link)`
  color: var(--lido-color-accentContrast);
  font-weight: 700;
  display: inline-flex;

  &:hover {
    svg {
      path {
        stroke: var(--lido-color-primaryHover);
      }
    }
  }
`;
