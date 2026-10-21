import { test, expect, Page } from '@playwright/test';

type NavItem = 'navStake' | 'navEarn' | 'navSwap';

const nav = (page: Page, item: NavItem) => page.getByTestId(item);

const expectNav = async (page: Page, visible: NavItem[], hidden: NavItem[]) => {
  for (const item of visible)
    await expect(nav(page, item).first()).toBeAttached();
  for (const item of hidden) await expect(nav(page, item)).toHaveCount(0);
};

// swap/earn can be disabled by the stand manifest; such tests are skipped
const getBaseline = async (page: Page) => {
  await page.goto('/');
  await expect(nav(page, 'navStake').first()).toBeAttached();
  return {
    earn: (await nav(page, 'navEarn').count()) > 0,
    swap: (await nav(page, 'navSwap').count()) > 0,
  };
};

const pathOf = (page: Page) => new URL(page.url()).pathname;

test.describe('products via URL params', () => {
  let baseline: { earn: boolean; swap: boolean };

  test.beforeEach(async ({ page }) => {
    baseline = await getBaseline(page);
  });

  test('?swap=disabled hides swap and guards /swap', async ({ page }) => {
    test.skip(!baseline.swap, 'swap is disabled on this stand');
    await page.goto('/?swap=disabled');
    await expectNav(page, ['navStake'], ['navSwap']);

    await page.goto('/swap?swap=disabled');
    await expect.poll(() => pathOf(page)).toBe('/');
  });

  test('?earn=disabled hides earn and guards /earn', async ({ page }) => {
    test.skip(!baseline.earn, 'earn is disabled on this stand');
    await page.goto('/?earn=disabled');
    await expectNav(page, ['navStake'], ['navEarn']);

    await page.goto('/earn?earn=disabled');
    await expect.poll(() => pathOf(page)).toBe('/');
  });

  test('?product=earn keeps only earn and redirects stake pages', async ({
    page,
  }) => {
    test.skip(!baseline.earn, 'earn is disabled on this stand');
    for (const path of ['/', '/wrap', '/withdrawals/request', '/rewards']) {
      await page.goto(`${path}?product=earn`);
      await expect.poll(() => pathOf(page)).toBe('/earn');
    }
    await expectNav(page, ['navEarn'], ['navStake', 'navSwap']);
  });

  test('repeated and comma-separated product params are equal', async ({
    page,
  }) => {
    test.skip(!baseline.earn || !baseline.swap, 'earn or swap is disabled');
    for (const query of ['product=swap&product=earn', 'product=swap,earn']) {
      await page.goto(`/?${query}`);
      // first product in the list wins the redirect from `/`
      await expect.poll(() => pathOf(page)).toBe('/swap');
      await expectNav(page, ['navSwap', 'navEarn'], ['navStake']);
    }
  });

  test('stake stays enabled when earn and swap are disabled', async ({
    page,
  }) => {
    await page.goto('/?swap=disabled&earn=disabled');
    await expect.poll(() => pathOf(page)).toBe('/');
    await expectNav(page, ['navStake'], ['navEarn', 'navSwap']);
  });

  test('on a conflict the first param wins', async ({ page }) => {
    test.skip(!baseline.swap, 'swap is disabled on this stand');
    await page.goto('/?swap=disabled&swap=enabled');
    await expectNav(page, ['navStake'], ['navSwap']);
  });

  test('Ledger Live: earn is off, stake is forced on', async ({ page }) => {
    await page.goto('/?app=ledger-live&product=earn');
    await expect.poll(() => pathOf(page)).toBe('/');
    await expectNav(page, ['navStake'], ['navEarn', 'navSwap']);
  });

  test('internal links keep product params in order', async ({ page }) => {
    test.skip(!baseline.earn || !baseline.swap, 'earn or swap is disabled');
    await page.goto('/swap?product=swap&product=earn');
    await nav(page, 'navEarn').first().click();
    await expect.poll(() => pathOf(page)).toBe('/earn');
    // repeated `product` params are kept as a comma-separated one
    const params = new URL(page.url()).searchParams;
    expect(params.get('product')).toBe('swap,earn');
  });

  test('a navigation that lost params keeps limits and restores the URL', async ({
    page,
  }) => {
    test.skip(!baseline.earn, 'earn is disabled on this stand');
    await page.goto('/earn?product=earn');
    await expectNav(page, ['navEarn'], ['navStake']);

    // client-side transition without params, like a link rendered without LocalLink
    await page.evaluate(() => (window as any).next.router.push('/'));
    await expect.poll(() => pathOf(page)).toBe('/earn');
    await expect
      .poll(() => new URL(page.url()).searchParams.get('product'))
      .toBe('earn');
    await expectNav(page, ['navEarn'], ['navStake']);

    // a reload keeps the same products
    await page.reload();
    await expectNav(page, ['navEarn'], ['navStake']);
  });
});
