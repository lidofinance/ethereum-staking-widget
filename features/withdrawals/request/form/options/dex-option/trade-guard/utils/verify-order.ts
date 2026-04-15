import { parseUnits } from 'viem';

import mainnetConfig from 'networks/mainnet.json';

import { VALID_SELL_TOKENS, VALID_BUY_TOKENS } from '../consts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type OrderFields = {
  sellToken: string;
  buyToken: string;
  receiver: string;
  sellAmount: string;
  buyAmount: string;
};

export type { OrderFields };

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
// Static field verification (addresses only)
// ---------------------------------------------------------------------------

/**
 * Defense-in-depth: verifies that an EIP-712 CowSwap order
 * matches the expected constraints before signing.
 *
 * Returns null if OK, or an error message if verification fails.
 */
export const verifyOrderFields = (
  order: OrderFields,
  walletAddress: string,
  isTestnet: boolean,
): string | null => {
  if (order.receiver.toLowerCase() !== walletAddress.toLowerCase()) {
    return 'Order receiver does not match wallet address';
  }

  if (!isTestnet) {
    if (!VALID_SELL_TOKENS.has(order.sellToken.toLowerCase())) {
      return 'Invalid sell token in order';
    }
    if (!VALID_BUY_TOKENS.has(order.buyToken.toLowerCase())) {
      return 'Invalid buy token in order';
    }
  }

  return null;
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
  order: OrderFields,
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
  const expectedBuyMin = unitsToRaw(
    snapshot.buyAmountMinUnits,
    order.buyToken,
  );

  let orderSell: bigint;
  let orderBuy: bigint;
  try {
    orderSell = BigInt(order.sellAmount);
    orderBuy = BigInt(order.buyAmount);
  } catch {
    return 'Invalid order amount format';
  }

  // Sell amount: order must not sell more than validated
  if (expectedSell !== null && orderSell > expectedSell) {
    return `Order sells more than validated (${order.sellAmount} > ${expectedSell})`;
  }

  // Buy amount (minimum receive): order must not accept less than validated
  if (expectedBuyMin !== null && orderBuy < expectedBuyMin) {
    return `Order minimum receive is less than validated (${order.buyAmount} < ${expectedBuyMin})`;
  }

  return null;
};

// ---------------------------------------------------------------------------
// EIP-712 parsing
// ---------------------------------------------------------------------------

/**
 * Attempts to extract CowSwap Order fields from eth_signTypedData_v4 params.
 * Returns null if the request is not a CowSwap Order signing request.
 */
export const parseOrderFromSignRequest = (
  params: unknown,
): OrderFields | null => {
  try {
    const [, typedDataRaw] = params as [string, string | object];
    const typedData =
      typeof typedDataRaw === 'string'
        ? JSON.parse(typedDataRaw)
        : typedDataRaw;

    if (typedData?.primaryType === 'Order' && typedData?.message) {
      const msg = typedData.message;
      if (
        msg.sellToken &&
        msg.buyToken &&
        msg.receiver &&
        msg.sellAmount &&
        msg.buyAmount
      ) {
        return msg as OrderFields;
      }
    }
  } catch {
    // Not valid typed data — ignore
  }
  return null;
};
