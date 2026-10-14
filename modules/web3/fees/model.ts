import { CHAINS } from 'consts/chains';

/**
 * How a chain prices transactions. Picks the model in `models/`, which in
 * turn picks the RPC methods that give an upper bound for a tx cost.
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

const CHAIN_FEE_MODEL: Partial<Record<number, GAS_FEE_MODEL>> = {
  [CHAINS.Optimism]: GAS_FEE_MODEL.OpStack,
  [CHAINS.OptimismSepolia]: GAS_FEE_MODEL.OpStack,
  [CHAINS.Unichain]: GAS_FEE_MODEL.OpStack,
  [CHAINS.UnichainSepolia]: GAS_FEE_MODEL.OpStack,
  [CHAINS.Base]: GAS_FEE_MODEL.OpStack,
  [CHAINS.Arbitrum]: GAS_FEE_MODEL.Arbitrum,
  [CHAINS.Linea]: GAS_FEE_MODEL.Linea,
};

// Ethereum L1 and testnets, and any chain not listed: the plain fee market
export const getGasFeeModel = (chainId?: number): GAS_FEE_MODEL =>
  (chainId !== undefined && CHAIN_FEE_MODEL[chainId]) || GAS_FEE_MODEL.Ethereum;
