// Web container entrypoint. Plain node: the DHI runtime image has no shell.
//
// Startup jobs that derive from container env vars at boot, so one image
// serves every environment (Hoodi, Sepolia, Mainnet) from its Helm release:
// 1. Write /var/cache/nginx/window-env.json, the client config spliced into
//    every HTML response by nginx SSI.
// 2. Render the nginx config templates: ${SELF_ORIGIN} (feeds the
//    __PUBLIC_ORIGIN__ sub_filter) and the CSP header from CSP_* env vars.
// 3. Run nginx in the foreground and pass stop signals to it.
import { spawn, spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from 'node:fs';
import { pathToFileURL } from 'node:url';

const HTML_ROOT = '/usr/share/nginx/html';
const CACHE_DIR = '/var/cache/nginx';
const TEMPLATE_DIR = '/etc/nginx/template-src';
const WINDOW_ENV_CLI = '/etc/nginx/window-env-cli.mjs';
// Written by emit-import-map-csp-hash in vite.config.ts
const IMPORT_MAP_HASH_FILE = `${HTML_ROOT}/importmap-csp-hash.txt`;

// CSP hash of the inline window-env loader in index.html (pinned by unit test)
export const WINDOW_ENV_LOADER_HASH =
  'sha256-6ApUdZunJlq8fZcraTYQbcZ6XIB1F85yxMoDe+8WwAY=';
// Used as iframe and img src for WalletConnect
const CSP_WALLET_CONNECT_HOSTS =
  'https://*.walletconnect.org https://*.walletconnect.com';
// Same default as COWSWAP_BASE_URL in modules/dexes/cowswap/consts.ts
const DEFAULT_COWSWAP_WIDGET_BASE_URL = 'https://cow-ipfs.testnet.fi/';

export class StartupError extends Error {}

const fail = (message) => {
  throw new StartupError(message);
};

const warn = (message) =>
  process.stderr.write(`entrypoint: WARNING: ${message}\n`);

// SELF_ORIGIN lands in the rendered config and the CSP header: an empty value
// gives relative og:image/canonical URLs, `|`, `&` or a newline corrupt the config
export const readSelfOrigin = (env) => {
  const selfOrigin = env.SELF_ORIGIN ?? '';
  if (!selfOrigin) {
    warn('SELF_ORIGIN is empty — head/sitemap URLs will be relative');
  }
  if (/[|&\n]/.test(selfOrigin)) {
    fail('SELF_ORIGIN contains forbidden characters (| & or newline)');
  }
  return selfOrigin;
};

// Per-build hash of the inline SRI import map; required for an enforcing CSP
export const readImportMapHash = (fileContent, reportOnly) => {
  const hash = (fileContent ?? '').replace(/[\r\n]/g, '');
  if (hash && !/^sha256-[A-Za-z0-9+/]{43}=$/.test(hash)) {
    fail(`malformed ${IMPORT_MAP_HASH_FILE}`);
  }
  if (!hash) {
    if (reportOnly) {
      warn(
        `${IMPORT_MAP_HASH_FILE} missing — an enforcing CSP would block the SRI import map`,
      );
    } else {
      fail(
        `${IMPORT_MAP_HASH_FILE} missing — enforcing CSP would silently disable module-graph SRI`,
      );
    }
  }
  return hash;
};

// One source token per comma-separated entry; anything else would inject directives
export const parseTrustedHosts = (value) =>
  (value ?? '')
    .split(',')
    .map((host) => host.trim())
    .filter(Boolean)
    .map((host) => {
      if (!/^[!-~]+$/.test(host) || /[;,]/.test(host)) {
        fail('CSP_TRUSTED_HOSTS has an invalid source');
      }
      return host;
    });

// report-uri must be one absolute URL token
export const readReportUri = (value) => {
  const reportUri = value ?? '';
  if (!reportUri) return '';
  if (reportUri.includes('\n')) fail('CSP_REPORT_URI contains a newline');
  if (
    !/^[A-Za-z][A-Za-z0-9+.-]*:\/\/[!-~]+$/.test(reportUri) ||
    /[;,]/.test(reportUri)
  ) {
    fail('CSP_REPORT_URI must be an absolute URL');
  }
  return reportUri;
};

// A bare https URL with one trailing '/', like resolveCowswapBaseUrl:
// the widget loads <base>/#/..., a source ending in '/' admits it by prefix
export const readCowswapBaseUrl = (value) => {
  const baseUrl = (value ?? '').trim() || DEFAULT_COWSWAP_WIDGET_BASE_URL;
  if (baseUrl.includes('\n'))
    fail('COWSWAP_WIDGET_BASE_URL contains a newline');
  if (
    !/^https:\/\/[A-Za-z0-9.-]+(:[0-9]+)?(\/[A-Za-z0-9._~/-]*)?$/.test(baseUrl)
  ) {
    fail('COWSWAP_WIDGET_BASE_URL must be a plain https URL');
  }
  return baseUrl.replace(/\/*$/, '/');
};

export const buildCsp = ({
  trustedHosts,
  importMapHash,
  cowswapBaseUrl,
  reportUri,
  reportOnly,
}) => {
  const scriptSrc = [
    "'self'",
    ...trustedHosts,
    `'${WINDOW_ENV_LOADER_HASH}'`,
    ...(importMapHash ? [`'${importMapHash}'`] : []),
  ].join(' ');
  const frameSrc = `'self' ${cowswapBaseUrl} ${CSP_WALLET_CONNECT_HOSTS}`;
  const directives = [
    "default-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data: https://fonts.reown.com",
    `img-src 'self' data: blob: ${CSP_WALLET_CONNECT_HOSTS}`,
    `script-src ${scriptSrc}`,
    "connect-src 'self' https: wss:",
    'frame-ancestors *',
    `frame-src ${frameSrc}`,
    `child-src ${frameSrc}`,
    "worker-src 'none'",
    "object-src 'none'",
    "media-src 'none'",
    "manifest-src 'self'",
    "form-action 'self'",
    "script-src-attr 'none'",
    "base-uri 'none'",
    ...(reportUri ? [`report-uri ${reportUri}`] : []),
  ];
  return {
    name: reportOnly
      ? 'content-security-policy-report-only'
      : 'content-security-policy',
    value: directives.join('; '),
  };
};

// Only these placeholders are substituted, so nginx's own $variables survive
export const renderTemplate = (template, values) =>
  template.replace(
    /\$\{(SELF_ORIGIN|CSP_HEADER_NAME|CSP_HEADER_VALUE)\}/g,
    (_, name) => values[name].replace(/[\r\n]/g, ''),
  );

export const buildRuntimeConfig = (env, importMapFileContent) => {
  const reportOnly = env.CSP_REPORT_ONLY === 'true';
  const selfOrigin = readSelfOrigin(env);
  const csp = buildCsp({
    trustedHosts: parseTrustedHosts(env.CSP_TRUSTED_HOSTS),
    importMapHash: readImportMapHash(importMapFileContent, reportOnly),
    cowswapBaseUrl: readCowswapBaseUrl(env.COWSWAP_WIDGET_BASE_URL),
    reportUri: readReportUri(env.CSP_REPORT_URI),
    reportOnly,
  });
  return {
    SELF_ORIGIN: selfOrigin,
    CSP_HEADER_NAME: csp.name,
    CSP_HEADER_VALUE: csp.value,
  };
};

const writeWindowEnv = () => {
  const output = `${CACHE_DIR}/window-env.json`;
  const cli = spawnSync(process.execPath, [WINDOW_ENV_CLI], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
  });
  if (cli.status !== 0 || !cli.stdout) {
    fail('window-env CLI failed — refusing to serve without runtime env');
  }
  writeFileSync(output, cli.stdout);
};

const renderNginxConfig = () => {
  const importMapFile = existsSync(IMPORT_MAP_HASH_FILE)
    ? readFileSync(IMPORT_MAP_HASH_FILE, 'utf8')
    : undefined;
  const values = buildRuntimeConfig(process.env, importMapFile);
  const confDir = `${CACHE_DIR}/conf.d`;
  mkdirSync(confDir, { recursive: true });
  const render = (template, output) =>
    writeFileSync(
      output,
      renderTemplate(
        readFileSync(`${TEMPLATE_DIR}/${template}`, 'utf8'),
        values,
      ),
    );
  render(
    'security-headers.conf.template',
    `${CACHE_DIR}/security-headers.conf`,
  );
  render('default.conf.template', `${confDir}/default.conf`);
};

// nginx in the foreground; a stop signal becomes a graceful SIGQUIT
const runNginx = () => {
  const nginx = spawn('nginx', ['-e', '/dev/stderr', '-g', 'daemon off;'], {
    stdio: 'inherit',
  });
  for (const signal of ['SIGTERM', 'SIGINT', 'SIGQUIT']) {
    process.on(signal, () => nginx.kill('SIGQUIT'));
  }
  nginx.on('error', (error) => {
    process.stderr.write(
      `entrypoint: ERROR: nginx failed to start: ${error.message}\n`,
    );
    process.exit(1);
  });
  nginx.on('exit', (code, signal) => process.exit(code ?? (signal ? 1 : 0)));
};

const main = () => {
  try {
    mkdirSync(CACHE_DIR, { recursive: true });
    writeWindowEnv();
    renderNginxConfig();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`entrypoint: ERROR: ${message}\n`);
    process.exit(1);
  }
  runNginx();
};

// run only as the script itself, not when imported by tests
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href
) {
  main();
}
