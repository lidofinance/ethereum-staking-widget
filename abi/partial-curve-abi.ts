export declare const PartialCurveAbi: readonly [
  {
    readonly constant: true;
    readonly inputs: readonly [
      {
        readonly name: 'i';
        readonly type: 'int128';
      },
      {
        readonly name: 'j';
        readonly type: 'int128';
      },
      {
        readonly name: 'dx';
        readonly type: 'uint256';
      },
    ];
    readonly name: 'get_dy';
    readonly outputs: readonly [
      {
        readonly name: '';
        readonly type: 'uint256';
      },
    ];
    readonly payable: false;
    readonly stateMutability: 'view';
    readonly type: 'function';
  },
];
