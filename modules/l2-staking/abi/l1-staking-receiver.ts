// The L1 receiver (LidoCustomReceiver): what the status pipeline reads from
// it. The bridge adapters run by delegatecall, so their events are emitted
// from the receiver's address and are listed with it

const ANY2EVM_MESSAGE = {
  components: [
    { internalType: 'bytes32', name: 'messageId', type: 'bytes32' },
    { internalType: 'uint64', name: 'sourceChainSelector', type: 'uint64' },
    { internalType: 'bytes', name: 'sender', type: 'bytes' },
    { internalType: 'bytes', name: 'data', type: 'bytes' },
    {
      components: [
        { internalType: 'address', name: 'token', type: 'address' },
        { internalType: 'uint256', name: 'amount', type: 'uint256' },
      ],
      internalType: 'struct Client.EVMTokenAmount[]',
      name: 'destTokenAmounts',
      type: 'tuple[]',
    },
  ],
  internalType: 'struct Client.Any2EVMMessage',
  name: 'message',
  type: 'tuple',
} as const;

export const L1_STAKING_RECEIVER_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'messageId',
        type: 'bytes32',
      },
    ],
    name: 'MessageSucceeded',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'messageId',
        type: 'bytes32',
      },
      { ...ANY2EVM_MESSAGE, indexed: false },
    ],
    name: 'MessageFailed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'messageId',
        type: 'bytes32',
      },
    ],
    name: 'MessageRecovered',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'messageId',
        type: 'bytes32',
      },
    ],
    name: 'TokensRecovered',
    type: 'event',
  },
  // bridge adapters, by delegatecall
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'messageId',
        type: 'bytes32',
      },
    ],
    name: 'ArbitrumL1toL2MessageSent',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [],
    name: 'OptimismL1toL2MessageSent',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [],
    name: 'BaseL1toL2MessageSent',
    type: 'event',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'messageId', type: 'bytes32' }],
    name: 'getFailedMessageHash',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'WSTETH',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [ANY2EVM_MESSAGE],
    name: 'retryFailedMessage',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
] as const;

export type L1StakingReceiverAbiType = typeof L1_STAKING_RECEIVER_ABI;
