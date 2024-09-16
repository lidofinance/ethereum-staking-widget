import { parseEther } from '@ethersproject/units';

// interval in ms for RPC event polling for token balance and tx updates
export const PROVIDER_POLLING_INTERVAL = 12_000;
// how long in ms to wait for RPC batching(multicall and provider)
export const PROVIDER_BATCH_TIME = 150;
// max batch
export const PROVIDER_MAX_BATCH = 20;

// account for gas estimation
// will always have >=0.001 ether, >=0.001 stETH, >=0.001 wstETH
// on Mainnet, Holesky
export const ESTIMATE_ACCOUNT = '0x87c0e047F4e4D3e289A56a36570D4CB957A37Ef1';

export const ESTIMATE_AMOUNT = parseEther('0.001');
