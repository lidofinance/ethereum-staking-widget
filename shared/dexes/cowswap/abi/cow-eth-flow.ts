// CoWSwapEthFlow (cowprotocol/ethflowcontract), only calls the widget sends
const ETH_FLOW_ORDER_COMPONENTS = [
  { name: 'buyToken', type: 'address' },
  { name: 'receiver', type: 'address' },
  { name: 'sellAmount', type: 'uint256' },
  { name: 'buyAmount', type: 'uint256' },
  { name: 'appData', type: 'bytes32' },
  { name: 'feeAmount', type: 'uint256' },
  { name: 'validTo', type: 'uint32' },
  { name: 'partiallyFillable', type: 'bool' },
  { name: 'quoteId', type: 'int64' },
] as const;

export const CowEthFlowAbi = [
  {
    type: 'function',
    name: 'createOrder',
    stateMutability: 'payable',
    inputs: [
      { name: 'order', type: 'tuple', components: ETH_FLOW_ORDER_COMPONENTS },
    ],
    outputs: [{ name: 'orderHash', type: 'bytes32' }],
  },
  {
    type: 'function',
    name: 'invalidateOrder',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'order', type: 'tuple', components: ETH_FLOW_ORDER_COMPONENTS },
    ],
    outputs: [],
  },
] as const;
