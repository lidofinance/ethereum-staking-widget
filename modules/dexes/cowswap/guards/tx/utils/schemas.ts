import { isAddress, isHex, type Address, type Hex } from 'viem';
import { z } from 'zod';

import { MAX_SLIPPAGE, PARTNER_FEE_BPS } from '../../../consts';

export const jsonRpcRequestSchema = z.object({
  method: z.string(),
  params: z.array(z.unknown()).optional(),
  id: z.number().optional(),
});

export const addressSchema = z
  .string()
  .refine((address) => isAddress(address, { strict: false }), {
    message: 'Invalid Ethereum address',
  })
  .transform((address) => address.toLowerCase() as Address);

export const bigintStringSchema = z
  .string()
  .refine(
    (str) => {
      try {
        const result = BigInt(str);
        return result >= 0n;
      } catch {
        return false;
      }
    },
    { message: 'Invalid bigint string' },
  )
  .transform((str) => BigInt(str)) as z.ZodType<bigint>;

export const hexSchema = z.string().refine((hash) => isHex(hash), {
  message: 'Invalid hex string',
}) as z.ZodType<Hex>;

export const jsonStringSchema = <T extends z.ZodTypeAny>(schema: T) =>
  z
    .string()
    .transform((str, ctx) => {
      try {
        return JSON.parse(str);
      } catch {
        ctx.addIssue({ code: 'custom', message: 'Invalid JSON' });
        return z.NEVER;
      }
    })
    .pipe(schema);

export const CowSwapGPv2OrderSchema = z.object({
  sellToken: addressSchema,
  buyToken: addressSchema,
  sellAmount: bigintStringSchema,
  buyAmount: bigintStringSchema,
  validTo: z.uint32(),
  kind: z.literal('sell'),
  partiallyFillable: z.literal(false),
  appData: hexSchema,
  receiver: addressSchema,
  feeAmount: bigintStringSchema,
  sellTokenBalance: z.literal('erc20'),
  buyTokenBalance: z.literal('erc20'),
});

export const AppDataHooksSchema = z.object({
  callData: hexSchema,
  dappId: z.string(),
  gasLimit: bigintStringSchema,
  target: addressSchema,
});

export const AppDataSchema = z.object({
  // checked against ValidationContext.appCode
  appCode: z.string(),
  metadata: z.object({
    orderClass: z.object({
      orderClass: z.enum(['market']),
    }),
    partnerFee: z.object({
      recipient: addressSchema,
      volumeBps: z.literal(PARTNER_FEE_BPS),
    }),
    quote: z.object({
      slippageBips: z.number().lte(MAX_SLIPPAGE),
      smartSlippage: z.boolean(),
    }),
    widget: z.object({
      appCode: z.string(),
      environment: z.string(),
    }),
    hooks: z
      .object({
        pre: z.array(AppDataHooksSchema).optional(),
        post: z.array(AppDataHooksSchema).optional(),
      })
      .optional(),
  }),
  version: z.string(),
});

const cowSwapOrderDomainSchema = z.object({
  name: z.literal('Gnosis Protocol'),
  version: z.literal('v2'),
  chainId: z.number(),
  verifyingContract: addressSchema,
});

const eip712DomainTypeSchema = z.tuple([
  z.object({ name: z.literal('name'), type: z.literal('string') }),
  z.object({ name: z.literal('version'), type: z.literal('string') }),
  z.object({ name: z.literal('chainId'), type: z.literal('uint256') }),
  z.object({
    name: z.literal('verifyingContract'),
    type: z.literal('address'),
  }),
]);

export const cowSwapCancelOrderSchema = z.object({
  domain: cowSwapOrderDomainSchema,
  message: z.object({
    orderUids: z
      .array(hexSchema)
      .length(1, { message: 'only single order UID is allowed' }),
  }),
  primaryType: z.literal('OrderCancellations'),
  types: z.object({
    EIP712Domain: eip712DomainTypeSchema,
    OrderCancellations: z.tuple([
      z.object({ name: z.literal('orderUids'), type: z.literal('bytes[]') }),
    ]),
  }),
});

export const cowSwapOrderSchema = z.object({
  domain: cowSwapOrderDomainSchema,
  message: CowSwapGPv2OrderSchema,
  primaryType: z.literal('Order'),
  types: z.object({
    EIP712Domain: eip712DomainTypeSchema,
    Order: z.tuple([
      z.object({ name: z.literal('sellToken'), type: z.literal('address') }),
      z.object({ name: z.literal('buyToken'), type: z.literal('address') }),
      z.object({ name: z.literal('receiver'), type: z.literal('address') }),
      z.object({ name: z.literal('sellAmount'), type: z.literal('uint256') }),
      z.object({ name: z.literal('buyAmount'), type: z.literal('uint256') }),
      z.object({ name: z.literal('validTo'), type: z.literal('uint32') }),
      z.object({ name: z.literal('appData'), type: z.literal('bytes32') }),
      z.object({ name: z.literal('feeAmount'), type: z.literal('uint256') }),
      z.object({ name: z.literal('kind'), type: z.literal('string') }),
      z.object({
        name: z.literal('partiallyFillable'),
        type: z.literal('bool'),
      }),
      z.object({
        name: z.literal('sellTokenBalance'),
        type: z.literal('string'),
      }),
      z.object({
        name: z.literal('buyTokenBalance'),
        type: z.literal('string'),
      }),
    ]),
  }),
});

export const cowSwapSignTypedDataSchema = z.union([
  cowSwapOrderSchema,
  cowSwapCancelOrderSchema,
]);

export const sendTransactionParamsSchema = z.tuple([
  z.object({
    to: addressSchema,
    from: addressSchema.optional(),
    data: hexSchema,
    gas: hexSchema.optional(),
    value: hexSchema.optional(),
  }),
]);

export const CowSwapGetOrderResponseSchema = z.object({
  creationDate: z.string(),
  owner: addressSchema,
  uid: hexSchema,
  availableBalance: z.string().nullable(),
  executedBuyAmount: z.string(),
  executedSellAmount: z.string(),
  executedSellAmountBeforeFees: z.string(),
  executedFeeAmount: z.string(),
  executedFee: z.string(),
  executedFeeToken: addressSchema,
  invalidated: z.boolean(),
  status: z.string(),
  class: z.string(),
  settlementContract: addressSchema,
  isLiquidityOrder: z.boolean(),
  fullAppData: jsonStringSchema(AppDataSchema),
  quote: z.object({
    gasAmount: bigintStringSchema,
    gasPrice: bigintStringSchema,
    sellTokenPrice: z.string(),
    sellAmount: bigintStringSchema,
    buyAmount: bigintStringSchema,
    feeAmount: bigintStringSchema,
    solver: addressSchema,
    verified: z.unknown(),
    metadata: z.unknown(),
  }),
  sellToken: addressSchema,
  buyToken: addressSchema,
  receiver: addressSchema,
  sellAmount: bigintStringSchema,
  buyAmount: bigintStringSchema,
  validTo: z.uint32(),
  appData: hexSchema,
  feeAmount: bigintStringSchema,
  kind: z.literal('sell'),
  partiallyFillable: z.literal(false),
  sellTokenBalance: z.literal('erc20'),
  buyTokenBalance: z.literal('erc20'),
  signingScheme: z.string(),
  signature: z.unknown(),
  interactions: z.object({
    pre: z.array(z.unknown()).length(0),
    post: z.array(z.unknown()).length(0),
  }),
});
