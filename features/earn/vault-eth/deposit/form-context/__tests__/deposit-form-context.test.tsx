import { renderToStaticMarkup } from 'react-dom/server';

import type { VaultQuote } from 'modules/mellow-meta-vaults/utils/quote';

import { EthVaultDepositFormProvider } from '../deposit-form-context';

type DepositHookArgs = { shownQuote: unknown; refetchQuote: unknown };

// the quote the preview hook hands out, and its refetch
const { SHOWN_QUOTE, refetchQuote, useEthVaultDeposit } = vi.hoisted(() => ({
  SHOWN_QUOTE: { amountIn: 10n, amountOut: 9n } satisfies VaultQuote,
  refetchQuote: vi.fn(),
  useEthVaultDeposit: vi.fn((_args: DepositHookArgs) => ({ deposit: vi.fn() })),
}));

vi.mock('features/earn/vault-eth/deposit/hooks/use-deposit', () => ({
  useEthVaultDeposit,
}));
vi.mock('features/earn/vault-eth/deposit/hooks', () => ({
  useEthVaultPreviewDeposit: () => ({ quote: SHOWN_QUOTE, refetchQuote }),
  useEthVaultDepositRequest: () => undefined,
}));
vi.mock('features/earn/vault-eth/deposit/hooks/use-deposit-form-data', () => ({
  useEthVaultDepositFormData: () => ({
    validationContext: {},
    asyncValidationContextValue: undefined,
    refetchData: vi.fn(),
    isLoading: false,
  }),
}));
vi.mock('features/earn/vault-eth/deposit/form-context/validation', () => ({
  EthVaultDepositFormValidationResolver: vi.fn(),
}));
vi.mock('features/earn/vault-eth/hooks/use-vault-available', () => ({
  useEthVaultAvailable: () => ({
    isEthVaultAvailable: true,
    isDepositEnabled: true,
  }),
}));
vi.mock('features/earn/shared/hooks/use-earn-geo-gate', () => ({
  useEarnGeoGate: () => ({ isDepositGeoAvailable: true }),
}));
vi.mock('modules/web3/hooks/use-dapp-status', () => ({
  useDappStatus: () => ({ isDappActive: true, isWalletConnected: true }),
}));
vi.mock('shared/hooks/use-query-values-form', () => ({
  useQueryParamsReferralForm: () => undefined,
  useQueryParamsTokenForm: () => undefined,
}));
vi.mock('shared/hook-form/form-controller', async () => {
  const { createContext } = await import('react');
  return { FormControllerContext: createContext(null) };
});

describe('EthVaultDepositFormProvider', () => {
  it('holds the deposit to the quote the form displays', () => {
    renderToStaticMarkup(<EthVaultDepositFormProvider />);

    expect(useEthVaultDeposit).toHaveBeenCalled();
    const args = useEthVaultDeposit.mock.lastCall?.[0];
    expect(args?.shownQuote).toBe(SHOWN_QUOTE);
    expect(args?.refetchQuote).toBe(refetchQuote);
  });
});
