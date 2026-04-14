import type { Address } from 'viem';
import type { TokenInfo } from './types';

// Mainnet token addresses — sourced from public/token-lists/*.json

export const SELL_TOKENS: Record<number, TokenInfo[]> = {
  // Mainnet
  1: [
    {
      symbol: 'stETH',
      address: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
      decimals: 18,
      chainId: 1,
    },
    {
      symbol: 'wstETH',
      address: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
      decimals: 18,
      chainId: 1,
    },
  ],
  // Sepolia
  11155111: [
    {
      symbol: 'stETH',
      address: '0x3e3FE7dBc6B4C189E7128855dD526361c49b40Af',
      decimals: 18,
      chainId: 11155111,
    },
    {
      symbol: 'wstETH',
      address: '0xB82381A3fBD3FaFA77B3a7bE693342618240067b',
      decimals: 18,
      chainId: 11155111,
    },
  ],
};

export const BUY_TOKENS: Record<number, TokenInfo[]> = {
  // Mainnet
  1: [
    {
      symbol: 'ETH',
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      decimals: 18,
      chainId: 1,
    },
    {
      symbol: 'WETH',
      address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      decimals: 18,
      chainId: 1,
    },
    {
      symbol: 'USDC',
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      decimals: 6,
      chainId: 1,
    },
    {
      symbol: 'USDT',
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      decimals: 6,
      chainId: 1,
    },
    {
      symbol: 'USDS',
      address: '0xdC035D45d973E3EC169d2276DDab16f1e407384F',
      decimals: 18,
      chainId: 1,
    },
    {
      symbol: 'WBTC',
      address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
      decimals: 8,
      chainId: 1,
    },
  ],
  // Sepolia — only ETH and WETH available
  11155111: [
    {
      symbol: 'ETH',
      address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
      decimals: 18,
      chainId: 11155111,
    },
  ],
};

export const getDefaultSellToken = (chainId: number): TokenInfo =>
  SELL_TOKENS[chainId]?.[0] ?? SELL_TOKENS[1][0];

export const getDefaultBuyToken = (chainId: number): TokenInfo =>
  BUY_TOKENS[chainId]?.[0] ?? BUY_TOKENS[1][0];

// ETH is represented as a special address in CoW Protocol
export const isNativeEth = (address: Address): boolean =>
  address.toLowerCase() === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
