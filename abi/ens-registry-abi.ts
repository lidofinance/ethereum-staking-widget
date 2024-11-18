export declare const ENSRegistryAbi: readonly [
  {
    readonly inputs: readonly [
      {
        readonly internalType: 'contract ENS';
        readonly name: '_old';
        readonly type: 'address';
      },
    ];
    readonly payable: false;
    readonly stateMutability: 'nonpayable';
    readonly type: 'constructor';
  },
  {
    readonly anonymous: false;
    readonly inputs: readonly [
      {
        readonly indexed: true;
        readonly internalType: 'address';
        readonly name: 'owner';
        readonly type: 'address';
      },
      {
        readonly indexed: true;
        readonly internalType: 'address';
        readonly name: 'operator';
        readonly type: 'address';
      },
      {
        readonly indexed: false;
        readonly internalType: 'bool';
        readonly name: 'approved';
        readonly type: 'bool';
      },
    ];
    readonly name: 'ApprovalForAll';
    readonly type: 'event';
  },
  {
    readonly anonymous: false;
    readonly inputs: readonly [
      {
        readonly indexed: true;
        readonly internalType: 'bytes32';
        readonly name: 'node';
        readonly type: 'bytes32';
      },
      {
        readonly indexed: true;
        readonly internalType: 'bytes32';
        readonly name: 'label';
        readonly type: 'bytes32';
      },
      {
        readonly indexed: false;
        readonly internalType: 'address';
        readonly name: 'owner';
        readonly type: 'address';
      },
    ];
    readonly name: 'NewOwner';
    readonly type: 'event';
  },
  {
    readonly anonymous: false;
    readonly inputs: readonly [
      {
        readonly indexed: true;
        readonly internalType: 'bytes32';
        readonly name: 'node';
        readonly type: 'bytes32';
      },
      {
        readonly indexed: false;
        readonly internalType: 'address';
        readonly name: 'resolver';
        readonly type: 'address';
      },
    ];
    readonly name: 'NewResolver';
    readonly type: 'event';
  },
  {
    readonly anonymous: false;
    readonly inputs: readonly [
      {
        readonly indexed: true;
        readonly internalType: 'bytes32';
        readonly name: 'node';
        readonly type: 'bytes32';
      },
      {
        readonly indexed: false;
        readonly internalType: 'uint64';
        readonly name: 'ttl';
        readonly type: 'uint64';
      },
    ];
    readonly name: 'NewTTL';
    readonly type: 'event';
  },
  {
    readonly anonymous: false;
    readonly inputs: readonly [
      {
        readonly indexed: true;
        readonly internalType: 'bytes32';
        readonly name: 'node';
        readonly type: 'bytes32';
      },
      {
        readonly indexed: false;
        readonly internalType: 'address';
        readonly name: 'owner';
        readonly type: 'address';
      },
    ];
    readonly name: 'Transfer';
    readonly type: 'event';
  },
  {
    readonly constant: true;
    readonly inputs: readonly [
      {
        readonly internalType: 'address';
        readonly name: 'owner';
        readonly type: 'address';
      },
      {
        readonly internalType: 'address';
        readonly name: 'operator';
        readonly type: 'address';
      },
    ];
    readonly name: 'isApprovedForAll';
    readonly outputs: readonly [
      {
        readonly internalType: 'bool';
        readonly name: '';
        readonly type: 'bool';
      },
    ];
    readonly payable: false;
    readonly stateMutability: 'view';
    readonly type: 'function';
  },
  {
    readonly constant: true;
    readonly inputs: readonly [];
    readonly name: 'old';
    readonly outputs: readonly [
      {
        readonly internalType: 'contract ENS';
        readonly name: '';
        readonly type: 'address';
      },
    ];
    readonly payable: false;
    readonly stateMutability: 'view';
    readonly type: 'function';
  },
  {
    readonly constant: true;
    readonly inputs: readonly [
      {
        readonly internalType: 'bytes32';
        readonly name: 'node';
        readonly type: 'bytes32';
      },
    ];
    readonly name: 'owner';
    readonly outputs: readonly [
      {
        readonly internalType: 'address';
        readonly name: '';
        readonly type: 'address';
      },
    ];
    readonly payable: false;
    readonly stateMutability: 'view';
    readonly type: 'function';
  },
  {
    readonly constant: true;
    readonly inputs: readonly [
      {
        readonly internalType: 'bytes32';
        readonly name: 'node';
        readonly type: 'bytes32';
      },
    ];
    readonly name: 'recordExists';
    readonly outputs: readonly [
      {
        readonly internalType: 'bool';
        readonly name: '';
        readonly type: 'bool';
      },
    ];
    readonly payable: false;
    readonly stateMutability: 'view';
    readonly type: 'function';
  },
  {
    readonly constant: true;
    readonly inputs: readonly [
      {
        readonly internalType: 'bytes32';
        readonly name: 'node';
        readonly type: 'bytes32';
      },
    ];
    readonly name: 'resolver';
    readonly outputs: readonly [
      {
        readonly internalType: 'address';
        readonly name: '';
        readonly type: 'address';
      },
    ];
    readonly payable: false;
    readonly stateMutability: 'view';
    readonly type: 'function';
  },
  {
    readonly constant: false;
    readonly inputs: readonly [
      {
        readonly internalType: 'address';
        readonly name: 'operator';
        readonly type: 'address';
      },
      {
        readonly internalType: 'bool';
        readonly name: 'approved';
        readonly type: 'bool';
      },
    ];
    readonly name: 'setApprovalForAll';
    readonly outputs: readonly [];
    readonly payable: false;
    readonly stateMutability: 'nonpayable';
    readonly type: 'function';
  },
  {
    readonly constant: false;
    readonly inputs: readonly [
      {
        readonly internalType: 'bytes32';
        readonly name: 'node';
        readonly type: 'bytes32';
      },
      {
        readonly internalType: 'address';
        readonly name: 'owner';
        readonly type: 'address';
      },
    ];
    readonly name: 'setOwner';
    readonly outputs: readonly [];
    readonly payable: false;
    readonly stateMutability: 'nonpayable';
    readonly type: 'function';
  },
  {
    readonly constant: false;
    readonly inputs: readonly [
      {
        readonly internalType: 'bytes32';
        readonly name: 'node';
        readonly type: 'bytes32';
      },
      {
        readonly internalType: 'address';
        readonly name: 'owner';
        readonly type: 'address';
      },
      {
        readonly internalType: 'address';
        readonly name: 'resolver';
        readonly type: 'address';
      },
      {
        readonly internalType: 'uint64';
        readonly name: 'ttl';
        readonly type: 'uint64';
      },
    ];
    readonly name: 'setRecord';
    readonly outputs: readonly [];
    readonly payable: false;
    readonly stateMutability: 'nonpayable';
    readonly type: 'function';
  },
  {
    readonly constant: false;
    readonly inputs: readonly [
      {
        readonly internalType: 'bytes32';
        readonly name: 'node';
        readonly type: 'bytes32';
      },
      {
        readonly internalType: 'address';
        readonly name: 'resolver';
        readonly type: 'address';
      },
    ];
    readonly name: 'setResolver';
    readonly outputs: readonly [];
    readonly payable: false;
    readonly stateMutability: 'nonpayable';
    readonly type: 'function';
  },
  {
    readonly constant: false;
    readonly inputs: readonly [
      {
        readonly internalType: 'bytes32';
        readonly name: 'node';
        readonly type: 'bytes32';
      },
      {
        readonly internalType: 'bytes32';
        readonly name: 'label';
        readonly type: 'bytes32';
      },
      {
        readonly internalType: 'address';
        readonly name: 'owner';
        readonly type: 'address';
      },
    ];
    readonly name: 'setSubnodeOwner';
    readonly outputs: readonly [
      {
        readonly internalType: 'bytes32';
        readonly name: '';
        readonly type: 'bytes32';
      },
    ];
    readonly payable: false;
    readonly stateMutability: 'nonpayable';
    readonly type: 'function';
  },
  {
    readonly constant: false;
    readonly inputs: readonly [
      {
        readonly internalType: 'bytes32';
        readonly name: 'node';
        readonly type: 'bytes32';
      },
      {
        readonly internalType: 'bytes32';
        readonly name: 'label';
        readonly type: 'bytes32';
      },
      {
        readonly internalType: 'address';
        readonly name: 'owner';
        readonly type: 'address';
      },
      {
        readonly internalType: 'address';
        readonly name: 'resolver';
        readonly type: 'address';
      },
      {
        readonly internalType: 'uint64';
        readonly name: 'ttl';
        readonly type: 'uint64';
      },
    ];
    readonly name: 'setSubnodeRecord';
    readonly outputs: readonly [];
    readonly payable: false;
    readonly stateMutability: 'nonpayable';
    readonly type: 'function';
  },
  {
    readonly constant: false;
    readonly inputs: readonly [
      {
        readonly internalType: 'bytes32';
        readonly name: 'node';
        readonly type: 'bytes32';
      },
      {
        readonly internalType: 'uint64';
        readonly name: 'ttl';
        readonly type: 'uint64';
      },
    ];
    readonly name: 'setTTL';
    readonly outputs: readonly [];
    readonly payable: false;
    readonly stateMutability: 'nonpayable';
    readonly type: 'function';
  },
  {
    readonly constant: true;
    readonly inputs: readonly [
      {
        readonly internalType: 'bytes32';
        readonly name: 'node';
        readonly type: 'bytes32';
      },
    ];
    readonly name: 'ttl';
    readonly outputs: readonly [
      {
        readonly internalType: 'uint64';
        readonly name: '';
        readonly type: 'uint64';
      },
    ];
    readonly payable: false;
    readonly stateMutability: 'view';
    readonly type: 'function';
  },
];
