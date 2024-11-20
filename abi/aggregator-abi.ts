export declare const AggregatorAbi: readonly [
  {
    readonly inputs: readonly [
      {
        readonly internalType: 'address';
        readonly name: '_aggregator';
        readonly type: 'address';
      },
      {
        readonly internalType: 'address';
        readonly name: '_accessController';
        readonly type: 'address';
      },
    ];
    readonly stateMutability: 'nonpayable';
    readonly type: 'constructor';
  },
  {
    readonly anonymous: false;
    readonly inputs: readonly [
      {
        readonly indexed: true;
        readonly internalType: 'int256';
        readonly name: 'current';
        readonly type: 'int256';
      },
      {
        readonly indexed: true;
        readonly internalType: 'uint256';
        readonly name: 'roundId';
        readonly type: 'uint256';
      },
      {
        readonly indexed: false;
        readonly internalType: 'uint256';
        readonly name: 'updatedAt';
        readonly type: 'uint256';
      },
    ];
    readonly name: 'AnswerUpdated';
    readonly type: 'event';
  },
  {
    readonly anonymous: false;
    readonly inputs: readonly [
      {
        readonly indexed: true;
        readonly internalType: 'uint256';
        readonly name: 'roundId';
        readonly type: 'uint256';
      },
      {
        readonly indexed: true;
        readonly internalType: 'address';
        readonly name: 'startedBy';
        readonly type: 'address';
      },
      {
        readonly indexed: false;
        readonly internalType: 'uint256';
        readonly name: 'startedAt';
        readonly type: 'uint256';
      },
    ];
    readonly name: 'NewRound';
    readonly type: 'event';
  },
  {
    readonly anonymous: false;
    readonly inputs: readonly [
      {
        readonly indexed: true;
        readonly internalType: 'address';
        readonly name: 'from';
        readonly type: 'address';
      },
      {
        readonly indexed: true;
        readonly internalType: 'address';
        readonly name: 'to';
        readonly type: 'address';
      },
    ];
    readonly name: 'OwnershipTransferRequested';
    readonly type: 'event';
  },
  {
    readonly anonymous: false;
    readonly inputs: readonly [
      {
        readonly indexed: true;
        readonly internalType: 'address';
        readonly name: 'from';
        readonly type: 'address';
      },
      {
        readonly indexed: true;
        readonly internalType: 'address';
        readonly name: 'to';
        readonly type: 'address';
      },
    ];
    readonly name: 'OwnershipTransferred';
    readonly type: 'event';
  },
  {
    readonly inputs: readonly [];
    readonly name: 'acceptOwnership';
    readonly outputs: readonly [];
    readonly stateMutability: 'nonpayable';
    readonly type: 'function';
  },
  {
    readonly inputs: readonly [];
    readonly name: 'accessController';
    readonly outputs: readonly [
      {
        readonly internalType: 'contract AccessControllerInterface';
        readonly name: '';
        readonly type: 'address';
      },
    ];
    readonly stateMutability: 'view';
    readonly type: 'function';
  },
  {
    readonly inputs: readonly [];
    readonly name: 'aggregator';
    readonly outputs: readonly [
      {
        readonly internalType: 'address';
        readonly name: '';
        readonly type: 'address';
      },
    ];
    readonly stateMutability: 'view';
    readonly type: 'function';
  },
  {
    readonly inputs: readonly [
      {
        readonly internalType: 'address';
        readonly name: '_aggregator';
        readonly type: 'address';
      },
    ];
    readonly name: 'confirmAggregator';
    readonly outputs: readonly [];
    readonly stateMutability: 'nonpayable';
    readonly type: 'function';
  },
  {
    readonly inputs: readonly [];
    readonly name: 'decimals';
    readonly outputs: readonly [
      {
        readonly internalType: 'uint8';
        readonly name: '';
        readonly type: 'uint8';
      },
    ];
    readonly stateMutability: 'view';
    readonly type: 'function';
  },
  {
    readonly inputs: readonly [];
    readonly name: 'description';
    readonly outputs: readonly [
      {
        readonly internalType: 'string';
        readonly name: '';
        readonly type: 'string';
      },
    ];
    readonly stateMutability: 'view';
    readonly type: 'function';
  },
  {
    readonly inputs: readonly [
      {
        readonly internalType: 'uint256';
        readonly name: '_roundId';
        readonly type: 'uint256';
      },
    ];
    readonly name: 'getAnswer';
    readonly outputs: readonly [
      {
        readonly internalType: 'int256';
        readonly name: '';
        readonly type: 'int256';
      },
    ];
    readonly stateMutability: 'view';
    readonly type: 'function';
  },
  {
    readonly inputs: readonly [
      {
        readonly internalType: 'uint80';
        readonly name: '_roundId';
        readonly type: 'uint80';
      },
    ];
    readonly name: 'getRoundData';
    readonly outputs: readonly [
      {
        readonly internalType: 'uint80';
        readonly name: 'roundId';
        readonly type: 'uint80';
      },
      {
        readonly internalType: 'int256';
        readonly name: 'answer';
        readonly type: 'int256';
      },
      {
        readonly internalType: 'uint256';
        readonly name: 'startedAt';
        readonly type: 'uint256';
      },
      {
        readonly internalType: 'uint256';
        readonly name: 'updatedAt';
        readonly type: 'uint256';
      },
      {
        readonly internalType: 'uint80';
        readonly name: 'answeredInRound';
        readonly type: 'uint80';
      },
    ];
    readonly stateMutability: 'view';
    readonly type: 'function';
  },
  {
    readonly inputs: readonly [
      {
        readonly internalType: 'uint256';
        readonly name: '_roundId';
        readonly type: 'uint256';
      },
    ];
    readonly name: 'getTimestamp';
    readonly outputs: readonly [
      {
        readonly internalType: 'uint256';
        readonly name: '';
        readonly type: 'uint256';
      },
    ];
    readonly stateMutability: 'view';
    readonly type: 'function';
  },
  {
    readonly inputs: readonly [];
    readonly name: 'latestAnswer';
    readonly outputs: readonly [
      {
        readonly internalType: 'int256';
        readonly name: '';
        readonly type: 'int256';
      },
    ];
    readonly stateMutability: 'view';
    readonly type: 'function';
  },
  {
    readonly inputs: readonly [];
    readonly name: 'latestRound';
    readonly outputs: readonly [
      {
        readonly internalType: 'uint256';
        readonly name: '';
        readonly type: 'uint256';
      },
    ];
    readonly stateMutability: 'view';
    readonly type: 'function';
  },
  {
    readonly inputs: readonly [];
    readonly name: 'latestRoundData';
    readonly outputs: readonly [
      {
        readonly internalType: 'uint80';
        readonly name: 'roundId';
        readonly type: 'uint80';
      },
      {
        readonly internalType: 'int256';
        readonly name: 'answer';
        readonly type: 'int256';
      },
      {
        readonly internalType: 'uint256';
        readonly name: 'startedAt';
        readonly type: 'uint256';
      },
      {
        readonly internalType: 'uint256';
        readonly name: 'updatedAt';
        readonly type: 'uint256';
      },
      {
        readonly internalType: 'uint80';
        readonly name: 'answeredInRound';
        readonly type: 'uint80';
      },
    ];
    readonly stateMutability: 'view';
    readonly type: 'function';
  },
  {
    readonly inputs: readonly [];
    readonly name: 'owner';
    readonly outputs: readonly [
      {
        readonly internalType: 'address payable';
        readonly name: '';
        readonly type: 'address';
      },
    ];
    readonly stateMutability: 'view';
    readonly type: 'function';
  },
  {
    readonly inputs: readonly [
      {
        readonly internalType: 'address';
        readonly name: '_to';
        readonly type: 'address';
      },
    ];
    readonly name: 'transferOwnership';
    readonly outputs: readonly [];
    readonly stateMutability: 'nonpayable';
    readonly type: 'function';
  },
  {
    readonly inputs: readonly [];
    readonly name: 'version';
    readonly outputs: readonly [
      {
        readonly internalType: 'uint256';
        readonly name: '';
        readonly type: 'uint256';
      },
    ];
    readonly stateMutability: 'view';
    readonly type: 'function';
  },
];
