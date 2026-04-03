import { expect, test } from '@playwright/test';

import {
  WIDGET_PAGES,
  CACHE_CONTROL_HEADER,
  CACHE_CONTROL_VALUE,
  CACHE_CONTROL_PAGES,
} from 'next.config.mjs';
import { CONFIG } from './config.js';

test.describe('Page Headers', () => {
  const isPreview = !CONFIG.STAND_URL?.includes('branch-preview');

  CACHE_CONTROL_PAGES.map((route) =>
    test(`Page ${route} should have proper headers`, async ({ request }) => {
      // case for only wildcard in config
      if (route == '/favicon:size*') route = '/favicon.ico';

      const resp = await request.get(route);
      expect(resp.status()).toBe(200);
      const headers = resp.headers();

      await test.step('Check defined headers', async () => {
        expect.soft(headers['cache-control']).toBe(CACHE_CONTROL_VALUE);
        expect.soft(headers['referrer-policy']).toBe('same-origin');
        expect.soft(headers['x-content-type-options']).toBe('nosniff');
        expect.soft(headers['x-xss-protection']).toBe('1');
        expect.soft(headers['x-dns-prefetch-control']).toBe('on');
        expect.soft(headers['x-download-options']).toBe('noopen');

        // except "/manifest.json", "/favicon:size*", "/runtime/window-env.js" urls and preview-stand deploying
        if (WIDGET_PAGES.includes(route) && isPreview)
          expect
            .soft(headers['content-security-policy'])
            .toContain('default-src');
      });

      await test.step('Check undefined headers', async () => {
        expect.soft(headers['x-frame-options']).toBeUndefined();
        expect.soft(headers[CACHE_CONTROL_HEADER]).toBeUndefined();
      });
    }),
  );
});
