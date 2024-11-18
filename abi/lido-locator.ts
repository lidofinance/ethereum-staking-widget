export declare const LidoLocatorAbi: readonly [
  {
    readonly inputs: readonly [
      {
        readonly components: readonly [
          {
            readonly internalType: 'address';
            readonly name: 'accountingOracle';
            readonly type: 'address';
          },
          {
            readonly internalType: 'address';
            readonly name: 'depositSecurityModule';
            readonly type: 'address';
          },
          {
            readonly internalType: 'address';
            readonly name: 'elRewardsVault';
            readonly type: 'address';
          },
          {
            readonly internalType: 'address';
            readonly name: 'legacyOracle';
            readonly type: 'address';
          },
          {
            readonly internalType: 'address';
            readonly name: 'lido';
            readonly type: 'address';
          },
          {
            readonly internalType: 'address';
            readonly name: 'oracleReportSanityChecker';
            readonly type: 'address';
          },
          {
            readonly internalType: 'address';
            readonly name: 'postTokenRebaseReceiver';
            readonly type: 'address';
          },
          {
            readonly internalType: 'address';
            readonly name: 'burner';
            readonly type: 'address';
          },
          {
            readonly internalType: 'address';
            readonly name: 'stakingRouter';
            readonly type: 'address';
          },
          {
            readonly internalType: 'address';
            readonly name: 'treasury';
            readonly type: 'address';
          },
          {
            readonly internalType: 'address';
            readonly name: 'validatorsExitBusOracle';
            readonly type: 'address';
          },
          {
            readonly internalType: 'address';
            readonly name: 'withdrawalQueue';
            readonly type: 'address';
          },
          {
            readonly internalType: 'address';
            readonly name: 'withdrawalVault';
            readonly type: 'address';
          },
          {
            readonly internalType: 'address';
            readonly name: 'oracleDaemonConfig';
            readonly type: 'address';
          },
        ];
        readonly internalType: 'struct LidoLocator.Config';
        readonly name: '_config';
        readonly type: 'tuple';
      },
    ];
    readonly stateMutability: 'nonpayable';
    readonly type: 'constructor';
  },
  {
    readonly inputs: readonly [];
    readonly name: 'ZeroAddress';
    readonly type: 'error';
  },
  {
    readonly inputs: readonly [];
    readonly name: 'accountingOracle';
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
    readonly name: 'burner';
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
    readonly name: 'coreComponents';
    readonly outputs: readonly [
      {
        readonly internalType: 'address';
        readonly name: '';
        readonly type: 'address';
      },
      {
        readonly internalType: 'address';
        readonly name: '';
        readonly type: 'address';
      },
      {
        readonly internalType: 'address';
        readonly name: '';
        readonly type: 'address';
      },
      {
        readonly internalType: 'address';
        readonly name: '';
        readonly type: 'address';
      },
      {
        readonly internalType: 'address';
        readonly name: '';
        readonly type: 'address';
      },
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
    readonly name: 'depositSecurityModule';
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
    readonly name: 'elRewardsVault';
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
    readonly name: 'legacyOracle';
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
    readonly name: 'lido';
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
    readonly name: 'oracleDaemonConfig';
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
    readonly name: 'oracleReportComponentsForLido';
    readonly outputs: readonly [
      {
        readonly internalType: 'address';
        readonly name: '';
        readonly type: 'address';
      },
      {
        readonly internalType: 'address';
        readonly name: '';
        readonly type: 'address';
      },
      {
        readonly internalType: 'address';
        readonly name: '';
        readonly type: 'address';
      },
      {
        readonly internalType: 'address';
        readonly name: '';
        readonly type: 'address';
      },
      {
        readonly internalType: 'address';
        readonly name: '';
        readonly type: 'address';
      },
      {
        readonly internalType: 'address';
        readonly name: '';
        readonly type: 'address';
      },
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
    readonly name: 'oracleReportSanityChecker';
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
    readonly name: 'postTokenRebaseReceiver';
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
    readonly name: 'stakingRouter';
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
    readonly name: 'treasury';
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
    readonly name: 'validatorsExitBusOracle';
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
    readonly name: 'withdrawalQueue';
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
    readonly name: 'withdrawalVault';
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
];
