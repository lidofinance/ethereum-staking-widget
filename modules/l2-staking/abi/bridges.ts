// The native bridges' side of a slow stake's way back: only what the status
// pipeline reads to follow the wstETH from the L1 receipt to the L2 by key

// The L2 messenger predeploy, which the deposit transaction calls: its
// verdict on the relay is in the landing receipt
export const OP_STACK_L2_CROSS_DOMAIN_MESSENGER_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'msgHash',
        type: 'bytes32',
      },
    ],
    name: 'RelayedMessage',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'msgHash',
        type: 'bytes32',
      },
    ],
    name: 'FailedRelayedMessage',
    type: 'event',
  },
] as const;

// The delayed inbox and the bridge on L1 log every field of a retryable
// ticket; the ticket id (its creation transaction on the L2) is derived
// from them
export const ARBITRUM_INBOX_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'messageNum',
        type: 'uint256',
      },
      { indexed: false, internalType: 'bytes', name: 'data', type: 'bytes' },
    ],
    name: 'InboxMessageDelivered',
    type: 'event',
  },
] as const;

export const ARBITRUM_BRIDGE_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'messageIndex',
        type: 'uint256',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'beforeInboxAcc',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'inbox',
        type: 'address',
      },
      { indexed: false, internalType: 'uint8', name: 'kind', type: 'uint8' },
      {
        indexed: false,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'bytes32',
        name: 'messageDataHash',
        type: 'bytes32',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'baseFeeL1',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint64',
        name: 'timestamp',
        type: 'uint64',
      },
    ],
    name: 'MessageDelivered',
    type: 'event',
  },
] as const;

// The retryable precompile on the L2: the creation receipt logs the
// scheduled auto-redeem, and a ticket that was redeemed or expired no
// longer answers by id
export const ARBITRUM_RETRYABLE_TX_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'ticketId',
        type: 'bytes32',
      },
    ],
    name: 'TicketCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'ticketId',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'retryTxHash',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'uint64',
        name: 'sequenceNum',
        type: 'uint64',
      },
      {
        indexed: false,
        internalType: 'uint64',
        name: 'donatedGas',
        type: 'uint64',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'gasDonor',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'maxRefund',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'submissionFeeRefund',
        type: 'uint256',
      },
    ],
    name: 'RedeemScheduled',
    type: 'event',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'ticketId', type: 'bytes32' }],
    name: 'getTimeout',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  { inputs: [], name: 'NoTicketWithID', type: 'error' },
] as const;

// The message service on both sides: the L1 one logs the message hash the
// L2 one tracks the claim by
export const LINEA_MESSAGE_SERVICE_ABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: '_from',
        type: 'address',
      },
      { indexed: true, internalType: 'address', name: '_to', type: 'address' },
      {
        indexed: false,
        internalType: 'uint256',
        name: '_fee',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: '_value',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: '_nonce',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'bytes',
        name: '_calldata',
        type: 'bytes',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: '_messageHash',
        type: 'bytes32',
      },
    ],
    name: 'MessageSent',
    type: 'event',
  },
  {
    inputs: [{ internalType: 'bytes32', name: 'messageHash', type: 'bytes32' }],
    name: 'inboxL1L2MessageStatus',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;
