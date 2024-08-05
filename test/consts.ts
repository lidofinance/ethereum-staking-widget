import { CONFIG } from './config.js';

export interface GetRequest {
  uri: string;
  schema: object;
  isDeprecated?: boolean;
  skipTestnet?: boolean;
}

export interface PostRequest {
  uri: string;
  body: object;
  schema: object;
}

const LIDO_STATS_SCHEMA = {
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
            tsAdded: {
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
};

export const GET_REQUESTS: GetRequest[] = [
  {
    uri: '/api/lidostats',
    isDeprecated: true,
    schema: LIDO_STATS_SCHEMA,
  },
  {
    uri: '/api/ldo-stats',
    isDeprecated: true,
    schema: LIDO_STATS_SCHEMA,
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
  {
    uri: `api/csp-report`,
    body: {
      'csp-report': {
        'blocked-uri': 'http://example.com/css/style.css',
        disposition: 'report',
        'document-uri': 'http://example.com/signup.html',
        'effective-directive': 'style-src-elem',
        'original-policy':
          "default-src 'none'; style-src cdn.example.com; report-to /_/csp-reports",
        referrer: '',
        'status-code': 200,
        'violated-directive': 'style-src-elem',
      },
    },
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          const: 'ok',
        },
      },
    },
  },
];
