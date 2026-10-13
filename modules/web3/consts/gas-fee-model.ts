import { CHAINS } from 'consts/chains';

/**
 * How a chain prices transactions. Decides which RPC methods give an upper
 * bound for the tx cost. No fee values live here: everything is read live.
 */
export enum GAS_FEE_MODEL {
  // EIP-1559 fee market, cost = gasLimit * (baseFee + tip)
  Ethereum = 'ethereum',
  // EIP-1559 execution fee plus a separate L1 data fee charged on top of gas
  OpStack = 'op-stack',
  // EIP-1559 fee market, the L1 data cost is folded into the gas estimate
  Arbitrum = 'arbitrum',
  // Fixed base fee, the L1 data cost is folded into the priority fee that
  // linea_estimateGas returns per tx; the whole tip offered is charged
  Linea = 'linea',
}

const OP_STACK_CHAINS = new Set<number>([
  CHAINS.Optimism,
  CHAINS.OptimismSepolia,
  CHAINS.Unichain,
  CHAINS.UnichainSepolia,
  CHAINS.Base,
]);
const ARBITRUM_CHAINS = new Set<number>([CHAINS.Arbitrum]);
const LINEA_CHAINS = new Set<number>([CHAINS.Linea]);

export const getGasFeeModel = (chainId?: number): GAS_FEE_MODEL => {
  if (chainId === undefined) return GAS_FEE_MODEL.Ethereum;
  if (OP_STACK_CHAINS.has(chainId)) return GAS_FEE_MODEL.OpStack;
  if (ARBITRUM_CHAINS.has(chainId)) return GAS_FEE_MODEL.Arbitrum;
  if (LINEA_CHAINS.has(chainId)) return GAS_FEE_MODEL.Linea;
  return GAS_FEE_MODEL.Ethereum;
};

// OP-stack GasPriceOracle predeploy, same address on every OP-stack chain
export const OP_STACK_GAS_PRICE_ORACLE_ADDRESS =
  '0x420000000000000000000000000000000000000F' as const;

// An EIP-1559 base fee can double within ~6 blocks, so the max price is quoted
// at twice the pending base fee until base fee changes can be predicted
export const BASE_FEE_MULTIPLIER = 2n;

// The L1 data fee (OP-stack) and the L1-cost-driven tip (Linea) follow the L1
// base fee, which can move between quoting and sending
export const L1_COST_BUFFER_PERCENT = 25n;
