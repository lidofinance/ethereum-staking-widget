export declare const ENSResolverAbi: readonly [
  {
    readonly inputs: readonly [
      {
        readonly internalType: 'contract ENS';
        readonly name: '_ens';
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
        readonly internalType: 'bytes32';
        readonly name: 'node';
        readonly type: 'bytes32';
      },
      {
        readonly indexed: true;
        readonly internalType: 'uint256';
        readonly name: 'contentType';
        readonly type: 'uint256';
      },
    ];
    readonly name: 'ABIChanged';
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
        readonly name: 'a';
        readonly type: 'address';
      },
    ];
    readonly name: 'AddrChanged';
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
        readonly internalType: 'uint256';
        readonly name: 'coinType';
        readonly type: 'uint256';
      },
      {
        readonly indexed: false;
        readonly internalType: 'bytes';
        readonly name: 'newAddress';
        readonly type: 'bytes';
      },
    ];
    readonly name: 'AddressChanged';
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
        readonly internalType: 'address';
        readonly name: 'owner';
        readonly type: 'address';
      },
      {
        readonly indexed: true;
        readonly internalType: 'address';
        readonly name: 'target';
        readonly type: 'address';
      },
      {
        readonly indexed: false;
        readonly internalType: 'bool';
        readonly name: 'isAuthorised';
        readonly type: 'bool';
      },
    ];
    readonly name: 'AuthorisationChanged';
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
        readonly internalType: 'bytes';
        readonly name: 'hash';
        readonly type: 'bytes';
      },
    ];
    readonly name: 'ContenthashChanged';
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
        readonly internalType: 'bytes';
        readonly name: 'name';
        readonly type: 'bytes';
      },
      {
        readonly indexed: false;
        readonly internalType: 'uint16';
        readonly name: 'resource';
        readonly type: 'uint16';
      },
      {
        readonly indexed: false;
        readonly internalType: 'bytes';
        readonly name: 'record';
        readonly type: 'bytes';
      },
    ];
    readonly name: 'DNSRecordChanged';
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
        readonly internalType: 'bytes';
        readonly name: 'name';
        readonly type: 'bytes';
      },
      {
        readonly indexed: false;
        readonly internalType: 'uint16';
        readonly name: 'resource';
        readonly type: 'uint16';
      },
    ];
    readonly name: 'DNSRecordDeleted';
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
    ];
    readonly name: 'DNSZoneCleared';
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
        readonly internalType: 'bytes4';
        readonly name: 'interfaceID';
        readonly type: 'bytes4';
      },
      {
        readonly indexed: false;
        readonly internalType: 'address';
        readonly name: 'implementer';
        readonly type: 'address';
      },
    ];
    readonly name: 'InterfaceChanged';
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
        readonly internalType: 'string';
        readonly name: 'name';
        readonly type: 'string';
      },
    ];
    readonly name: 'NameChanged';
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
        readonly internalType: 'bytes32';
        readonly name: 'x';
        readonly type: 'bytes32';
      },
      {
        readonly indexed: false;
        readonly internalType: 'bytes32';
        readonly name: 'y';
        readonly type: 'bytes32';
      },
    ];
    readonly name: 'PubkeyChanged';
    readonly type: 'event';
  },
  {
    readonly constant: true;
    readonly inputs: readonly [
      {
        readonly internalType: 'bytes32';
        readonly name: 'node';
        readonly type: 'bytes32';
      },
      {
        readonly internalType: 'string';
        readonly name: 'key';
        readonly type: 'string';
      },
    ];
    readonly name: 'text';
    readonly outputs: readonly [
      {
        readonly internalType: 'string';
        readonly name: '';
        readonly type: 'string';
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
        readonly internalType: 'bytes32';
        readonly name: 'node';
        readonly type: 'bytes32';
      },
      {
        readonly internalType: 'bytes';
        readonly name: 'data';
        readonly type: 'bytes';
      },
    ];
    readonly name: 'setDNSRecords';
    readonly outputs: readonly [];
    readonly payable: false;
    readonly stateMutability: 'nonpayable';
    readonly type: 'function';
  },
  {
    readonly constant: true;
    readonly inputs: readonly [
      {
        readonly internalType: 'bytes4';
        readonly name: 'interfaceID';
        readonly type: 'bytes4';
      },
    ];
    readonly name: 'supportsInterface';
    readonly outputs: readonly [
      {
        readonly internalType: 'bool';
        readonly name: '';
        readonly type: 'bool';
      },
    ];
    readonly payable: false;
    readonly stateMutability: 'pure';
    readonly type: 'function';
  },
];
