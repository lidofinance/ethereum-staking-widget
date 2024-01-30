import { CONFIG } from './config.js';

export interface GetRequest {
  uri: string;
  schema: object;
  skipTestnet?: boolean;
}

export interface PostRequest {
  uri: string;
  body: object;
  schema: object;
}

const FLOAT_REGEX = /^\d+(\.\d+)?$/;

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
  // TODO: enabled when bringing back 1inch endpoint
  // {
  //   uri: '/api/oneinch-rate',
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       rate: { type: 'number', min: 0 },
  //     },
  //     required: ['rate'],
  //     additionalProperties: false,
  //   },
  // },
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
    schema: { type: 'string', pattern: FLOAT_REGEX },
  },
  {
    uri: '/api/totalsupply',
    schema: { type: 'string', pattern: FLOAT_REGEX },
  },
  {
    uri: '/api/lidostats',
    schema: LIDO_STATS_SCHEMA,
  },
  {
    uri: '/api/ldo-stats',
    schema: LIDO_STATS_SCHEMA,
  },
  {
    uri: '/api/eth-price',
    schema: {
      type: 'object',
      properties: {
        price: {
          type: 'number',
          min: 0,
        },
      },
      required: ['price'],
      additionalProperties: false,
    },
  },
  {
    uri: '/api/rewards?address=0x87c0e047F4e4D3e289A56a36570D4CB957A37Ef1&currency=usd&onlyRewards=false&archiveRate=true&skip=0&limit=10',
    skipTestnet: true, // api/rewards don't work on testnet
    schema: {
      type: 'object',
      properties: {
        averageApr: { type: 'string' },
        ethToStEthRatio: { type: 'number' },
        events: {
          type: 'array',
          items: [
            {
              type: 'object',
              additionalProperties: true,
            },
          ],
        },
        stETHCurrencyPrice: {
          type: 'object',
          properties: {
            eth: { type: 'number' },
            usd: { type: 'number' },
          },
          required: ['eth', 'usd'],
          additionalProperties: false,
        },
        totalItems: { type: 'number' },
        totals: {
          type: 'object',
          properties: {
            currencyRewards: { type: 'string' },
            ethRewards: { type: 'string' },
          },
        },
        required: [
          'averageApr',
          'ethToStEthRatio',
          'events',
          'stETHCurrencyPrice',
          'totalItems',
          'totals',
        ],
        additionalProperties: false,
      },
    },
  },
  {
    uri: '/api/sma-steth-apr',
    schema: {
      type: 'string',
      pattern: FLOAT_REGEX,
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
