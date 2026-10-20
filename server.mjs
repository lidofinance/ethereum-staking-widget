import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { getRPCChecks } from './scripts/startup-checks/rpc.mjs';
import { getValidationFileChecks } from './scripts/startup-checks/validation-file.mjs';
import { getManifestFileChecks } from './scripts/startup-checks/config-manifest.mjs';
import {
  registerSecretsRotationRestart,
  registerShutdownSignals,
} from './scripts/shutdown.mjs';
import { markNotReady, markReady } from './scripts/readiness.mjs';
import { sanitizeError } from './scripts/utils/sanitize-error.mjs';
import {
  createContentSecurityPolicy,
  cspInputsFromEnv,
} from './scripts/csp/content-security-policy.mjs';
import {
  createCspHeader,
  setCspHeaderOnHtml,
} from './scripts/csp/csp-header.mjs';
import { overrideCacheControl } from './scripts/cache-control.mjs';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = Number(process.env.PORT) || 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(async () => {
    // checks are kicked off in next.config.mjs; a broken config must exit here,
    // before listen, so the pod never passes readiness
    if (process.env.RUN_STARTUP_CHECKS === 'true') {
      await Promise.all([
        getRPCChecks(),
        getValidationFileChecks(),
        getManifestFileChecks(),
      ]);
    }

    // The CSP header of every page. Set here, not in the app: the pages are
    // static (ISR), so nothing in the app runs for a page served from the
    // cache, and next.config headers are fixed at build time while the policy
    // reads runtime env. Built here, after prepare() loaded the env and before
    // listen: a policy that cannot be rendered (a relative CSP_REPORT_URI, say)
    // fails startup instead of failing every page behind a green readiness.
    const cspHeader = createCspHeader(
      createContentSecurityPolicy({
        ...cspInputsFromEnv(),
        developmentMode: process.env.NODE_ENV === 'development',
        ipfsMode: false,
      }),
    );

    const server = createServer(async (req, res) => {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url, true);

      overrideCacheControl(res);
      setCspHeaderOnHtml(res, () => cspHeader);

      await handle(req, res, parsedUrl);
    }).once('error', (err) => {
      console.error(err);
      process.exit(1);
    });
    // prevents malicious client from slowly sending headers and rest of request
    server.headersTimeout = 10_000;
    server.requestTimeout = 30_000;
    server.maxHeadersCount = 50;

    // Armed before listen: an explicit SECRETS_FILE that cannot be read throws
    // here and fails startup, rather than leaving a ready server with no
    // rotation watcher.
    registerShutdownSignals(server);
    registerSecretsRotationRestart(server);

    server.listen(port, () => {
      markReady();
      console.debug(`> Ready on http://${hostname}:${port}`);
    });
  })
  .catch((error) => {
    // Next installs a process-wide unhandledRejection handler that does not
    // exit, so without this a failed startup would sit alive and silent.
    console.error('[server] startup failed, exiting', sanitizeError(error));
    markNotReady('startup failed');
    process.exit(1);
  });
