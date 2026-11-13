// Minimal Solmate Authority ABI. Teller uses it to check who can call a function.
export const GGV_AUTHORITY_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'user', type: 'address' },
      { internalType: 'address', name: 'target', type: 'address' },
      { internalType: 'bytes4', name: 'functionSig', type: 'bytes4' },
    ],
    name: 'canCall',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;
