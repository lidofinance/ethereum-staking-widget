import { describe, it, expect, vi, afterEach } from 'vitest';
import { sanitizeWidgetBaseUrl } from '@cowprotocol/widget-react';

import {
  DEFAULT_COWSWAP_WIDGET_BASE_URL,
  createContentSecurityPolicy,
  cspInputsFromEnv,
  resolveCowswapBaseUrl,
} from 'scripts/csp/content-security-policy.mjs';

// COWSWAP_BASE_URL of a build with the given COWSWAP_WIDGET_BASE_URL
const loadWidgetBaseUrl = async (value: string | undefined) => {
  vi.resetModules();
  vi.doMock('config', () => ({ config: { cowswapWidgetBaseUrl: value } }));
  return (await import('../consts')).COWSWAP_BASE_URL;
};

// the frame-src source of the server header or the IPFS meta tag
const frameSource = (cowswapBaseUrl: string, ipfsMode: boolean) => {
  const { frameSrc } = createContentSecurityPolicy({
    trustedHosts: [],
    reportUri: undefined,
    reportOnly: false,
    cowswapBaseUrl,
    developmentMode: false,
    ipfsMode,
  }).directives as { frameSrc: string[] };
  return frameSrc[1];
};

// the document the widget library frames: base path, one '/', then the route
const widgetDocument = (baseUrl: string) =>
  `${sanitizeWidgetBaseUrl(baseUrl)}/`;

afterEach(() => {
  vi.doUnmock('config');
});

describe('CoW widget base URL', () => {
  it.each([
    ['https://cow.example/ipfs/cid', 'https://cow.example/ipfs/cid/'],
    ['https://cow.example/ipfs/cid/', 'https://cow.example/ipfs/cid/'],
    ['https://cow.example/ipfs/cid//', 'https://cow.example/ipfs/cid/'],
    ['https://cow.example', 'https://cow.example/'],
    ['https://cow.example/', 'https://cow.example/'],
    [' https://cow.example/build ', 'https://cow.example/build/'],
    [undefined, DEFAULT_COWSWAP_WIDGET_BASE_URL],
    ['', DEFAULT_COWSWAP_WIDGET_BASE_URL],
  ])('resolves %j to %s', (value, expected) => {
    expect(resolveCowswapBaseUrl(value)).toBe(expected);
  });

  it.each([
    ['https://cow.example/ipfs/cid', 'https://cow.example/ipfs/cid/'],
    ['https://cow.example', 'https://cow.example/'],
  ])(
    'with or without a final slash, %s gives one CSP source and widget URL',
    async (withoutSlash, withSlash) => {
      const resolve = async (value: string) => {
        const widgetBaseUrl = await loadWidgetBaseUrl(value);
        const { cowswapBaseUrl } = cspInputsFromEnv({
          COWSWAP_WIDGET_BASE_URL: value,
        });
        return {
          widgetBaseUrl,
          serverSource: frameSource(cowswapBaseUrl, false),
          ipfsSource: frameSource(widgetBaseUrl, true),
          document: widgetDocument(widgetBaseUrl),
        };
      };
      const results = [await resolve(withoutSlash), await resolve(withSlash)];

      expect(results[0]).toEqual(results[1]);
      const [{ widgetBaseUrl, serverSource, ipfsSource, document }] = results;
      expect(widgetBaseUrl).toBe(withSlash);
      expect(serverSource).toBe(withSlash);
      expect(ipfsSource).toBe(withSlash);
      // a source ending in '/' admits the framed document by path prefix
      expect(document).toBe(withSlash);
    },
  );

  it('keeps the origin the CSP violation check compares', async () => {
    expect(
      new URL(await loadWidgetBaseUrl('https://cow.example/ipfs/cid')).origin,
    ).toBe('https://cow.example');
  });
});
