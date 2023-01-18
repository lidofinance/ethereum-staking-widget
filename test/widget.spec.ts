// example.spec.ts
import { test, expect } from '@playwright/test';
import { WidgetPage } from './pages/widget.page';

test('widget page should contain info', async ({ page }) => {
  const widgetPage = new WidgetPage(page);
  await widgetPage.goto();
  await expect(widgetPage.connectWalletButton).toBeVisible();
  expect(await widgetPage.lidoStatistic.textContent()).not.toContain('N/A');
});
