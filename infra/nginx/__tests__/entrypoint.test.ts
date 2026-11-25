import { describe, expect, it, vi } from 'vitest';

import {
  StartupError,
  WINDOW_ENV_LOADER_HASH,
  buildRuntimeConfig,
  readCowswapBaseUrl,
  renderTemplate,
} from '../entrypoint.mjs';

const IMPORT_MAP_HASH = `sha256-${'A'.repeat(43)}=`;

const baseEnv = {
  SELF_ORIGIN: 'https://stake.example.org',
  CSP_REPORT_URI: 'https://stake.example.org/api/csp-report',
};

describe('web entrypoint runtime config', () => {
  it('builds the CSP header the nginx templates expect', () => {
    const config = buildRuntimeConfig(
      {
        ...baseEnv,
        CSP_TRUSTED_HOSTS: ' https://a.example, ,https://*.b.example',
      },
      `${IMPORT_MAP_HASH}\n`,
    );

    expect(config.SELF_ORIGIN).toBe('https://stake.example.org');
    expect(config.CSP_HEADER_NAME).toBe('content-security-policy');
    expect(config.CSP_HEADER_VALUE).toBe(
      [
        "default-src 'self'",
        "style-src 'self' 'unsafe-inline'",
        "font-src 'self' data: https://fonts.reown.com",
        "img-src 'self' data: blob: https://*.walletconnect.org https://*.walletconnect.com",
        `script-src 'self' https://a.example https://*.b.example '${WINDOW_ENV_LOADER_HASH}' '${IMPORT_MAP_HASH}'`,
        "connect-src 'self' https: wss:",
        'frame-ancestors *',
        "frame-src 'self' https://cow-ipfs.testnet.fi/ https://*.walletconnect.org https://*.walletconnect.com",
        "child-src 'self' https://cow-ipfs.testnet.fi/ https://*.walletconnect.org https://*.walletconnect.com",
        "worker-src 'none'",
        "object-src 'none'",
        "media-src 'none'",
        "manifest-src 'self'",
        "form-action 'self'",
        "script-src-attr 'none'",
        "base-uri 'none'",
        'report-uri https://stake.example.org/api/csp-report',
      ].join('; '),
    );
  });

  it('switches to the report-only header and allows a missing import map hash there', () => {
    const stderr = vi.spyOn(process.stderr, 'write').mockReturnValue(true);
    const config = buildRuntimeConfig(
      { ...baseEnv, CSP_REPORT_ONLY: 'true' },
      undefined,
    );
    stderr.mockRestore();

    expect(config.CSP_HEADER_NAME).toBe('content-security-policy-report-only');
    expect(config.CSP_HEADER_VALUE).not.toContain("'sha256-AAAA");
  });

  it.each([
    ['an enforcing CSP without the import map hash', {}, undefined],
    ['a malformed import map hash', {}, 'sha256-short='],
    [
      'SELF_ORIGIN with a forbidden character',
      { SELF_ORIGIN: 'https://a|b' },
      IMPORT_MAP_HASH,
    ],
    [
      'a trusted host with a directive separator',
      { CSP_TRUSTED_HOSTS: 'https://a; script-src *' },
      IMPORT_MAP_HASH,
    ],
    [
      'a relative report URI',
      { CSP_REPORT_URI: '/api/csp-report' },
      IMPORT_MAP_HASH,
    ],
    [
      'a CoW base URL that is not plain https',
      { COWSWAP_WIDGET_BASE_URL: 'http://cow.example' },
      IMPORT_MAP_HASH,
    ],
  ])('fails startup on %s', (_, env, importMapFile) => {
    expect(() =>
      buildRuntimeConfig({ ...baseEnv, ...env }, importMapFile),
    ).toThrow(StartupError);
  });

  it('normalizes the CoW base URL to one trailing slash', () => {
    expect(readCowswapBaseUrl(' https://cow.example/app// ')).toBe(
      'https://cow.example/app/',
    );
    expect(readCowswapBaseUrl('')).toBe('https://cow-ipfs.testnet.fi/');
  });
});

describe('renderTemplate', () => {
  it('substitutes only its own placeholders and keeps nginx variables', () => {
    const rendered = renderTemplate(
      'sub_filter "__PUBLIC_ORIGIN__" "${SELF_ORIGIN}"; add_header ${CSP_HEADER_NAME} "${CSP_HEADER_VALUE}"; try_files $uri ${uri};',
      {
        SELF_ORIGIN: 'https://a.example&x=1',
        CSP_HEADER_NAME: 'content-security-policy',
        CSP_HEADER_VALUE: "default-src 'self'\n",
      },
    );

    expect(rendered).toBe(
      'sub_filter "__PUBLIC_ORIGIN__" "https://a.example&x=1"; add_header content-security-policy "default-src \'self\'"; try_files $uri ${uri};',
    );
  });
});
