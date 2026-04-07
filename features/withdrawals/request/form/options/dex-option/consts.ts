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
