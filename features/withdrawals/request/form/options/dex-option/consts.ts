export const BLOCKED_RPC_METHODS = new Set([
  // Signing arbitrary data (phishing)
  'eth_sign',
  // Manipulation of the network
  'wallet_addEthereumChain',
  'wallet_switchEthereumChain',
  // Debugging (leak of private data)
  'debug_traceTransaction',
  'debug_traceCall',
]);

export const MAX_SLIPPAGE = 300; // 3%
export const WHEN_PRICE_IMPACT_IS_HIGH_THAN = 3; // 3%

// CoW Protocol constants (for direct SDK integration)
export const COW_VAULT_RELAYER =
  '0xC92E8bdf79f0507f65a392b0ab4667716BFE0110' as const;
export const COW_SETTLEMENT =
  '0x9008D19f58AAbD9eD0D60971565AA8510560ab41' as const;
export const COW_API_BASE: Record<number, string> = {
  1: 'https://api.cow.fi/mainnet',
  11155111: 'https://api.cow.fi/sepolia',
};
export const PARTNER_FEE_BPS = 30;
export const QUOTE_REFRESH_INTERVAL = 15_000; // 15s
export const ORDER_POLL_INTERVAL = 5_000; // 5s
export const QUOTE_DEBOUNCE_MS = 500;
