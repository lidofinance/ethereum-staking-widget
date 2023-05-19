import { FC } from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useConnectorInfo, useWeb3 } from 'reef-knot/web3-react';

import { Layout } from 'shared/components';
import { useAppFlag } from 'shared/hooks/useAppFlag';
import NoSSRWrapper from 'shared/components/no-ssr-wrapper';

import { WithdrawalsTabs } from 'features/withdrawals';
import { WithdrawalsProvider } from 'features/withdrawals/contexts/withdrawals-context';
import { LedgerNoticeBlock } from 'features/withdrawals/shared/ledger-notice';

const Withdrawals: FC = () => {
  const { account } = useWeb3();
  // TODO: remove when ledger live fixes their issue
  const appFlag = useAppFlag();
  const { isLedgerLive } = useConnectorInfo();
  const shouldHideWithdrawals = appFlag === 'ledger-live' || isLedgerLive;

  return (
    <Layout
      title="Withdrawals"
      subtitle="Request stETH/wstETH withdrawal and claim ETH"
    >
      <Head>
        <title>Withdrawals | Lido</title>
      </Head>
      {shouldHideWithdrawals ? (
        <LedgerNoticeBlock>
          <p>
            <b>Withdrawals are currently disabled for Ledger Live</b>
          </p>
          <p>
            Please visit{' '}
            <a
              target="_blank"
              rel="noreferrer"
              href="https://stake.lido.fi/withdrawals"
            >
              stake.lido.fi
            </a>{' '}
            to access withdrawals with your Ledger
          </p>
        </LedgerNoticeBlock>
      ) : (
        <WithdrawalsProvider>
          <NoSSRWrapper>
            {/* In order to simplify side effects of switching wallets we remount the whole widget, resetting all internal state */}
            <WithdrawalsTabs key={account ?? 'NO_ACCOUNT'} />
          </NoSSRWrapper>
        </WithdrawalsProvider>
      )}
    </Layout>
  );
};

export default Withdrawals;

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: {} };
};
