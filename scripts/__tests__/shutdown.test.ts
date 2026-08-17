import { mkdtempSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { registerSecretsRotationRestart } from '../shutdown.mjs';

const CONTENT_V1 = 'export PROVIDER_URL="v1"\n';
const CONTENT_V2 = 'export PROVIDER_URL="v2"\n';

const WATCH_INTERVAL_MS = 20;

// fs.watchFile uses real stat polling. Give it time to take its initial
// snapshot before changing the file, otherwise the first update can be missed.
const waitForWatchToStart = async (): Promise<void> => {
  await new Promise((resolve) => {
    setTimeout(resolve, WATCH_INTERVAL_MS * 2);
  });
};

const waitFor = async (
  assertion: () => void,
  timeoutMs = 3_000,
): Promise<void> => {
  const deadline = Date.now() + timeoutMs;

  for (;;) {
    try {
      assertion();
      return;
    } catch (error) {
      if (Date.now() > deadline) {
        throw error;
      }

      await new Promise((resolve) => {
        setTimeout(resolve, 25);
      });
    }
  }
};

// Mirror the OpenBao agent's atomic update: replace the file with a new inode.
const atomicWrite = (path: string, content: string): void => {
  const tmp = `${path}.tmp`;

  writeFileSync(tmp, content);
  renameSync(tmp, path);
};

type CloseCallback = (error?: Error) => void;

type TestServer = {
  close: (callback: CloseCallback) => void;
};

// type SignalHandler = () => void;

describe('registerSecretsRotationRestart', () => {
  let dir: string;
  let file: string;
  let stopWatch: (() => void) | null = null;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'secrets-rotation-'));
    file = join(dir, 'app');
    process.env.SECRETS_FILE = file;

    vi.spyOn(console, 'info').mockImplementation(() => undefined);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    stopWatch?.();
    stopWatch = null;

    rmSync(dir, {
      recursive: true,
      force: true,
    });

    delete process.env.SECRETS_FILE;
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('is a no-op when the default secrets file is absent', () => {
    delete process.env.SECRETS_FILE;

    const server: TestServer = {
      close: vi.fn(),
    };

    stopWatch = registerSecretsRotationRestart(server, {
      intervalMs: WATCH_INTERVAL_MS,
    });

    expect(server.close).not.toHaveBeenCalled();
    expect(console.info).not.toHaveBeenCalled();
  });

  it('throws when SECRETS_FILE is explicitly set but unreadable', () => {
    process.env.SECRETS_FILE = join(dir, 'missing');

    const server: TestServer = {
      close: vi.fn(),
    };

    expect(() => {
      registerSecretsRotationRestart(server);
    }).toThrow();
  });

  it('closes the server and exits 0 after an atomic content change', async () => {
    writeFileSync(file, CONTENT_V1);

    const exit = vi.fn();

    const server: TestServer = {
      close: vi.fn((callback: CloseCallback) => {
        callback();
      }),
    };

    stopWatch = registerSecretsRotationRestart(server, {
      intervalMs: WATCH_INTERVAL_MS,
      exit,
    });

    await waitForWatchToStart();
    atomicWrite(file, CONTENT_V2);

    await waitFor(() => {
      expect(exit).toHaveBeenCalledWith(0);
    });

    expect(server.close).toHaveBeenCalledTimes(1);
  });

  it('still exits 0 when server.close reports an error', async () => {
    writeFileSync(file, CONTENT_V1);

    const exit = vi.fn();

    const server: TestServer = {
      close: vi.fn((callback: CloseCallback) => {
        callback(new Error('close failed'));
      }),
    };

    stopWatch = registerSecretsRotationRestart(server, {
      intervalMs: WATCH_INTERVAL_MS,
      exit,
    });

    await waitForWatchToStart();
    atomicWrite(file, CONTENT_V2);

    await waitFor(() => {
      expect(exit).toHaveBeenCalledWith(0);
    });

    expect(console.error).toHaveBeenCalled();
  });

  it('force-exits when server.close hangs', async () => {
    writeFileSync(file, CONTENT_V1);

    const exit = vi.fn();

    const server: TestServer = {
      close: vi.fn(() => undefined),
    };

    stopWatch = registerSecretsRotationRestart(server, {
      intervalMs: WATCH_INTERVAL_MS,
      forceExitMs: 50,
      exit,
    });

    await waitForWatchToStart();
    atomicWrite(file, CONTENT_V2);

    await waitFor(() => {
      expect(exit).toHaveBeenCalledWith(0);
    });

    expect(console.error).toHaveBeenCalled();
  });

  it('does not restart when the file is replaced with identical content', async () => {
    writeFileSync(file, CONTENT_V1);

    const exit = vi.fn();

    const server: TestServer = {
      close: vi.fn(),
    };

    stopWatch = registerSecretsRotationRestart(server, {
      intervalMs: WATCH_INTERVAL_MS,
      exit,
    });

    await waitForWatchToStart();
    atomicWrite(file, CONTENT_V1);

    await new Promise((resolve) => {
      setTimeout(resolve, 250);
    });

    expect(server.close).not.toHaveBeenCalled();
    expect(exit).not.toHaveBeenCalled();
  });

  it('survives a delete and recreate window', async () => {
    writeFileSync(file, CONTENT_V1);

    const exit = vi.fn();

    const server: TestServer = {
      close: vi.fn((callback: CloseCallback) => {
        callback();
      }),
    };

    stopWatch = registerSecretsRotationRestart(server, {
      intervalMs: WATCH_INTERVAL_MS,
      exit,
    });

    await waitForWatchToStart();

    rmSync(file);

    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });

    expect(exit).not.toHaveBeenCalled();

    writeFileSync(file, CONTENT_V2);

    await waitFor(() => {
      expect(exit).toHaveBeenCalledWith(0);
    });

    expect(server.close).toHaveBeenCalledTimes(1);
  });
});
