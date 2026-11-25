// interval in ms for RPC event polling for token balance and tx updates
export const PROVIDER_POLLING_INTERVAL = 12_000;
// how long in ms to wait for RPC batching(multicall and provider)
export const PROVIDER_BATCH_TIME = 150;
// max batch
export const PROVIDER_MAX_BATCH = 20;
// how long in ms a read routed through the wallet provider may stay unanswered
// before the next RPC is tried; matches viem's default for HTTP RPCs.
// Reads only: signing and other wallet interactions never have a timeout
export const WALLET_READ_TIMEOUT = 10_000;
// AA transaction polling timeout(ms)
export const AA_TX_POLLING_TIMEOUT = 180_000; // 3 minutes
// How long in ms a tx flow waits for the RPC to serve the block of the
// previous tx before it reads, and how often it checks. MetaMask moves its
// `latest` block every 20s by default; past the timeout the flow goes on
export const TX_FLOW_PREV_BLOCK_TIMEOUT = 30_000;
export const TX_FLOW_PREV_BLOCK_INTERVAL = 1_000;

// account for gas estimation
// will always have:
// Balances:
// >=0.001 ether(or native token), >=0.001 stETH, >=0.001 wstETH,
// >=0.001 WETH (L2 stake chains: Base, Optimism, Linea, Arbitrum)
// Contract States:
// >=0.001 stETH allowance to wstETH (L1)
// >=0.001 wsTETH allowance to WQ (L1)
// >=0.001 wsTETH allowance to WQ (L1)
// >=0.001 wsTETH allowance to stETH (L2)
// >=0.001 wsTETH allowance to stETH (L2)
// >=0.001 WETH allowance to L2 staking receiver (L2 stake chains)

// on Mainnet, Hoodi, Sepolia, Optimism, Optimism Sepolia
export const ESTIMATE_ACCOUNT =
  '0x87c0e047F4e4D3e289A56a36570D4CB957A37Ef1' as const;
