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
        'totalStaked',
        'marketCap',
        'uniqueAnytimeHolders',
        'uniqueHolders',
      ],
      additionalProperties: false,
    },
  },
  {
    uri: '/api/eth-apr',
    schema: { type: 'string' },
  },
  {
    uri: '/api/totalsupply',
    schema: { type: 'string' },
  },
  {
    uri: '/api/lidostats',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            address: {
              type: 'string',
            },
            decimals: {
              type: 'string',
            },
            name: {
              type: 'string',
            },
            symbol: {
              type: 'string',
            },
            totalSupply: {
              type: 'string',
            },
            transfersCount: {
              type: 'integer',
            },
            txsCount: {
              type: 'integer',
            },
            lastUpdated: {
              type: 'integer',
            },
            issuancesCount: {
              type: 'integer',
            },
            holdersCount: {
              type: 'integer',
            },
            website: {
              type: 'string',
            },
            image: {
              type: 'string',
            },
            ethTransfersCount: {
              type: 'integer',
            },
            price: {
              type: 'object',
              properties: {
                rate: {
                  type: 'number',
                },
                diff: {
                  type: 'number',
                },
                diff7d: {
                  type: 'number',
                },
                ts: {
                  type: 'integer',
                },
                marketCapUsd: {
                  type: 'number',
                },
                availableSupply: {
                  type: 'integer',
                },
                volume24h: {
                  type: 'number',
                },
                volDiff1: {
                  type: 'number',
                },
                volDiff7: {
                  type: 'number',
                },
                volDiff30: {
                  type: 'number',
                },
                diff30d: {
                  type: 'number',
                },
                bid: {
                  type: 'number',
                },
                currency: {
                  type: 'string',
                },
              },
              required: [
                'rate',
                'diff',
                'diff7d',
                'ts',
                'marketCapUsd',
                'availableSupply',
                'volume24h',
                'volDiff1',
                'volDiff7',
                'volDiff30',
                'diff30d',
                'bid',
                'currency',
              ],
              additionalProperties: false,
            },
            publicTags: {
              type: 'array',
              items: [
                {
                  type: 'string',
                },
                {
                  type: 'string',
                },
              ],
            },
            owner: {
              type: 'string',
            },
            countOps: {
              type: 'integer',
            },
          },
          required: [
            'address',
            'decimals',
            'name',
            'symbol',
            'totalSupply',
            'transfersCount',
            'txsCount',
            'lastUpdated',
            'issuancesCount',
            'holdersCount',
            'website',
            'image',
            'price',
            'publicTags',
            'owner',
            'countOps',
          ],
          additionalProperties: false,
        },
      },
      required: ['data'],
      additionalProperties: false,
    },
  },
  {
    uri: '/api/ldo-stats',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            address: {
              type: 'string',
            },
            decimals: {
              type: 'string',
            },
            name: {
              type: 'string',
            },
            symbol: {
              type: 'string',
            },
            totalSupply: {
              type: 'string',
            },
            transfersCount: {
              type: 'integer',
            },
            txsCount: {
              type: 'integer',
            },
            lastUpdated: {
              type: 'integer',
            },
            issuancesCount: {
              type: 'integer',
            },
            holdersCount: {
              type: 'integer',
            },
            website: {
              type: 'string',
            },
            image: {
              type: 'string',
            },
            ethTransfersCount: {
              type: 'integer',
            },
            price: {
              type: 'object',
              properties: {
                rate: {
                  type: 'number',
                },
                diff: {
                  type: 'number',
                },
                diff7d: {
                  type: 'number',
                },
                ts: {
                  type: 'integer',
                },
                marketCapUsd: {
                  type: 'number',
                },
                availableSupply: {
                  type: 'number',
                },
                volume24h: {
                  type: 'number',
                },
                volDiff1: {
                  type: 'number',
                },
                volDiff7: {
                  type: 'number',
                },
                volDiff30: {
                  type: 'number',
                },
                diff30d: {
                  type: 'number',
                },
                bid: {
                  type: 'number',
                },
                currency: {
                  type: 'string',
                },
              },
              required: [
                'rate',
                'diff',
                'diff7d',
                'ts',
                'marketCapUsd',
                'availableSupply',
                'volume24h',
                'volDiff1',
                'volDiff7',
                'volDiff30',
                'diff30d',
                'bid',
                'currency',
              ],
              additionalProperties: false,
            },
            publicTags: {
              type: 'array',
              items: [
                {
                  type: 'string',
                },
              ],
            },
            owner: {
              type: 'string',
            },
            countOps: {
              type: 'integer',
            },
          },
          required: [
            'address',
            'decimals',
            'name',
            'symbol',
            'totalSupply',
            'transfersCount',
            'txsCount',
            'lastUpdated',
            'issuancesCount',
            'holdersCount',
            'website',
            'image',
            'price',
            'publicTags',
            'owner',
            'countOps',
          ],
          additionalProperties: false,
        },
      },
      required: ['data'],
      additionalProperties: false,
    },
  },
  {
    uri: '/api/apr',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            eth: {
              type: 'string',
            },
            steth: {
              type: 'string',
            },
          },
          required: ['eth', 'steth'],
          additionalProperties: false,
        },
      },
      required: ['data'],
      additionalProperties: false,
    },
  },
  {
    uri: '/api/eth-price',
    schema: {
      type: 'object',
      properties: {
        price: {
          type: 'number',
        },
      },
      required: ['price'],
      additionalProperties: false,
    },
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
