import { expect, test } from '@playwright/test';
import { getAllPagesRoutes } from './utils/collect-next-pages.js';

import {
  CACHE_CONTROL_HEADER,
  CACHE_CONTROL_PAGES,
  CACHE_CONTROL_VALUE,
} from 'next.config.mjs';

// case for only wildcard in config
const configPages = CACHE_CONTROL_PAGES;
configPages[CACHE_CONTROL_PAGES.indexOf('/favicon:size*')] = '/favicon.ico';

test.describe('Page Headers', () => {
  test('Config should have all static pages', () => {
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

      expect(headers['cache-control']).toBe(CACHE_CONTROL_VALUE);

      expect(headers['referrer-policy']).toBe('same-origin');
      expect(headers['x-content-type-options']).toBe('nosniff');
      expect(headers['x-xss-protection']).toBe('1');
      expect(headers['x-dns-prefetch-control']).toBe('on');
      expect(headers['x-download-options']).toBe('noopen');

      expect(headers['x-frame-options']).toBeUndefined();
      expect(headers[CACHE_CONTROL_HEADER]).toBeUndefined();
    }),
  );
});
