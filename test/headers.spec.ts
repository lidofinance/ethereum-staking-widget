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

  CACHE_CONTROL_PAGES.forEach((route) =>
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
        expect.soft(headers['x-xss-protection']).toBe('1; mode=block');
        expect.soft(headers['x-dns-prefetch-control']).toBe('on');
        expect.soft(headers['x-download-options']).toBe('noopen');

        // NB: Controlled by CF
        expect
          .soft(headers['strict-transport-security'])
          .toBe('max-age=2592000; includeSubDomains; preload');

        expect.soft(headers['x-permitted-cross-domain-policies']).toBe('none');
        expect
          .soft(headers['cross-origin-opener-policy'])
          .toBe(`same-origin-allow-popups`);
        expect
          .soft(headers['permissions-policy'])
          .toBe(
            'camera=(), microphone=(), geolocation=(), payment=(), accelerometer=(), gyroscope=(), magnetometer=(), display-capture=(), encrypted-media=(), serial=(), xr-spatial-tracking=(), browsing-topics=(), usb=(self), bluetooth=(self), hid=(self), autoplay=(self), fullscreen=(self), picture-in-picture=(self)',
          );

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

const TOKEN_LIST_FILES = [
  '/token-lists/withdrawals-dex-buy-tokenlist.json',
  '/token-lists/withdrawals-dex-sell-tokenlist.json',
];

test.describe('Token list headers', () => {
  TOKEN_LIST_FILES.forEach((route) =>
    test(`File ${route} should have proper headers`, async ({ request }) => {
      const resp = await request.get(route);
      expect(resp.status()).toBe(200);
      const headers = resp.headers();

      await test.step('Check content type and body', async () => {
        expect.soft(headers['content-type']).toContain('application/json');
        // must parse as JSON — corrupt token lists break DEX widget consumers
        await expect.soft(resp.json()).resolves.toBeTruthy();
      });

      await test.step('Check cross-origin headers', async () => {
        expect.soft(headers['access-control-allow-origin']).toBe('*');
        expect
          .soft(headers['access-control-allow-methods'])
          .toBe('GET, HEAD, OPTIONS');
        expect
          .soft(headers['cross-origin-resource-policy'])
          .toBe('cross-origin');
        expect.soft(headers['x-robots-tag']).toBe('noindex');
        expect.soft(headers['cache-control']).toBe(CACHE_CONTROL_VALUE);
      });

      await test.step('Check inherited global headers', async () => {
        expect.soft(headers['referrer-policy']).toBe('same-origin');
        expect.soft(headers['x-content-type-options']).toBe('nosniff');
        expect.soft(headers['x-xss-protection']).toBe('1; mode=block');
        expect.soft(headers['x-dns-prefetch-control']).toBe('on');
        expect.soft(headers['x-download-options']).toBe('noopen');
        expect.soft(headers['x-permitted-cross-domain-policies']).toBe('none');

        // NB: Controlled by CF
        expect
          .soft(headers['strict-transport-security'])
          .toBe('max-age=2592000; includeSubDomains; preload');
      });

      await test.step('Check undefined headers', async () => {
        expect.soft(headers[CACHE_CONTROL_HEADER]).toBeUndefined();
      });
    }),
  );
});
