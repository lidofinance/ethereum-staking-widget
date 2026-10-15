// The slice of CCIP the slow stake touches: the router for the quote and the
// lane lookup, the OnRamp for the pool lookup, the WETH pool for its outbound
// rate limiter. Same signatures on the 1.5, 1.6 and 2.0 ramps

export const CCIP_ROUTER_ABI = [
  {
    inputs: [
      {
        internalType: 'uint64',
        name: 'destinationChainSelector',
        type: 'uint64',
      },
      {
        components: [
          { internalType: 'bytes', name: 'receiver', type: 'bytes' },
          { internalType: 'bytes', name: 'data', type: 'bytes' },
          {
            components: [
              { internalType: 'address', name: 'token', type: 'address' },
              { internalType: 'uint256', name: 'amount', type: 'uint256' },
            ],
            internalType: 'struct Client.EVMTokenAmount[]',
            name: 'tokenAmounts',
            type: 'tuple[]',
          },
          { internalType: 'address', name: 'feeToken', type: 'address' },
          { internalType: 'bytes', name: 'extraArgs', type: 'bytes' },
        ],
        internalType: 'struct Client.EVM2AnyMessage',
        name: 'message',
        type: 'tuple',
      },
    ],
    name: 'getFee',
    outputs: [{ internalType: 'uint256', name: 'fee', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint64', name: 'destChainSelector', type: 'uint64' },
    ],
    name: 'getOnRamp',
    outputs: [{ internalType: 'address', name: 'onRamp', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint64', name: 'destChainSelector', type: 'uint64' },
    ],
    name: 'isChainSupported',
    outputs: [{ internalType: 'bool', name: 'supported', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export type CcipRouterAbiType = typeof CCIP_ROUTER_ABI;

export const CCIP_ONRAMP_ABI = [
  {
    inputs: [
      { internalType: 'uint64', name: 'destChainSelector', type: 'uint64' },
      { internalType: 'address', name: 'sourceToken', type: 'address' },
    ],
    name: 'getPoolBySourceToken',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'typeAndVersion',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export type CcipOnRampAbiType = typeof CCIP_ONRAMP_ABI;

// Reverts of the pool's rate limiter, raised inside the stake transaction.
// Listed with the pool and merged into the sender ABI so a failed send
// decodes to them
export const CCIP_RATE_LIMITER_ERRORS_ABI = [
  {
    inputs: [
      { internalType: 'uint256', name: 'capacity', type: 'uint256' },
      { internalType: 'uint256', name: 'requested', type: 'uint256' },
      { internalType: 'address', name: 'tokenAddress', type: 'address' },
    ],
    name: 'TokenMaxCapacityExceeded',
    type: 'error',
  },
  {
    inputs: [
      { internalType: 'uint256', name: 'minWaitInSeconds', type: 'uint256' },
      { internalType: 'uint256', name: 'available', type: 'uint256' },
      { internalType: 'address', name: 'tokenAddress', type: 'address' },
    ],
    name: 'TokenRateLimitReached',
    type: 'error',
  },
] as const;

export const CCIP_TOKEN_POOL_ABI = [
  ...CCIP_RATE_LIMITER_ERRORS_ABI,
  {
    inputs: [
      { internalType: 'uint64', name: 'remoteChainSelector', type: 'uint64' },
    ],
    name: 'getCurrentOutboundRateLimiterState',
    outputs: [
      {
        components: [
          { internalType: 'uint128', name: 'tokens', type: 'uint128' },
          { internalType: 'uint32', name: 'lastUpdated', type: 'uint32' },
          { internalType: 'bool', name: 'isEnabled', type: 'bool' },
          { internalType: 'uint128', name: 'capacity', type: 'uint128' },
          { internalType: 'uint128', name: 'rate', type: 'uint128' },
        ],
        internalType: 'struct RateLimiter.TokenBucket',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getToken',
    outputs: [{ internalType: 'address', name: 'token', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint64', name: 'remoteChainSelector', type: 'uint64' },
    ],
    name: 'isSupportedChain',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'typeAndVersion',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export type CcipTokenPoolAbiType = typeof CCIP_TOKEN_POOL_ABI;
