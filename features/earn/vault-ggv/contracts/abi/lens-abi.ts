export const GGV_LENS_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'account', type: 'address' },
      {
        internalType: 'contract BoringVault',
        name: 'boringVault',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: 'shares', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'account', type: 'address' },
      {
        internalType: 'contract BoringVault',
        name: 'boringVault',
        type: 'address',
      },
      {
        internalType: 'contract AccountantWithRateProviders',
        name: 'accountant',
        type: 'address',
      },
    ],
    name: 'balanceOfInAssets',
    outputs: [{ internalType: 'uint256', name: 'assets', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'account', type: 'address' },
      { internalType: 'contract ERC20', name: 'depositAsset', type: 'address' },
      { internalType: 'uint256', name: 'depositAmount', type: 'uint256' },
      {
        internalType: 'contract BoringVault',
        name: 'boringVault',
        type: 'address',
      },
      {
        internalType: 'contract TellerWithMultiAssetSupport',
        name: 'teller',
        type: 'address',
      },
    ],
    name: 'checkUserDeposit',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'account', type: 'address' },
      { internalType: 'contract ERC20', name: 'depositAsset', type: 'address' },
      { internalType: 'uint256', name: 'depositAmount', type: 'uint256' },
      {
        internalType: 'contract TellerWithMultiAssetSupport',
        name: 'teller',
        type: 'address',
      },
    ],
    name: 'checkUserDepositWithPermit',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract AccountantWithRateProviders',
        name: 'accountant',
        type: 'address',
      },
    ],
    name: 'exchangeRate',
    outputs: [{ internalType: 'uint256', name: 'rate', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract TellerWithMultiAssetSupport',
        name: 'teller',
        type: 'address',
      },
    ],
    name: 'isTellerPaused',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'contract ERC20', name: 'depositAsset', type: 'address' },
      { internalType: 'uint256', name: 'depositAmount', type: 'uint256' },
      {
        internalType: 'contract BoringVault',
        name: 'boringVault',
        type: 'address',
      },
      {
        internalType: 'contract AccountantWithRateProviders',
        name: 'accountant',
        type: 'address',
      },
    ],
    name: 'previewDeposit',
    outputs: [{ internalType: 'uint256', name: 'shares', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'contract BoringVault',
        name: 'boringVault',
        type: 'address',
      },
      {
        internalType: 'contract AccountantWithRateProviders',
        name: 'accountant',
        type: 'address',
      },
    ],
    name: 'totalAssets',
    outputs: [
      { internalType: 'contract ERC20', name: 'asset', type: 'address' },
      { internalType: 'uint256', name: 'assets', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'account', type: 'address' },
      {
        internalType: 'contract TellerWithMultiAssetSupport',
        name: 'teller',
        type: 'address',
      },
    ],
    name: 'userUnlockTime',
    outputs: [{ internalType: 'uint256', name: 'time', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;
