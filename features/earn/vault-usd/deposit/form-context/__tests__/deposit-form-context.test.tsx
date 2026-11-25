import { renderToStaticMarkup } from 'react-dom/server';

import type { VaultQuote } from 'modules/mellow-meta-vaults/utils/quote';

import { UsdVaultDepositFormProvider } from '../deposit-form-context';

type DepositHookArgs = { shownQuote: unknown; refetchQuote: unknown };

// the quote the preview hook hands out, and its refetch
const { SHOWN_QUOTE, refetchQuote, useUsdVaultDeposit } = vi.hoisted(() => ({
  SHOWN_QUOTE: { amountIn: 10n, amountOut: 9n } satisfies VaultQuote,
  refetchQuote: vi.fn(),
  useUsdVaultDeposit: vi.fn((_args: DepositHookArgs) => ({ deposit: vi.fn() })),
}));

vi.mock('features/earn/vault-usd/deposit/hooks/use-deposit', () => ({
  useUsdVaultDeposit,
}));
vi.mock('features/earn/vault-usd/deposit/hooks/use-preview-deposit', () => ({
  useUsdVaultPreviewDeposit: () => ({ quote: SHOWN_QUOTE, refetchQuote }),
}));
vi.mock('features/earn/vault-usd/deposit/hooks', () => ({
  useUsdVaultDepositRequest: () => undefined,
}));
vi.mock('features/earn/vault-usd/deposit/hooks/use-deposit-form-data', () => ({
  useUsdVaultDepositFormData: () => ({
    validationContext: {},
    asyncValidationContextValue: undefined,
    refetchData: vi.fn(),
    isLoading: false,
  }),
}));
vi.mock('features/earn/vault-usd/deposit/form-context/validation', () => ({
  UsdVaultDepositFormValidationResolver: vi.fn(),
}));
vi.mock('features/earn/vault-usd/hooks/use-vault-available', () => ({
  useUsdVaultAvailable: () => ({
    isUsdVaultAvailable: true,
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

describe('UsdVaultDepositFormProvider', () => {
  it('holds the deposit to the quote the form displays', () => {
    renderToStaticMarkup(<UsdVaultDepositFormProvider />);

    expect(useUsdVaultDeposit).toHaveBeenCalled();
    const args = useUsdVaultDeposit.mock.lastCall?.[0];
    expect(args?.shownQuote).toBe(SHOWN_QUOTE);
    expect(args?.refetchQuote).toBe(refetchQuote);
  });
});
