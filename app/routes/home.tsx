import { StakePage } from 'features/stake';

/**
 * `/` — ported from `pages/index.tsx`. The external manifest that
 * `getStaticProps` used to prefetch is fetched at runtime via react-query
 * inside `ConfigProvider` (see `config/external-config`).
 *
 * The legacy IPFS build rendered `HomePageIpfs` here — a hand-rolled
 * hash-path switch over the page components. The SPA uses a real
 * `createHashRouter` in IPFS mode (app/router.tsx), so every route works
 * from the single index.html and that component is gone.
 */
export default function HomePage() {
  return <StakePage />;
}
