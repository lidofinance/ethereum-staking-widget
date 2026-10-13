import { Helmet } from 'react-helmet-async';
import { ServicePage, Button } from '@lidofinance/lido-ui';

export const ErrorBoundaryFallback = () => {
  return (
    <ServicePage title="Client Side Error">
      <Helmet>
        <title>Lido | Client Side Error</title>
      </Helmet>
      <p style={{ marginBottom: '15px' }}>Something went wrong</p>
      <Button
        onClick={() => {
          window.location.reload();
        }}
        size={'xxs'}
        color={'secondary'}
      >
        Reload page
      </Button>
    </ServicePage>
  );
};
