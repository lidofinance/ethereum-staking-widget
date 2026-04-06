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
