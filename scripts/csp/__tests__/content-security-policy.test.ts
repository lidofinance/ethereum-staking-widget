import {
  DEFAULT_COWSWAP_WIDGET_BASE_URL,
  createContentSecurityPolicy,
  cspInputsFromEnv,
} from '../content-security-policy.mjs';
import { createCspHeader } from '../csp-header.mjs';

const COWSWAP = 'https://swap.cow.example/';
const REPORT_URI = 'https://stake.example/api/csp-report';
const IPFS_HASH = "'sha256-ipfsbootstrap='";

const serverInputs = {
  trustedHosts: ['https://trusted.example'],
  reportUri: REPORT_URI,
  reportOnly: false,
  cowswapBaseUrl: COWSWAP,
  developmentMode: false,
  ipfsMode: false,
};

type Directives = Record<string, string[] | string | undefined>;
const directivesOf = (
  inputs: Parameters<typeof createContentSecurityPolicy>[0],
) => createContentSecurityPolicy(inputs).directives as Directives;

describe('cspInputsFromEnv', () => {
  it('reads the server variables next.config.mjs hands the app', () => {
    expect(
      cspInputsFromEnv({
        CSP_TRUSTED_HOSTS: 'https://a.example,https://b.example',
        CSP_REPORT_URI: REPORT_URI,
        CSP_REPORT_ONLY: 'true',
        COWSWAP_WIDGET_BASE_URL: COWSWAP,
      }),
    ).toEqual({
      trustedHosts: ['https://a.example', 'https://b.example'],
      reportUri: REPORT_URI,
      reportOnly: true,
      cowswapBaseUrl: COWSWAP,
    });
  });

  it('defaults like the app: no trusted hosts, enforced, the testnet CoW origin', () => {
    expect(cspInputsFromEnv({})).toEqual({
      trustedHosts: [],
      reportUri: undefined,
      reportOnly: false,
      cowswapBaseUrl: DEFAULT_COWSWAP_WIDGET_BASE_URL,
    });
  });

  it('treats an empty CSP_REPORT_URI as no reporting', () => {
    expect(cspInputsFromEnv({ CSP_REPORT_URI: '' }).reportUri).toBeUndefined();
  });

  it.each([
    ['true', true],
    ['TRUE', true],
    ['1', true],
    ['false', false],
    ['0', false],
    ['', false],
  ])('reads CSP_REPORT_ONLY=%s as %s, like toBoolean', (value, expected) => {
    expect(cspInputsFromEnv({ CSP_REPORT_ONLY: value }).reportOnly).toBe(
      expected,
    );
  });
});

describe('createContentSecurityPolicy', () => {
  it('pins scripts to self, the theme bootstrap hash and the trusted hosts', () => {
    expect(directivesOf(serverInputs).scriptSrc).toEqual([
      "'self'",
      "'sha256-wTvVT3oJ2rMAqNUILvSYccTn53N47S3NIZbPE0ql0No='",
      'https://trusted.example',
    ]);
  });

  it('carries the header-only directives on the server', () => {
    const directives = directivesOf(serverInputs);
    expect(directives.frameAncestors).toEqual(['*']);
    expect(directives.reportURI).toBe(REPORT_URI);
    expect(directives['base-uri']).toEqual(["'none'"]);
  });

  it('frames the CoW origin next to WalletConnect', () => {
    expect(directivesOf(serverInputs).frameSrc).toEqual([
      "'self'",
      COWSWAP,
      'https://*.walletconnect.org',
      'https://*.walletconnect.com',
    ]);
  });

  it('allows eval and ws only in development, for HMR', () => {
    const directives = directivesOf({ ...serverInputs, developmentMode: true });
    expect(directives.scriptSrc).toContain("'unsafe-eval'");
    expect(directives.connectSrc).toContain('ws:');

    const production = directivesOf(serverInputs);
    expect(production.scriptSrc).not.toContain("'unsafe-eval'");
    expect(production.connectSrc).not.toContain('ws:');
  });

  it('drops the directives a <meta> tag ignores and adds the bootstrap hash on IPFS', () => {
    const directives = directivesOf({
      ...serverInputs,
      ipfsMode: true,
      ipfsBaseScriptHash: IPFS_HASH,
    });
    expect(directives.scriptSrc).toContain(IPFS_HASH);
    expect(directives.frameAncestors).toBeUndefined();
    expect(directives.reportURI).toBeUndefined();
    expect(directives['base-uri']).toBeUndefined();
  });

  it('passes report-only through', () => {
    expect(
      createContentSecurityPolicy({ ...serverInputs, reportOnly: true })
        .reportOnly,
    ).toBe(true);
  });
});

describe('createCspHeader', () => {
  it('renders the enforced header the app sets', () => {
    const [name, value] = createCspHeader(
      createContentSecurityPolicy(serverInputs),
    );
    expect(name).toBe('Content-Security-Policy');
    expect(value).toContain("default-src 'self'");
    expect(value).toContain('frame-ancestors *');
    expect(value).toContain(`report-uri ${REPORT_URI}`);
    expect(value).toContain("script-src-attr 'none'");
    expect(value).toContain(`frame-src 'self' ${COWSWAP}`);
  });

  it('renders the report-only header when the policy is report-only', () => {
    const [name] = createCspHeader(
      createContentSecurityPolicy({ ...serverInputs, reportOnly: true }),
    );
    expect(name).toBe('Content-Security-Policy-Report-Only');
  });
});
