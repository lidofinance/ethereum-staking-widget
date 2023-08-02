import { ErrorBlockBase } from './ErrorBlockBase';

export const ErrorBlockServer = () => (
  <ErrorBlockBase
    textProps={{ color: 'error' }}
    text="Subgraph returned a fatal error. Lido contributors were alerted and are working on a fix. Please repeat the request in a while."
  />
);
