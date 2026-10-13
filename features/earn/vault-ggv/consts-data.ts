import { parseEther } from 'viem';

/**
 * Framework-neutral GGV constants — split out of `consts.tsx` so the api
 * server (server/src/routes/earn-vaults-*.ts) and `utils.ts` can import
 * them without dragging the icon/JSX chain (`assets/earn` →
 * styled-components) into a Node bundle. `consts.tsx` re-exports these for
 * frontend consumers.
 */
export const GGV_START_DATE = new Date('2025-09-03');

export const GGV_INCENTIVES = [
  parseEther('57.5'),
  parseEther('32'),
  parseEther('38.5'),
];

export const GGV_STATS_ORIGIN = 'https://api.sevenseas.capital';
