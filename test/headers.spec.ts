import { expect, test } from '@playwright/test';
import { getAllPagesRoutes } from './utils/collect-next-pages.js';

import {
  WIDGET_PAGES,
  CACHE_CONTROL_HEADER,
  CACHE_CONTROL_VALUE,
  CACHE_CONTROL_PAGES,
} from 'next.config.mjs';
import { CONFIG } from './config.js';

// case for only wildcard in config
const configPages = CACHE_CONTROL_PAGES;
configPages[CACHE_CONTROL_PAGES.indexOf('/favicon:size*')] = '/favicon.ico';

test.describe('Page Headers', async () => {
  test('Config should have all static pages', async () => {
    test.skip(!!CONFIG.STAND_TYPE, 'We cannot access files on stands');
    const pageRoutes = getAllPagesRoutes();
    pageRoutes.forEach((foundPage) =>
      expect(CACHE_CONTROL_PAGES.includes(foundPage)).toBe(true),
    );
  });

  CACHE_CONTROL_PAGES.map((route) =>
    test(`Page ${route} should have proper headers`, async ({ request }) => {
      const resp = await request.get(route);
      expect(resp.status()).toBe(200);
      const headers = resp.headers();

      expect.soft(headers['cache-control']).toBe(CACHE_CONTROL_VALUE);
      expect.soft(headers['referrer-policy']).toBe('same-origin');
      expect.soft(headers['x-content-type-options']).toBe('nosniff');
      expect.soft(headers['x-xss-protection']).toBe('1');
      expect.soft(headers['x-dns-prefetch-control']).toBe('on');
      expect.soft(headers['x-download-options']).toBe('noopen');

      // except "/manifest.json", "/favicon:size*", "/runtime/window-env.js" urls and preview-stand deploying
      if (
        WIDGET_PAGES.includes(route) &&
        !CONFIG.STAND_URL?.includes('branch-preview')
      )
        expect.soft(headers['content-security-policy']).toBeDefined();

      expect.soft(headers['x-frame-options']).toBeUndefined();
      expect.soft(headers[CACHE_CONTROL_HEADER]).toBeUndefined();
    }),
  );
});
