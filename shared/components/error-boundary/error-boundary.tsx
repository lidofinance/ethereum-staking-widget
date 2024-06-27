import Head from 'next/head';
import { ServicePage, Button } from '@lidofinance/lido-ui';

export const ErrorBoundaryFallback = () => {
  return (
    <ServicePage title="Client Side Error">
      <Head>
        <title>Lido | Client Side Error</title>
      </Head>
      <p style={{ marginBottom: '15px' }}>Something went wrong</p>
      <Button
        onClick={() => {
          window.location.reload();
        }}
        size={'xxs'}
        color={'secondary'}
      >
        Restart the page
      </Button>
    </ServicePage>
  );
};
