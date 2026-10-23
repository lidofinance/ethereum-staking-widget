import type { ParsedUrlQuery } from 'querystring';

import {
  EARN_PATH,
  HOME_PATH,
  REWARDS_PATH,
  SWAP_PATH,
  WITHDRAWALS_PATH,
  WRAP_PATH,
} from 'consts/urls';

import { isDisabledPath } from './disabled-path';
import type { ManifestConfig, ManifestConfigPage } from './types';

export const PRODUCTS = ['stake', 'earn', 'swap'] as const;
export type Product = (typeof PRODUCTS)[number];

const PRODUCT_PARAM = 'product';
const PRODUCT_DISABLED = 'disabled';

// URL params that control products, kept on internal links
export const PRODUCT_QUERY_KEYS = [PRODUCT_PARAM, ...PRODUCTS] as const;
type ProductQueryKey = (typeof PRODUCT_QUERY_KEYS)[number];

// entry page of a product
export const PRODUCT_PATHS: Record<Product, string> = {
  stake: HOME_PATH,
  earn: EARN_PATH,
  swap: SWAP_PATH,
};

// pages hidden together with a product
const PRODUCT_PAGES: Record<Product, ManifestConfigPage[]> = {
  stake: [HOME_PATH, WRAP_PATH, WITHDRAWALS_PATH, REWARDS_PATH],
  earn: [EARN_PATH],
  swap: [SWAP_PATH],
};

export type ProductUrlState = {
  enabled: boolean;
  // product configuration, e.g. vault list in `earn=eth,usd`
  value?: string;
};

export type ProductsUrlState = {
  products: Record<Product, ProductUrlState>;
  // products in preference order: `product` params first, then the default order
  order: Product[];
};

const isProduct = (value: string): value is Product =>
  PRODUCTS.some((product) => product === value);

export const isProductQueryKey = (key: string): key is ProductQueryKey =>
  PRODUCT_QUERY_KEYS.some((queryKey) => queryKey === key);

const splitProducts = (value: string): Product[] =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(isProduct);

// products listed in `product` params, in URL order
const getAllowlist = (
  entries: readonly (readonly [string, string])[],
): Product[] =>
  entries
    .filter(([key]) => key === PRODUCT_PARAM)
    .flatMap(([, value]) => splitProducts(value));

/**
 * Products state from URL params.
 *
 * - `?product=earn&product=stake` enables only the listed products and wins over the other params.
 * - Without `product`, `?swap=disabled` disables a product, `?earn=eth` enables it with a configuration.
 * - A configuration (`earn=eth`) applies only to an enabled product.
 * - Repeated params of one product: the first one wins.
 * - Products not mentioned stay enabled; if all are disabled, stake stays enabled.
 */
export const parseProductsUrlState = (
  entries: readonly (readonly [string, string])[],
): ProductsUrlState => {
  const allowlist = getAllowlist(entries);
  const hasAllowlist = allowlist.length > 0;
  const isAllowed = (product: Product) =>
    !hasAllowlist || allowlist.includes(product);

  const products: Record<Product, ProductUrlState> = {
    stake: { enabled: isAllowed('stake') },
    earn: { enabled: isAllowed('earn') },
    swap: { enabled: isAllowed('swap') },
  };

  const seen = new Set<Product>();
  for (const [key, value] of entries) {
    if (!isProduct(key)) continue;
    const isDisabledValue = value === PRODUCT_DISABLED;

    if (hasAllowlist) {
      // `product` decides what is enabled, a product param only configures it
      if (products[key].enabled && !isDisabledValue)
        products[key].value ??= value;
      continue;
    }

    if (seen.has(key)) continue;
    seen.add(key);
    products[key] = isDisabledValue
      ? { enabled: false }
      : { enabled: true, value };
  }

  if (PRODUCTS.every((product) => !products[product].enabled)) {
    products.stake = { enabled: true };
  }

  const order = [...new Set<Product>([...allowlist, ...PRODUCTS])].filter(
    (product) => products[product].enabled,
  );

  return { products, order };
};

export type ProductQuery = Record<string, string>;

/**
 * Product params as a query object that parses to the same state:
 * keys keep the position of their first param, repeated `product` values are joined,
 * other repeated keys keep the first value, since the first param wins.
 */
export const toProductQuery = (
  entries: readonly (readonly [string, string])[],
): ProductQuery => {
  const query: ProductQuery = {};
  for (const [key, value] of entries) {
    if (!isProductQueryKey(key)) continue;
    if (key === PRODUCT_PARAM && query[PRODUCT_PARAM] !== undefined) {
      query[PRODUCT_PARAM] = `${query[PRODUCT_PARAM]},${value}`;
    } else {
      query[key] ??= value;
    }
  }
  return query;
};

// replaces product params of a query with the given ones
export const withProductQuery = (
  query: ParsedUrlQuery,
  productQuery: ProductQuery,
): ParsedUrlQuery => {
  const rest = Object.fromEntries(
    Object.entries(query).filter(([key]) => !isProductQueryKey(key)),
  );
  return { ...rest, ...productQuery };
};

// redirect query: current query without dynamic route params (e.g. [vault]), with product params
export const getRedirectQuery = (
  pathname: string,
  query: ParsedUrlQuery,
  productQuery: ProductQuery,
): ParsedUrlQuery => {
  // Extract dynamic path segment names (e.g. [vault], [action]) to exclude them from query
  const dynamicParams = new Set(
    pathname.match(/\[(\w+)\]/g)?.map((p) => p.slice(1, -1)) ?? [],
  );
  return withProductQuery(
    Object.fromEntries(
      Object.entries(query).filter(([key]) => !dynamicParams.has(key)),
    ),
    productQuery,
  );
};

// products disabled at runtime regardless of URL params, e.g. by Ledger Live
export type RuntimeDisabledProducts = Record<'earn' | 'swap', boolean>;

/**
 * Pages to disable for products disabled by URL or at runtime.
 * Stake stays available when every other product is disabled, so the app is never empty.
 */
export const getProductPagesOverride = (
  { products }: ProductsUrlState,
  pages: ManifestConfig['pages'],
  runtimeDisabled: RuntimeDisabledProducts,
): ManifestConfig['pages'] => {
  const isOptionalDisabled = (product: keyof RuntimeDisabledProducts) =>
    !products[product].enabled ||
    runtimeDisabled[product] ||
    isDisabledPath(PRODUCT_PATHS[product], pages);

  const isDisabled: Record<Product, boolean> = {
    stake: !products.stake.enabled,
    earn: isOptionalDisabled('earn'),
    swap: isOptionalDisabled('swap'),
  };
  if (isDisabled.earn && isDisabled.swap) isDisabled.stake = false;

  const override: ManifestConfig['pages'] = {};
  for (const product of PRODUCTS) {
    if (!isDisabled[product]) continue;
    for (const page of PRODUCT_PAGES[product]) {
      override[page] = {
        showNew: pages[page]?.showNew ?? false,
        sections: pages[page]?.sections ?? [],
        shouldDisable: true,
      };
    }
  }
  return override;
};

// first available product page, used instead of `/` when stake is disabled
export const getHomePath = (
  { order }: ProductsUrlState,
  pages: ManifestConfig['pages'],
): string => {
  const product = order.find(
    (item) => !isDisabledPath(PRODUCT_PATHS[item], pages),
  );
  return product ? PRODUCT_PATHS[product] : HOME_PATH;
};
