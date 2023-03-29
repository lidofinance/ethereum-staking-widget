import { ErrorBlockBase } from './ErrorBlockBase';

export const ErrorBlockServer = () => (
  <ErrorBlockBase
    textProps={{ color: 'error' }}
    text="Failed to fetch data from the Subgraph. Maintainers are notified and working on a fix."
  />
);
