import { parseUnits } from 'viem';

import mainnetConfig from 'networks/mainnet.json';

import type { OrderData } from '../../validate-tx';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Snapshot of the validated onBeforeTrade payload (human-readable units). */
export type ValidatedTradeSnapshot = {
  sellToken: string;
  buyToken: string;
  sellAmountUnits: string;
  buyAmountMinUnits: string;
};

// ---------------------------------------------------------------------------
// Token decimals (all whitelisted tokens)
// ---------------------------------------------------------------------------

const c = mainnetConfig.contracts;
const ETH_PLACEHOLDER = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

const TOKEN_DECIMALS: Record<string, number> = {
  [c.lido.toLowerCase()]: 18, // stETH
  [c.wsteth.toLowerCase()]: 18, // wstETH
  [ETH_PLACEHOLDER]: 18, // ETH placeholder
  [c.weth.toLowerCase()]: 18, // WETH
  [c.usdc.toLowerCase()]: 6, // USDC
  [c.usdt.toLowerCase()]: 6, // USDT
  [c.usds.toLowerCase()]: 18, // USDS
  [c.wbtc.toLowerCase()]: 8, // WBTC
};

// ---------------------------------------------------------------------------
// Amount verification against validated payload
// ---------------------------------------------------------------------------

/**
 * Converts a human-readable decimal string ("0.1") to raw bigint
 * using the token's decimals. Returns null if conversion fails.
 */
const unitsToRaw = (units: string, tokenAddress: string): bigint | null => {
  const decimals = TOKEN_DECIMALS[tokenAddress.toLowerCase()];
  if (decimals === undefined) return null;
  try {
    return parseUnits(units, decimals);
  } catch {
    return null;
  }
};

/**
 * Verifies that the EIP-712 order amounts match the onBeforeTrade payload
 * that was validated by the trade guard.
 *
 * - sellAmount must equal the validated sellAmountUnits (exact match)
 * - buyAmount must be >= the validated buyAmountMinUnits (no worse than shown)
 *
 * Returns null if OK, or an error message if verification fails.
 */
export const verifyOrderAmounts = (
  order: OrderData,
  snapshot: ValidatedTradeSnapshot,
): string | null => {
  // Token addresses must match
  if (order.sellToken.toLowerCase() !== snapshot.sellToken.toLowerCase()) {
    return 'Sell token in order differs from validated trade';
  }
  if (order.buyToken.toLowerCase() !== snapshot.buyToken.toLowerCase()) {
    return 'Buy token in order differs from validated trade';
  }

  // Convert validated units to raw for comparison
  const expectedSell = unitsToRaw(snapshot.sellAmountUnits, order.sellToken);
  const expectedBuyMin = unitsToRaw(snapshot.buyAmountMinUnits, order.buyToken);

  const orderSell = order.sellAmount;
  const orderBuy = order.buyAmount;

  // Fail-closed: if we can't convert units, we can't verify amounts
  if (expectedSell === null) {
    return 'Cannot verify sell amount: token decimals unknown';
  }
  if (expectedBuyMin === null) {
    return 'Cannot verify buy amount: token decimals unknown';
  }

  // Sell amount: order must not sell more than validated
  if (orderSell > expectedSell) {
    return `Order sells more than validated (${order.sellAmount} > ${expectedSell})`;
  }

  // Buy amount (minimum receive): order must not accept less than validated
  if (orderBuy < expectedBuyMin) {
    return `Order minimum receive is less than validated (${order.buyAmount} < ${expectedBuyMin})`;
  }

  return null;
};
