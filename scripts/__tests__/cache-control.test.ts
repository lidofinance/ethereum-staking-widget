import { createServer } from 'node:http';
import type { OutgoingHttpHeaders, ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';

import {
  CACHE_CONTROL_HEADER,
  CACHE_CONTROL_VALUE,
  CACHE_CONTROL_ERROR_VALUE,
  overrideCacheControl,
} from '../cache-control.mjs';

// Response directives a cache acts on: RFC 9111 §5.2.2 plus RFC 5861.
// A misspelled directive (`s-max-age`) is silently ignored by every cache, and
// the e2e header test pins whatever this constant says, so spelling is checked
// here against the registry rather than against itself.
const KNOWN_DIRECTIVES = new Set([
  'public',
  'private',
  'no-cache',
  'no-store',
  'no-transform',
  'must-revalidate',
  'proxy-revalidate',
  'must-understand',
  'immutable',
  'max-age',
  's-maxage',
  'stale-while-revalidate',
  'stale-if-error',
]);

const VALUED_DIRECTIVES = new Set([
  'max-age',
  's-maxage',
  'stale-while-revalidate',
  'stale-if-error',
]);

const parseDirectives = (value: string) =>
  value.split(',').map((part) => {
    const [name, argument] = part.trim().split('=');
    return { name, argument };
  });

describe('page Cache-Control policy', () => {
  const directives = parseDirectives(CACHE_CONTROL_VALUE);

  it.each(directives)('uses a registered directive: $name', ({ name }) => {
    expect(KNOWN_DIRECTIVES.has(name)).toBe(true);
  });

  it.each(directives)(
    'gives $name a well-formed value',
    ({ name, argument }) => {
      if (VALUED_DIRECTIVES.has(name)) {
        expect(argument).toMatch(/^\d+$/);
      } else {
        expect(argument).toBeUndefined();
      }
    },
  );

  it('keeps the shared-cache lifetime that Cloudflare honours', () => {
    expect(directives.map((d) => d.name)).toContain('s-maxage');
  });

  it('names the override header in lowercase, as server.mjs compares it', () => {
    expect(CACHE_CONTROL_HEADER).toBe(CACHE_CONTROL_HEADER.toLowerCase());
  });
});

// Against a real server: the hook leans on how Node merges the headers passed
// to writeHead, so a fake response would only test its own assumptions.
type Respond = (res: ServerResponse) => void;

const serve = async (respond: Respond) => {
  const server = createServer((_req, res) => {
    overrideCacheControl(res);
    respond(res);
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;
  try {
    const response = await fetch(`http://127.0.0.1:${port}/`);
    await response.text();
    return response;
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
};

describe('overrideCacheControl', () => {
  it('promotes the override header to Cache-Control', async () => {
    const response = await serve((res) => {
      res.setHeader(CACHE_CONTROL_HEADER, CACHE_CONTROL_VALUE);
      res.end();
    });
    expect(response.headers.get('cache-control')).toBe(CACHE_CONTROL_VALUE);
    expect(response.headers.has(CACHE_CONTROL_HEADER)).toBe(false);
  });

  it('drops the Cache-Control Next sets after the override', async () => {
    const response = await serve((res) => {
      res.setHeader(CACHE_CONTROL_HEADER, CACHE_CONTROL_VALUE);
      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
      res.end();
    });
    expect(response.headers.get('cache-control')).toBe(CACHE_CONTROL_VALUE);
  });

  it('leaves Cache-Control alone on a response without the override', async () => {
    const response = await serve((res) => {
      res.setHeader('Cache-Control', 'private');
      res.end();
    });
    expect(response.headers.get('cache-control')).toBe('private');
  });

  it('passes other headers through', async () => {
    const response = await serve((res) => {
      res.setHeader('ETag', '"abc"');
      res.end();
    });
    expect(response.headers.get('etag')).toBe('"abc"');
  });

  it('keeps the policy on a successful response', async () => {
    const response = await serve((res) => {
      res.setHeader(CACHE_CONTROL_HEADER, CACHE_CONTROL_VALUE);
      res.writeHead(200);
      res.end();
    });
    expect(response.headers.get('cache-control')).toBe(CACHE_CONTROL_VALUE);
  });

  it.each([400, 404, 429, 500, 503])(
    'sends a %i as no-store despite the override',
    async (statusCode) => {
      const response = await serve((res) => {
        res.setHeader(CACHE_CONTROL_HEADER, CACHE_CONTROL_VALUE);
        // the implicit head Next relies on: statusCode, then end()
        res.statusCode = statusCode;
        res.end();
      });
      expect(response.status).toBe(statusCode);
      expect(response.headers.get('cache-control')).toBe(
        CACHE_CONTROL_ERROR_VALUE,
      );
    },
  );

  it('sends an error as no-store when nothing set Cache-Control', async () => {
    const response = await serve((res) => {
      res.writeHead(500);
      res.end();
    });
    expect(response.headers.get('cache-control')).toBe(
      CACHE_CONTROL_ERROR_VALUE,
    );
  });

  it.each([
    ['an object', { 'Cache-Control': CACHE_CONTROL_VALUE, 'X-Other': 'kept' }],
    ['a flat list', ['cache-control', CACHE_CONTROL_VALUE, 'X-Other', 'kept']],
  ])(
    'drops a Cache-Control passed to writeHead as %s on an error',
    async (_shape, headers) => {
      const response = await serve((res) => {
        res.writeHead(404, 'Not Found', headers as OutgoingHttpHeaders);
        res.end();
      });
      expect(response.status).toBe(404);
      expect(response.headers.get('cache-control')).toBe(
        CACHE_CONTROL_ERROR_VALUE,
      );
      expect(response.headers.get('x-other')).toBe('kept');
    },
  );

  it('keeps a Cache-Control passed to writeHead on a success', async () => {
    const response = await serve((res) => {
      res.writeHead(200, { 'Cache-Control': 'private' });
      res.end();
    });
    expect(response.headers.get('cache-control')).toBe('private');
  });

  it('declares the error policy as no-store', () => {
    expect(CACHE_CONTROL_ERROR_VALUE).toBe('no-store');
  });
});
