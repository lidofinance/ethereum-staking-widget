import { expect, Locator, Page } from '@playwright/test';
import { HOME_PATH } from 'consts/urls';

export class WidgetPage {
  readonly page: Page;
  readonly title: Locator;
  readonly stakeFormButton: Locator;
  readonly lidoStatistic: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = this.page.locator('h1', { hasText: 'Stake Ether' });
    this.stakeFormButton = this.page.locator('main button', {
      hasText: /^(Connect wallet|Unsupported chain)$/,
    });
    this.lidoStatistic = this.page.locator('section', {
      hasText: 'Statistics of the Lido protocol',
    });
  }

  async goto() {
    await this.page.goto(HOME_PATH);
    await expect(this.title).toBeVisible();
  }
}
