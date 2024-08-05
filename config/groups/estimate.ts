import { parseEther } from '@ethersproject/units';

// account for gas estimation
// will always have >=0.001 ether, >=0.001 stETH, >=0.001 wstETH
// on Mainnet, Holesky
export const ESTIMATE_ACCOUNT = '0x87c0e047F4e4D3e289A56a36570D4CB957A37Ef1';

export const ESTIMATE_AMOUNT = parseEther('0.001');
