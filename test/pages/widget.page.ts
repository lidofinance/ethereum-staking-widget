import { expect, Locator, Page } from '@playwright/test';

export class WidgetPage {
  readonly page: Page;
  readonly title: Locator;
  readonly connectWalletButton: Locator;
  readonly lidoStatistic: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = this.page.locator('h1', { hasText: 'Stake Ether' });
    this.connectWalletButton = this.page.locator('main button', {
      hasText: 'Connect wallet',
    });
    this.lidoStatistic = this.page.locator('section', {
      hasText: 'Lido statistic',
    });
  }

  async goto() {
    await this.page.goto('/');
    await expect(this.title).toBeVisible();
  }
}
