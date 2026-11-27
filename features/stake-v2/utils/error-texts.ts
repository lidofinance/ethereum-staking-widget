/**
 * Every user-facing error text of the v2 forms, in one place: by form, then
 * by case. Each is a function, so the call site reads the same whether a
 * text takes values or not, e.g.
 * `errorTexts.forms.general.insufficientBalance(balance, 'ETH')`.
 * `token` is a display symbol (ETH, stETH), `chain` a pretty chain name.
 */
export const errorTexts = {
  forms: {
    general: {
      /** empty on purpose: no amount (empty or 0) only blocks submit */
      amountRequired: () => '',
      /** below 0 or above uint256: the amount input cannot produce these */
      amountInvalid: (token: string) => `${token} amount is not valid`,
      insufficientBalance: (_balance: bigint, _token: string) =>
        `Insufficient balance`,
      insufficientGas: (_gasCost: bigint) =>
        `Insufficient ETH balance for gas cost`,
      gasReserve: (_maxAmount: bigint) =>
        `Insufficient ETH balance for transaction and gas`,
      networkDataUnavailable: () =>
        'Could not load network data. Please try again.',
      quoteChanged: () => 'The rate changed. Please review and try again.',
    },
    stake: {
      stakeLimitReached: () =>
        "Staking limit reached. Please wait until it's restored",
      stakeLimitExceeded: (_limit: bigint, token: string) =>
        `${token} amount exceeds current staking limit`,
      chainUnavailable: (chain: string) =>
        `Staking is currently not available for ${chain}`,
      ledgerLiveUnavailable: (chain: string) =>
        `Staking is currently not available for Ledger Live on ${chain}`,
      poolLimitExceeded: (token: string, chain: string, _liquidity: bigint) =>
        `${token} amount exceeds current staking limit on ${chain}`,
      /** below the liquidity target: the pool refills soon */
      poolTemporarilyExhausted: (token: string, chain: string) =>
        `${token} amount exceeds the remaining pool capacity on ${chain}`,
      poolCapacityExceeded: (token: string, chain: string) =>
        `${token} amount exceeds total pool capacity on ${chain}`,
    },
  },
} as const;
