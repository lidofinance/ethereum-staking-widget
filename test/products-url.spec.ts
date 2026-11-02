import { test, expect, Page } from '@playwright/test';

type NavItem = 'navStake' | 'navEarn' | 'navSwap';

const nav = (page: Page, item: NavItem) => page.getByTestId(item);

const expectNav = async (page: Page, visible: NavItem[], hidden: NavItem[]) => {
  for (const item of visible)
    await expect(nav(page, item).first()).toBeAttached();
  for (const item of hidden) await expect(nav(page, item)).toHaveCount(0);
};

const STAKE_SUB_PAGES = ['navWrap', 'navWithdrawals', 'navRewards'] as const;

// products and stake pages can be disabled by the stand manifest; tests adapt or skip
const getBaseline = async (page: Page) => {
  await page.goto('/');
  await expect(nav(page, 'navStake').first()).toBeAttached();
  const stakeSubPages: string[] = [];
  for (const item of STAKE_SUB_PAGES)
    if ((await page.getByTestId(item).count()) > 0) stakeSubPages.push(item);
  return {
    earn: (await nav(page, 'navEarn').count()) > 0,
    swap: (await nav(page, 'navSwap').count()) > 0,
    stakePages: ['navStake', ...stakeSubPages],
  };
};

const pathOf = (page: Page) => new URL(page.url()).pathname;

// Next.js exposes its router on window.next
type NextWindow = Window & {
  next: { router: { push: (url: string) => Promise<boolean> } };
};

test.describe('products via URL params', () => {
  let baseline: Awaited<ReturnType<typeof getBaseline>>;

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

  test('a repeated product param: the first one wins', async ({ page }) => {
    test.skip(!baseline.swap, 'swap is disabled on this stand');
    await page.goto('/?swap=disabled&swap=enabled');
    await expectNav(page, ['navStake'], ['navSwap']);
  });

  test('`product` wins over other product params in any order', async ({
    page,
  }) => {
    test.skip(!baseline.earn, 'earn is disabled on this stand');
    // earn is left out of `product`, its configuration is ignored
    for (const query of ['earn=eth&product=stake', 'product=stake&earn=eth']) {
      await page.goto(`/earn?${query}`);
      await expect.poll(() => pathOf(page)).toBe('/');
      await expectNav(page, ['navStake'], ['navEarn', 'navSwap']);
    }
  });

  test('`product` turns on a product its own param disables', async ({
    page,
  }) => {
    test.skip(!baseline.swap, 'swap is disabled on this stand');
    for (const query of [
      'swap=disabled&product=swap',
      'product=swap&swap=disabled',
    ]) {
      await page.goto(`/?${query}`);
      await expect.poll(() => pathOf(page)).toBe('/swap');
      await expectNav(page, ['navSwap'], ['navStake', 'navEarn']);
    }
  });

  test('stake only: flat desktop navigation without the dropdown', async ({
    page,
  }) => {
    // beforeEach is already on `/`; with Earn or Swap on the stand the stake pages
    // are links in the closed dropdown, without them the navigation is flat already
    if (baseline.earn || baseline.swap) {
      await expect(nav(page, 'navStake').first()).toBeVisible();
      for (const item of baseline.stakePages.slice(1))
        await expect(page.getByTestId(item).first()).toBeHidden();
    }

    for (const query of ['product=stake', 'app=ledger-live']) {
      await page.goto(`/?${query}`);
      for (const item of baseline.stakePages)
        await expect(page.getByTestId(item).first()).toBeVisible();
      await expectNav(page, ['navStake'], ['navEarn', 'navSwap']);
    }
  });

  test('stake only: mobile tabs without the sub-route track', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 400, height: 800 });
    const mobileNav = page.locator('nav[aria-label="Main"]');
    const track = mobileNav.locator('[aria-label="Stake"]');

    // the track holds text links; tabs are Stake, Earn, Swap.
    // Without Earn and Swap on the stand the navigation is flat already
    await page.goto('/');
    if (baseline.earn || baseline.swap) {
      await expect(track).toBeVisible();
      for (const item of baseline.stakePages.slice(1))
        await expect(mobileNav.getByTestId(item)).toHaveCount(0);
    } else {
      await expect(track).toHaveCount(0);
    }

    for (const query of ['product=stake', 'app=ledger-live']) {
      await page.goto(`/?${query}`);
      for (const item of baseline.stakePages)
        await expect(mobileNav.getByTestId(item).first()).toBeVisible();
      await expect(track).toHaveCount(0);
    }
  });

  test('Ledger Live: earn is off, stake is forced on', async ({ page }) => {
    await page.goto('/?app=ledger-live&product=earn');
    await expect.poll(() => pathOf(page)).toBe('/');
    await expectNav(page, ['navStake'], ['navEarn', 'navSwap']);
  });

  test('Ledger Live: swap is hidden and guarded', async ({ page }) => {
    await page.goto('/?app=ledger-live');
    await expectNav(page, ['navStake'], ['navSwap']);

    await page.goto('/swap?app=ledger-live');
    await expect.poll(() => pathOf(page)).toBe('/');

    // URL params cannot turn it back on
    await page.goto('/swap?app=ledger-live&swap=enabled');
    await expect.poll(() => pathOf(page)).toBe('/');
  });

  test('unknown earn vault hides nothing', async ({ page }) => {
    test.skip(!baseline.earn, 'earn is disabled on this stand');
    const vaultLinks = async () =>
      new Set(
        await page
          .locator('main a[href^="/earn/"]')
          .evaluateAll((links) =>
            links.map(
              (link) =>
                new URL(link.getAttribute('href') ?? '', location.origin)
                  .pathname,
            ),
          ),
      ).size;

    await page.goto('/earn');
    await expect.poll(vaultLinks).toBeGreaterThan(1);
    const allVaults = await vaultLinks();

    await page.goto('/earn?earn=foo');
    await expect.poll(vaultLinks).toBe(allVaults);

    await page.goto('/earn?earn=foo,eth');
    await expect.poll(vaultLinks).toBe(1);
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
    await page.evaluate(() =>
      (window as unknown as NextWindow).next.router.push('/'),
    );
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
