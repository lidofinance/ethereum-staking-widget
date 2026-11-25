import type { FC } from 'react';
import styled from 'styled-components';

import { useWinterTheme } from './winter-theme-context';

// Sits over the Lido drop of the logo (the logo itself clips overflow)
const Hat = styled.svg`
  position: absolute;
  left: -3px;
  top: -12px;
  width: 22px;
  height: 18px;
  pointer-events: none;
`;

export const WinterLogoHat: FC = () => {
  const { enabled } = useWinterTheme();
  if (!enabled) return null;

  return (
    <Hat viewBox="-2 -13 23 17" aria-hidden="true" data-winter="logo-hat">
      <path
        d="M1.2 1.4 C 1.4 -7.5, 10.5 -12, 19 -6.6 C 15.8 -6.1, 13.9 -3.8, 13.6 0.6 Z"
        fill="#E14D4D"
      />
      <path
        d="M9.5 -9.4 C 13.5 -10.2, 16.8 -9, 19 -6.6 C 16.4 -6.4, 14.6 -5.2, 13.8 -3.4 Z"
        fill="#B83A3A"
        fillOpacity="0.6"
      />
      <rect
        x="-1"
        y="-1.6"
        width="16.4"
        height="4.8"
        rx="2.4"
        fill="#FFFFFF"
        stroke="rgba(39,56,82,0.2)"
        strokeWidth="0.6"
      />
      <circle
        cx="19.2"
        cy="-6.6"
        r="2.8"
        fill="#FFFFFF"
        stroke="rgba(39,56,82,0.2)"
        strokeWidth="0.6"
      />
    </Hat>
  );
};
