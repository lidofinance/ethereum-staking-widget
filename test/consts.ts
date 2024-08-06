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

const FLOAT_REGEX = /^\d+(\.\d+)?$/;

export const GET_REQUESTS: GetRequest[] = [
  {
    uri: '/api/oneinch-rate?token=ETH',
    isDeprecated: true,
    schema: {
      type: 'object',
      properties: {
        rate: { type: 'number', min: 0 },
        toReceive: { type: 'string' },
        fromAmount: { type: 'string' },
      },
      required: ['rate', 'toReceive', 'fromAmount'],
      additionalProperties: false,
    },
  },
  {
    uri: `/api/short-lido-stats?chainId=${CONFIG.STAND_CONFIG.chainId}`,
    isDeprecated: true,
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
      additionalProperties: true,
    },
  },
  {
    uri: '/api/eth-apr',
    isDeprecated: true,
    schema: { type: 'string', pattern: FLOAT_REGEX },
  },
  {
    uri: '/api/totalsupply',
    isDeprecated: true,
    schema: { type: 'string', pattern: FLOAT_REGEX },
  },
  {
    uri: '/api/eth-price',
    isDeprecated: true,
    schema: {
      type: 'object',
      properties: {
        price: {
          type: 'number',
          min: 0,
        },
      },
      required: ['price'],
      additionalProperties: true,
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
    isDeprecated: true,
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
