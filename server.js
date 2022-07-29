const { createServer } = require('node:http');
const { parse } = require('node:url');
const cluster = require('node:cluster');
const { cpus } = require('node:os');
const process = require('node:process');

const next = require('next');

const numCPUs = cpus().length;
const hostname = 'localhost';
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ hostname, port });
const handle = app.getRequestHandler();

const startServer = () =>
  createServer(async (req, res) => {
    try {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url, true);

      // Debug info
      console.debug(
        `ℹ️ Handling ${parsedUrl.path} via ${cluster?.worker?.process?.pid}`,
      );

      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  console.log(`Worker ${process.pid} is starting`);

  app
    .prepare()
    .then(() => startServer())
    .catch((err) => {
      console.error('App preparation failed with', err);
    });
}
