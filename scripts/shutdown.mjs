import { readFileSync, unwatchFile, watchFile } from 'node:fs';
import { sanitizeError } from './utils/sanitize-error.mjs';

const FORCE_EXIT_TIMEOUT_MS = 10_000;
const DEFAULT_SECRETS_FILE = '/vault/secrets/app';
const POLL_INTERVAL_MS = 10_000;

const closeServerAndExit = ({ server, reason, forceExitMs, exit }) => {
  let exited = false;

  const exitOnce = (code) => {
    if (exited) return;
    exited = true;
    exit(code);
  };

  console.info(reason);

  const forceExitTimer = setTimeout(() => {
    console.error(`Graceful close timed out after ${forceExitMs}ms, forcing exit`);
    exitOnce(0);
  }, forceExitMs);
  forceExitTimer.unref();

  try {
    server.close((error) => {
      clearTimeout(forceExitTimer);

      if (error) {
        console.error('Graceful server close failed', sanitizeError(error));
      }

      exitOnce(0);
    });
  } catch (error) {
    clearTimeout(forceExitTimer);
    console.error('Graceful server close failed', sanitizeError(error));
    exitOnce(0);
  }
};

/**
 * Options for secrets rotation restart.
 *
 * @typedef {Object} SecretsRotationOptions
 * @property {number} [intervalMs] File polling interval in milliseconds.
 * @property {number} [forceExitMs] Maximum time allowed for graceful shutdown.
 * @property {(code: number) => void} [exit] Process exit function. Injected in tests.
 */

/**
 * OpenBao rotation restart. Secrets arrive as an env-export file that the
 * chart's container command sources before exec; the agent sidecar keeps it
 * fresh via atomic rename but has no signal path into this container (no
 * shared PID namespace), so the app must detect rotation itself: poll the file
 * BY PATH (fs.watchFile — inotify would attach to the old inode and go silent
 * after the first rename) and restart-by-exit on a content change: close the
 * app gracefully and exit 0; `restartPolicy: Always` brings it back up and
 * the startup command re-sources the refreshed file.
 *
 * Path from SECRETS_FILE, default /vault/secrets/app. File absent at the
 * default path = no injector (local dev) → no-op; SECRETS_FILE set but
 * unreadable = broken deployment → throw. Returns a stop function (tests).
 */
/**
 * @param {{ close: (callback: (error?: Error) => void) => void }} server
 * @param {SecretsRotationOptions} [options]
 */
export const registerSecretsRotationRestart = (
  server,
  {
    intervalMs = POLL_INTERVAL_MS,
    forceExitMs = FORCE_EXIT_TIMEOUT_MS,
    exit = (code) => {
      process.exit(code);
    },
  } = {},
) => {
  const path = process.env.SECRETS_FILE ?? DEFAULT_SECRETS_FILE;

  let lastContent;
  try {
    lastContent = readFileSync(path, 'utf8');
  } catch (error) {
    if (process.env.SECRETS_FILE) throw error;
    return () => undefined;
  }

  console.info(`Watching secrets file ${path} for rotation`);

  let restarting = false;
  const restart = () => {
    if (restarting) return;
    restarting = true;

    closeServerAndExit({
      server,
      reason: 'Secrets file changed: rotated credentials, restarting to pick up new values',
      forceExitMs,
      exit,
    });
  };

  const listener = () => {
    let raw;
    try {
      raw = readFileSync(path, 'utf8');
    } catch (error) {
      // Transient (sidecar restart / delete+recreate window): retry ourselves —
      // watchFile won't re-fire for a stat it has already seen, so a failed read
      // here would otherwise strand the process on stale creds until the NEXT
      // rotation.
      console.warn(`Secrets file ${path} unreadable, retrying`, sanitizeError(error));
      setTimeout(listener, Math.min(intervalMs, 5_000)).unref();
      return;
    }

    if (raw === lastContent) return;
    lastContent = raw;
    restart();
  };

  watchFile(path, { interval: intervalMs }, listener).unref();
  return () => unwatchFile(path, listener);
};

// SIGTERM and SIGINT are normal process shutdown signals from the
// orchestrator or terminal. Close the HTTP server before exiting.
/**
 * @param {{ close: (callback: (error?: Error) => void) => void }} server
 * @param {ShutdownOptions} [options]
 */
export const registerShutdownSignals = (
  server,
  {
    forceExitMs = FORCE_EXIT_TIMEOUT_MS,
    exit = (code) => {
      process.exit(code);
    },
  } = {},
) => {
  let shuttingDown = false;

  const shutdown = (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;

    closeServerAndExit({
      server,
      reason: `Received ${signal}: shutting down`,
      forceExitMs,
      exit,
    });
  };

  process.once('SIGTERM', () => shutdown('SIGTERM'));
  process.once('SIGINT', () => shutdown('SIGINT'));
};
