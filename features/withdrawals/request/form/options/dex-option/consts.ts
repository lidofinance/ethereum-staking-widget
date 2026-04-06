// RPC method denylist for CowSwap provider bridge.
//
// CowSwap legitimately uses:
// - eth_sendTransaction (approve, wrap/unwrap)
// - eth_signTypedData_v4 (EIP-712 order signatures)
// - eth_call, eth_estimateGas, eth_getBalance, eth_chainId, ...
// - wallet_sendCalls, wallet_getCallsStatus (EIP-5792, Smart Accounts)
export const BLOCKED_RPC_METHODS = new Set([
  // Signing arbitrary data (phishing vector).
  // CowSwap uses eth_signTypedData_v4, not these.
  'eth_sign',
  'personal_sign',
  'eth_signTypedData',
  'eth_signTypedData_v3',

  // Network manipulation — could redirect to a malicious chain.
  'wallet_addEthereumChain',
  'wallet_switchEthereumChain',

  // Wallet permission manipulation.
  'wallet_requestPermissions',
  'wallet_revokePermissions',
  'wallet_watchAsset',

  // Debug methods — private data leak.
  'debug_traceTransaction',
  'debug_traceCall',
]);

export const MAX_SLIPPAGE = 300; // 3%
export const WHEN_PRICE_IMPACT_IS_HIGH_THAN = 3; // 3%
