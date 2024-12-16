// interval in ms for RPC event polling for token balance and tx updates
export const PROVIDER_POLLING_INTERVAL = 12_000;
// how long in ms to wait for RPC batching(multicall and provider)
export const PROVIDER_BATCH_TIME = 150;
// max batch
export const PROVIDER_MAX_BATCH = 20;
// AA transaction polling timeout(ms)
export const AA_TX_POLLING_TIMEOUT = 180_000; // 3 minutes

// account for gas estimation
// will always have:
// Balances:
// >=0.001 ether(or native token), >=0.001 stETH, >=0.001 wstETH,
// Contract States:
// >=0.001 stETH allowance to wstETH (L1)
// >=0.001 wsTETH allowance to WQ (L1)
// >=0.001 wsTETH allowance to WQ (L1)
// >=0.001 wsTETH allowance to stETH (L2)
// >=0.001 wsTETH allowance to stETH (L2)

// on Mainnet, Holesky, Sepolia, Optimism, Optimism Sepolia
export const ESTIMATE_ACCOUNT = '0x87c0e047F4e4D3e289A56a36570D4CB957A37Ef1';
