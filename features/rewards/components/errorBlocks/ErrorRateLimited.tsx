import { ErrorBlockBase } from './ErrorBlockBase';

export const ErrorRateLimited = () => (
  <ErrorBlockBase
    textProps={{ color: 'error' }}
    text="API rate limit exceeded. Please, try again later."
  />
);
