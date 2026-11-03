export const L2_STAKING_ORACLE_FEED_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'aggregator', type: 'address' },
      { internalType: 'bool', name: 'isInverse', type: 'bool' },
      { internalType: 'uint32', name: 'heartbeat', type: 'uint32' },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  { inputs: [], name: 'PriceOracleInvalidParameters', type: 'error' },
  { inputs: [], name: 'PriceOracleInvalidPrice', type: 'error' },
  { inputs: [], name: 'PriceOracleStalePrice', type: 'error' },
  {
    inputs: [],
    name: 'AGGREGATOR',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'DECIMALS',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'HEARTBEAT',
    outputs: [{ internalType: 'uint32', name: '', type: 'uint32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'IS_INVERSE',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getLatestAnswer',
    outputs: [
      { internalType: 'uint256', name: 'answerScaled', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export type L2StakingOracleFeedAbiType = typeof L2_STAKING_ORACLE_FEED_ABI;
