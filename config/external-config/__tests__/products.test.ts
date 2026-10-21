import {
  getHomePath,
  getProductPagesOverride,
  parseProductsUrlState,
} from '../products';

const parse = (search: string) =>
  parseProductsUrlState([...new URLSearchParams(search).entries()]);

const enabledProducts = (search: string) => {
  const { products } = parse(search);
  return Object.entries(products)
    .filter(([, state]) => state.enabled)
    .map(([product]) => product);
};

const disabled = { shouldDisable: true, showNew: false, sections: [] };

describe('parseProductsUrlState', () => {
  it('enables every product without params', () => {
    expect(enabledProducts('')).toEqual(['stake', 'earn', 'swap']);
    expect(parse('').order).toEqual(['stake', 'earn', 'swap']);
  });

  it('disables a product with `disabled`', () => {
    expect(enabledProducts('?swap=disabled')).toEqual(['stake', 'earn']);
    expect(enabledProducts('?stake=disabled&earn=disabled')).toEqual(['swap']);
  });

  it('keeps a configuration value', () => {
    expect(parse('?earn=eth,usd').products.earn).toEqual({
      enabled: true,
      value: 'eth,usd',
    });
  });

  it('enables only listed products with `product`', () => {
    expect(enabledProducts('?product=earn&product=stake')).toEqual([
      'stake',
      'earn',
    ]);
    expect(enabledProducts('?product=swap,earn')).toEqual(['earn', 'swap']);
  });

  it('orders products by `product` params', () => {
    expect(parse('?product=swap&product=earn').order).toEqual(['swap', 'earn']);
  });

  it('ignores unknown products and an empty allowlist', () => {
    expect(enabledProducts('?product=foo')).toEqual(['stake', 'earn', 'swap']);
    expect(enabledProducts('?product=foo&product=earn')).toEqual(['earn']);
    expect(enabledProducts('?foo=disabled')).toEqual(['stake', 'earn', 'swap']);
  });

  it('lets the first param win on a conflict', () => {
    expect(enabledProducts('?earn=disabled&product=earn')).toEqual(['stake']);
    expect(enabledProducts('?product=earn&earn=disabled')).toEqual(['earn']);
    expect(enabledProducts('?swap=enabled&product=earn')).toEqual([
      'earn',
      'swap',
    ]);
    expect(enabledProducts('?swap=disabled&swap=enabled')).toEqual([
      'stake',
      'earn',
    ]);
  });

  it('adds a configuration to a product enabled by `product`', () => {
    expect(parse('?product=earn&earn=eth').products.earn).toEqual({
      enabled: true,
      value: 'eth',
    });
  });

  it('keeps stake when every product is disabled', () => {
    expect(
      enabledProducts('?stake=disabled&earn=disabled&swap=disabled'),
    ).toEqual(['stake']);
  });
});

describe('getProductPagesOverride', () => {
  it('disables every stake page with stake', () => {
    const override = getProductPagesOverride(
      parse('?stake=disabled'),
      {},
      false,
    );
    expect(Object.keys(override)).toEqual([
      '/',
      '/wrap',
      '/withdrawals',
      '/rewards',
    ]);
  });

  it('disables earn and swap pages', () => {
    const override = getProductPagesOverride(parse('?product=stake'), {}, true);
    expect(Object.keys(override)).toEqual(['/earn', '/swap']);
  });

  it('keeps stake when the config disables every other product', () => {
    const override = getProductPagesOverride(
      parse('?product=swap'),
      { '/swap': disabled },
      false,
    );
    expect(override['/']).toBeUndefined();
    expect(override['/earn']?.shouldDisable).toBe(true);
  });

  it('keeps stake when Ledger Live disables earn and swap is off', () => {
    const override = getProductPagesOverride(parse('?product=earn'), {}, true);
    expect(override['/']).toBeUndefined();
  });
});

describe('getHomePath', () => {
  it('is `/` while stake is enabled', () => {
    expect(getHomePath(parse(''), {})).toBe('/');
  });

  it('is the first enabled product without stake', () => {
    expect(getHomePath(parse('?stake=disabled'), { '/': disabled })).toBe(
      '/earn',
    );
    expect(
      getHomePath(parse('?product=swap&product=earn'), { '/': disabled }),
    ).toBe('/swap');
  });

  it('skips a product disabled by config', () => {
    expect(
      getHomePath(parse('?stake=disabled'), {
        '/': disabled,
        '/earn': disabled,
      }),
    ).toBe('/swap');
  });
});
