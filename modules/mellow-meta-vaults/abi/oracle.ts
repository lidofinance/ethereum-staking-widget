// The slice of the Mellow Oracle the widget reads: the report the sync redeem
// queue prices a redemption with. The queue rejects a suspicious or zero
// report (InvalidReport) and one older than its maxAge (StaleReport)
export const ORACLE_ABI = [
  {
    inputs: [{ internalType: 'address', name: 'asset', type: 'address' }],
    name: 'getReport',
    outputs: [
      {
        components: [
          { internalType: 'uint224', name: 'priceD18', type: 'uint224' },
          { internalType: 'uint32', name: 'timestamp', type: 'uint32' },
          { internalType: 'bool', name: 'isSuspicious', type: 'bool' },
        ],
        internalType: 'struct IOracle.DetailedReport',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;
