// Every page under /stake. Framework-free on purpose: the router only
// feeds a parsed path in, so this survives a move off Next.js.
export const STAKE_PATHS = [
  '/stake',
  '/stake/faq',
  '/stake/wrap',
  '/stake/wrap/unwrap',
  '/stake/wrap/faq',
  '/stake/withdraw',
  '/stake/withdraw/faq',
  '/stake/rewards',
] as const;

export type StakePath = (typeof STAKE_PATHS)[number];

const STAKE_ROOT = '/stake';

export const isStakePath = (path: string): path is StakePath =>
  (STAKE_PATHS as readonly string[]).includes(path);

/** segments after /stake: [] for /stake itself */
export const toStakeSegments = (path: StakePath): string[] =>
  path.slice(STAKE_ROOT.length).split('/').filter(Boolean);

/** null for anything that is not a known /stake page */
export const parseStakeSegments = (
  segments: readonly string[] | undefined,
): StakePath | null => {
  const path = [STAKE_ROOT, ...(segments ?? [])].join('/');
  return isStakePath(path) ? path : null;
};
