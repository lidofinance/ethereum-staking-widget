export declare const PartialStakingRouterAbi: readonly [
  {
    readonly inputs: readonly [
      {
        readonly internalType: 'address';
        readonly name: '_depositContract';
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
        readonly internalType: 'uint256';
        readonly name: 'stakingModuleId';
        readonly type: 'uint256';
      },
      {
        readonly indexed: false;
        readonly internalType: 'uint256';
        readonly name: 'stakingModuleFee';
        readonly type: 'uint256';
      },
      {
        readonly indexed: false;
        readonly internalType: 'uint256';
        readonly name: 'treasuryFee';
        readonly type: 'uint256';
      },
      {
        readonly indexed: false;
        readonly internalType: 'address';
        readonly name: 'setBy';
        readonly type: 'address';
      },
    ];
    readonly name: 'StakingModuleFeesSet';
    readonly type: 'event';
  },
  {
    readonly inputs: readonly [];
    readonly name: 'FEE_PRECISION_POINTS';
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
    readonly name: 'TOTAL_BASIS_POINTS';
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
    readonly name: 'getLido';
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
    readonly inputs: readonly [];
    readonly name: 'getStakingFeeAggregateDistribution';
    readonly outputs: readonly [
      {
        readonly internalType: 'uint96';
        readonly name: 'modulesFee';
        readonly type: 'uint96';
      },
      {
        readonly internalType: 'uint96';
        readonly name: 'treasuryFee';
        readonly type: 'uint96';
      },
      {
        readonly internalType: 'uint256';
        readonly name: 'basePrecision';
        readonly type: 'uint256';
      },
    ];
    readonly stateMutability: 'view';
    readonly type: 'function';
  },
  {
    readonly inputs: readonly [];
    readonly name: 'getStakingFeeAggregateDistributionE4Precision';
    readonly outputs: readonly [
      {
        readonly internalType: 'uint16';
        readonly name: 'modulesFee';
        readonly type: 'uint16';
      },
      {
        readonly internalType: 'uint16';
        readonly name: 'treasuryFee';
        readonly type: 'uint16';
      },
    ];
    readonly stateMutability: 'view';
    readonly type: 'function';
  },
  {
    readonly inputs: readonly [];
    readonly name: 'getStakingRewardsDistribution';
    readonly outputs: readonly [
      {
        readonly internalType: 'address[]';
        readonly name: 'recipients';
        readonly type: 'address[]';
      },
      {
        readonly internalType: 'uint256[]';
        readonly name: 'stakingModuleIds';
        readonly type: 'uint256[]';
      },
      {
        readonly internalType: 'uint96[]';
        readonly name: 'stakingModuleFees';
        readonly type: 'uint96[]';
      },
      {
        readonly internalType: 'uint96';
        readonly name: 'totalFee';
        readonly type: 'uint96';
      },
      {
        readonly internalType: 'uint256';
        readonly name: 'precisionPoints';
        readonly type: 'uint256';
      },
    ];
    readonly stateMutability: 'view';
    readonly type: 'function';
  },
  {
    readonly inputs: readonly [];
    readonly name: 'getTotalFeeE4Precision';
    readonly outputs: readonly [
      {
        readonly internalType: 'uint16';
        readonly name: 'totalFee';
        readonly type: 'uint16';
      },
    ];
    readonly stateMutability: 'view';
    readonly type: 'function';
  },
  {
    readonly stateMutability: 'payable';
    readonly type: 'receive';
  },
];
