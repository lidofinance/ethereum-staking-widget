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

const csp_matomo_value =
  process.env.STAND_TYPE === 'staging-critical'
    ? 'https://matomo.lido.fi;'
    : process.env.STAND_URL?.includes('testnet')
      ? 'https://matomo.testnet.fi;'
      : 'https://*.branch-preview.org https://*.testnet.fi;';
const csp_report_uri_value =
  process.env.STAND_TYPE === 'testnet'
    ? 'https://stake-hoodi.testnet.fi'
    : 'https://stake.lido.fi' + '/api/csp-report';

const CSP_VALUE = `default-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: blob: https://*.walletconnect.org https://*.walletconnect.com; script-src 'self' 'unsafe-inline' ${csp_matomo_value} connect-src 'self' https: wss:; child-src 'self' https://*.walletconnect.org https://*.walletconnect.com; worker-src 'none'; base-uri 'none'; frame-ancestors *; report-uri ${csp_report_uri_value}`;

test.describe('Page Headers', () => {
  test('Config should have all static pages', () => {
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

      if (WIDGET_PAGES.includes(route))
        expect.soft(headers['content-security-policy']).toBe(CSP_VALUE);

      expect.soft(headers['x-frame-options']).toBeUndefined();
      expect.soft(headers[CACHE_CONTROL_HEADER]).toBeUndefined();
    }),
  );
});
