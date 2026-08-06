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

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = Number(process.env.PORT) || 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();
// cannot import from next.config.mjs because this will break env load
const CACHE_CONTROL_HEADER = 'x-cache-control';

// allows us to override cache-control header
const overrideSetHeader = (res) => {
  const setHeader = res.setHeader;
  let cacheControlOverwritten = false;
  res.setHeader = function (header, value) {
    if (header.toLowerCase() === CACHE_CONTROL_HEADER) {
      cacheControlOverwritten = true;

      return setHeader.call(this, 'Cache-Control', value);
    }

    if (header.toLowerCase() === 'cache-control' && cacheControlOverwritten) {
      return this;
    }

    return setHeader.call(this, header, value);
  };
};

// eslint-disable-next-line @typescript-eslint/no-floating-promises
app.prepare().then(async () => {
  // checks are kicked off in next.config.mjs; a broken config must exit here,
  // before listen, so the pod never passes readiness
  if (process.env.RUN_STARTUP_CHECKS === 'true') {
    await Promise.all([
      getRPCChecks(),
      getValidationFileChecks(),
      getManifestFileChecks(),
    ]);
  }

  const server = createServer(async (req, res) => {
    // Be sure to pass `true` as the second argument to `url.parse`.
    // This tells it to parse the query portion of the URL.
    const parsedUrl = parse(req.url, true);

    overrideSetHeader(res);

    await handle(req, res, parsedUrl);
  })
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.debug(`> Ready on http://${hostname}:${port}`);
    });
  // prevents malicious client from slowly sending headers and rest of request
  server.headersTimeout = 10_000;
  server.requestTimeout = 30_000;
  server.maxHeadersCount = 50;

  // OpenBao secret-rotation
  registerShutdownSignals(server);
  registerSecretsRotationRestart(server);
});
