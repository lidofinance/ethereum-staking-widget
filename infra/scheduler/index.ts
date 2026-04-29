import path from 'path';
import fs from 'fs-extra';
import fastify from 'fastify';
import { collectDefaultMetrics, Counter, Gauge, Registry } from 'prom-client';
import { spawn } from 'child_process';

const port = Number(process.env.SCHEDULER_PORT || 3001);
const intervalSeconds = Number(process.env.SCHEDULER_INTERVAL_SECONDS || 600);
const maxBuilds = Number(process.env.MAX_BUILDS || 12);
const distRoot = process.env.SCHEDULER_DIST_ROOT || '/app/dist';
const buildOutput = process.env.SCHEDULER_BUILD_OUTPUT || '/app/out';

const registry = new Registry();
collectDefaultMetrics({ register: registry, prefix: 'scheduler_' });

const buildSuccessTotal = new Counter({
  name: 'scheduler_build_success_total',
  help: 'Total number of successful builds',
  registers: [registry],
});

const buildFailureTotal = new Counter({
  name: 'scheduler_build_failure_total',
  help: 'Total number of failed builds',
  registers: [registry],
});

const lastBuildTimestamp = new Gauge({
  name: 'scheduler_last_build_timestamp',
  help: 'Last build completion timestamp (seconds since epoch)',
  registers: [registry],
});

const lastBuildDurationSeconds = new Gauge({
  name: 'scheduler_last_build_duration_seconds',
  help: 'Duration of the last build in seconds',
  registers: [registry],
});

const app = fastify({ logger: true });

app.get('/health', async () => ({ status: 'ok' }));
app.get('/metrics', async (_req, reply) => {
 await reply.header('Content-Type', registry.contentType);
  return registry.metrics();
});

const runCommand = (cmd: string, args: string[]) =>
  new Promise<void>((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: 'inherit',
      env: process.env,
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${cmd} exited with code ${code}`));
      }
    });
  });

const rotateBuilds = async () => {
  const entries = await fs.readdir(distRoot);
  const dirs = await Promise.all(
    entries
      .filter((name) => name !== 'current')
      .map(async (name) => {
        const fullPath = path.join(distRoot, name);
        const stat = await fs.stat(fullPath);
        return { name, fullPath, mtimeMs: stat.mtimeMs, isDir: stat.isDirectory() };
      }),
  );

  const buildDirs = dirs
    .filter((entry) => entry.isDir)
    .sort((a, b) => b.mtimeMs - a.mtimeMs);

  const toRemove = buildDirs.slice(maxBuilds);
  await Promise.all(toRemove.map((entry) => fs.remove(entry.fullPath)));
};

let buildInProgress = false;

const runBuild = async () => {
  if (buildInProgress) {
    app.log.warn('Build skipped: previous build still in progress');
    return;
  }

  buildInProgress = true;
  const startedAt = Date.now();

  try {
    await fs.ensureDir('/app/public/runtime');
    await fs.ensureDir(distRoot);
    await runCommand('yarn', ['build:static']);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const targetDir = path.join(distRoot, timestamp);

    await fs.remove(targetDir);
    await fs.copy(buildOutput, targetDir);

    const currentLink = path.join(distRoot, 'current');
    await fs.remove(currentLink);
    await fs.symlink(targetDir, currentLink);

    await rotateBuilds();

    buildSuccessTotal.inc();
  } catch (error) {
    buildFailureTotal.inc();
    app.log.error({ error }, 'Build failed');
  } finally {
    lastBuildTimestamp.set(Math.floor(Date.now() / 1000));
    lastBuildDurationSeconds.set((Date.now() - startedAt) / 1000);
    buildInProgress = false;
  }
};

app.listen({ port, host: '0.0.0.0' }).catch((error) => {
  app.log.error(error);
  process.exit(1);
});

void runBuild();
setInterval(runBuild, intervalSeconds * 1000);
