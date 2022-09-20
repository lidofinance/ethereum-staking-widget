import { CONFIG } from './config';

export interface GetRequest {
  uri: string;
  schema: object;
}

export interface PostRequest {
  uri: string;
  body: object;
  schema: object;
}

export const GET_REQUESTS: GetRequest[] = [
  {
    uri: '/api/oneinch-rate',
    schema: {
      type: 'object',
      properties: {
        rate: { type: 'number' },
      },
      required: ['rate'],
      additionalProperties: false,
    },
  },
  {
    uri: '/api/steth-apr',
    schema: { type: 'string' },
  },
  {
    uri: `/api/short-lido-stats?chainId=${CONFIG.STAND_CONFIG.chainId}`,
    schema: {
      type: 'object',
      properties: {
        uniqueAnytimeHolders: { type: 'string' },
        uniqueHolders: { type: 'string' },
        totalStaked: { type: 'string' },
        marketCap: { type: 'number' },
      },
      required: [
        'uniqueAnytimeHolders',
        'uniqueHolders',
        'totalStaked',
        'marketCap',
      ],
      additionalProperties: false,
    },
  },
  {
    uri: '/api/eth-apr',
    schema: { type: 'string' },
  },
];

export const POST_REQUESTS: PostRequest[] = [
  {
    uri: `/api/rpc?chainId=${CONFIG.STAND_CONFIG.chainId}`,
    body: { method: 'eth_blockNumber', params: [], id: 154, jsonrpc: '2.0' },
    schema: {
      type: 'object',
      properties: {
        jsonrpc: { type: 'string' },
        id: { type: 'number' },
        result: { type: 'string' },
      },
      required: ['jsonrpc', 'id', 'result'],
      additionalProperties: false,
    },
  },
];
