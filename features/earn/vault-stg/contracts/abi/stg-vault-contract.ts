export const STG_VAULT_ABI = [
  {
    inputs: [],
    name: 'ORACLE_HELPER',
    outputs: [
      { internalType: 'contract OracleHelper', name: '', type: 'address' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'WETH',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
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
    inputs: [
      { internalType: 'contract Vault', name: 'vault', type: 'address' },
    ],
    name: 'push',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;
