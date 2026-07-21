import { useParams } from 'react-router';
import Head from 'next/head';

import { Layout } from 'shared/components';
import { Withdrawals } from 'features/withdrawals';

import NotFoundPage from './not-found';

/**
 * `/withdrawals/:mode` — ported from `pages/withdrawals/[mode].tsx`.
 * Bare `/withdrawals` redirects to `/withdrawals/request` via a route
 * loader (was a next.config.mjs redirect).
 */
export default function WithdrawalsPage() {
  const { mode } = useParams<{ mode: string }>();
  if (mode !== 'request' && mode !== 'claim') return <NotFoundPage />;

  return (
    <Layout
      title="Withdrawals"
      subtitle="Request stETH/wstETH withdrawal and claim ETH"
    >
      <Head>
        <title>Withdrawals | Lido</title>
      </Head>
      <Withdrawals mode={mode} />
    </Layout>
  );
}
