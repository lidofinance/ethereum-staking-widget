/* eslint-disable @typescript-eslint/no-var-requires */
const cluster = require('node:cluster');
const process = require('node:process');
const { cpus } = require('node:os');
/* eslint-enable @typescript-eslint/no-var-requires */
const numCPUs = cpus().length;

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);
  cluster.setupPrimary({
    exec: require.resolve('.bin/next'),
    args: ['start', ...process.argv.slice(2)],
    stdio: 'inherit',
    shell: true,
  });

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`, { code, signal });
  });
}
