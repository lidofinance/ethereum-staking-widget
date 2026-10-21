import {
  EARN_PATH,
  HOME_PATH,
  REWARDS_PATH,
  SWAP_PATH,
  WITHDRAWALS_PATH,
  WRAP_PATH,
} from 'consts/urls';

import { isDisabledPath } from './utils';
import type { ManifestConfig, ManifestConfigPage } from './types';

export const PRODUCTS = ['stake', 'earn', 'swap'] as const;
export type Product = (typeof PRODUCTS)[number];

// URL params that control products, kept on internal links
export const PRODUCT_QUERY_KEYS = ['product', ...PRODUCTS] as const;

const PRODUCT_DISABLED = 'disabled';

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
  (PRODUCTS as readonly string[]).includes(value);

const splitProducts = (value: string): Product[] =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter(isProduct);

/**
 * Products state from URL params, in URL order.
 *
 * - `?swap=disabled` disables a product, `?earn=eth` enables it with a configuration.
 * - `?product=earn&product=stake` enables only the listed products.
 * - On a conflict the param that comes first wins.
 * - Products not mentioned stay enabled; if all are disabled, stake stays enabled.
 */
export const parseProductsUrlState = (
  entries: readonly (readonly [string, string])[],
): ProductsUrlState => {
  const decided: Partial<Record<Product, ProductUrlState>> = {};

  // `product` params act together, at the position of the first one
  const allowlist = entries
    .filter(([key]) => key === 'product')
    .flatMap(([, value]) => splitProducts(value));
  const hasAllowlist = allowlist.length > 0;
  let isAllowlistApplied = false;

  for (const [key, value] of entries) {
    if (key === 'product') {
      if (!hasAllowlist || isAllowlistApplied) continue;
      isAllowlistApplied = true;
      for (const product of PRODUCTS) {
        decided[product] ??= { enabled: allowlist.includes(product) };
      }
      continue;
    }

    if (!isProduct(key)) continue;

    const enabled = value !== PRODUCT_DISABLED;
    const current = decided[key];
    if (!current) {
      decided[key] = { enabled, value: enabled ? value : undefined };
    } else if (current.enabled && enabled && current.value === undefined) {
      // not a conflict: adds a configuration to an enabled product
      current.value = value;
    }
  }

  const products = Object.fromEntries(
    PRODUCTS.map((product) => [product, decided[product] ?? { enabled: true }]),
  ) as Record<Product, ProductUrlState>;

  if (PRODUCTS.every((product) => !products[product].enabled)) {
    products.stake = { enabled: true };
  }

  const order = [...new Set<Product>([...allowlist, ...PRODUCTS])].filter(
    (product) => products[product].enabled,
  );

  return { products, order };
};

/**
 * Pages to disable for products disabled by URL; `isEarnDisabled` adds Ledger Live.
 * Stake stays available when every other product is disabled, so the app is never empty.
 */
export const getProductPagesOverride = (
  { products }: ProductsUrlState,
  pages: ManifestConfig['pages'],
  isEarnDisabled: boolean,
): ManifestConfig['pages'] => {
  const isDisabled: Record<Product, boolean> = {
    stake: !products.stake.enabled,
    earn:
      !products.earn.enabled ||
      isEarnDisabled ||
      isDisabledPath(EARN_PATH, pages),
    swap: !products.swap.enabled || isDisabledPath(SWAP_PATH, pages),
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
