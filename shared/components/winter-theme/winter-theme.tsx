import type { FC } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { createGlobalStyle } from 'styled-components';

import { HOME_PATH } from 'consts/urls';
import { devicesHeaderMedia } from 'styles/global';

import { useWinterTheme } from './winter-theme-context';

const WinterLayers = dynamic(
  () => import('./winter-layers').then((m) => m.WinterLayers),
  { ssr: false },
);

// Room for Lido-man's hat between the subtitle and the stake card on
// phones. Rendered from the server-known flag, so nothing jumps on mount.
const StakeLayoutStyle = createGlobalStyle`
  @media ${devicesHeaderMedia.mobile} {
    [data-layout-subtitle] {
      margin-bottom: 38px;
    }
  }
`;

// Page-level layers of the New Year theme, behind the manifest flag
// `holidayDecorEnabled`
export const WinterTheme: FC = () => {
  const { requested, enabled } = useWinterTheme();
  const { pathname } = useRouter();

  return (
    <>
      {requested && pathname === HOME_PATH && <StakeLayoutStyle />}
      {enabled && <WinterLayers />}
    </>
  );
};
