/**
 * Framework-neutral DVV constants — split out of `consts.tsx` so the api
 * server and `utils.ts` can import them without the icon/JSX chain
 * (`assets/earn` → styled-components). `consts.tsx` re-exports these.
 */
export const DVV_STATS_ORIGIN = 'https://api.mellow.finance';
export const DVV_APR_ENDPOINT = `${DVV_STATS_ORIGIN}/v1/vaults`;
