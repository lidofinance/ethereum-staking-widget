// account for gas estimation
// will always have >=0.001 ether, >=0.001 stETH, >=0.001 wstETH
// on Mainnet, Rinkeby, Goerli
export const ESTIMATE_ACCOUNT = '0x87c0e047F4e4D3e289A56a36570D4CB957A37Ef1';

// fallback gas limits per 1 withdraw request
export const WITHDRAWAL_QUEUE_REQUEST_STETH_PERMIT_GAS_LIMIT_DEFAULT = 255350;
export const WITHDRAWAL_QUEUE_REQUEST_WSTETH_PERMIT_GAS_LIMIT_DEFAULT = 312626;
export const WITHDRAWAL_QUEUE_CLAIM_GAS_LIMIT_DEFAULT = 89818;
