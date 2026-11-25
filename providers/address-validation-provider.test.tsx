import { renderToStaticMarkup } from 'react-dom/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Address } from 'viem';

import { FetcherError } from 'utils/fetcherError';

// plain function, not vi.fn: vitest flags a recorded rejection as unhandled
const state = vi.hoisted(() => ({
  impl: async (): Promise<unknown> => undefined,
}));

vi.mock('config', () => ({
  config: { addressApiValidationEnabled: true, ipfsMode: false },
}));
vi.mock('utils/standardFetcher', () => ({
  standardFetcher: () => state.impl(),
}));

import {
  AddressValidationProvider,
  useAddressValidation,
} from './address-validation-provider';

const ADDRESS = '0x00000000000000000000000000000000000000aa' as Address;

// the static blocklist goes through the same mocked fetcher, so it is unavailable here
const run = async () => {
  let ctx: ReturnType<typeof useAddressValidation> | undefined;
  const Probe = () => {
    ctx = useAddressValidation();
    return null;
  };
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  renderToStaticMarkup(
    <QueryClientProvider client={queryClient}>
      <AddressValidationProvider>
        <Probe />
      </AddressValidationProvider>
    </QueryClientProvider>,
  );
  return (ctx as NonNullable<typeof ctx>).validateAddress(ADDRESS);
};

const failWith = (error: Error) => {
  state.impl = async () => {
    throw error;
  };
};

describe('AddressValidationProvider rate-limit block', () => {
  it('marks the address invalid on a 429', async () => {
    failWith(new FetcherError('limit', 429));
    expect(await run()).toBe(false);
  });

  it.each([
    ['500', new FetcherError('boom', 500)],
    ['403', new FetcherError('forbidden', 403)],
    ['network error', new TypeError('Failed to fetch')],
  ])('defaults to valid on %s without a blocklist', async (_n, error) => {
    failWith(error);
    expect(await run()).toBe(true);
  });

  it('still uses a successful API answer', async () => {
    state.impl = async () => ({ isValid: true });
    expect(await run()).toBe(true);
  });
});
