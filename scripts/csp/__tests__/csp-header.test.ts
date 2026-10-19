import { createServer, type ServerResponse } from 'node:http';
import { once } from 'node:events';

import { setCspHeaderOnHtml } from '../csp-header.mjs';

const CSP: [string, string] = ['Content-Security-Policy', "default-src 'self'"];

// The slice of ServerResponse the hook touches
class FakeResponse {
  headers = new Map<string, string>();
  writeHeadCalls: unknown[][] = [];

  getHeader(name: string) {
    return this.headers.get(name.toLowerCase());
  }
  setHeader(name: string, value: string) {
    this.headers.set(name.toLowerCase(), value);
    return this;
  }
  writeHead(...args: unknown[]) {
    this.writeHeadCalls.push(args);
    return this;
  }
}

const setup = (contentType?: string) => {
  const res = new FakeResponse();
  if (contentType) res.setHeader('Content-Type', contentType);
  const getCspHeader = vi.fn(() => CSP);
  setCspHeaderOnHtml(res as unknown as ServerResponse, getCspHeader);
  return { res, getCspHeader };
};

describe('setCspHeaderOnHtml', () => {
  it('sets the CSP header on an HTML response', () => {
    const { res } = setup('text/html; charset=utf-8');
    res.writeHead(200);
    expect(res.getHeader('Content-Security-Policy')).toBe(CSP[1]);
    // the original writeHead still runs with its arguments
    expect(res.writeHeadCalls).toEqual([[200]]);
  });

  it('owns the header: a value set earlier is replaced', () => {
    const { res } = setup('text/html');
    res.setHeader('Content-Security-Policy', 'stale policy');
    res.writeHead(200);
    expect(res.getHeader('Content-Security-Policy')).toBe(CSP[1]);
  });

  it.each([
    ['application/json; charset=utf-8'],
    ['application/javascript'],
    ['image/png'],
    [undefined],
  ])('leaves a %s response alone', (contentType) => {
    const { res, getCspHeader } = setup(contentType);
    res.writeHead(200);
    expect(res.getHeader('Content-Security-Policy')).toBeUndefined();
    // and does not even build the header
    expect(getCspHeader).not.toHaveBeenCalled();
  });

  it('reads the content type given to writeHead itself', () => {
    const { res } = setup();
    res.writeHead(404, 'Not Found', { 'Content-Type': 'text/html' });
    expect(res.getHeader('Content-Security-Policy')).toBe(CSP[1]);
    expect(res.writeHeadCalls).toEqual([
      [404, 'Not Found', { 'Content-Type': 'text/html' }],
    ]);
  });
});

// Node calls writeHead itself when headers are flushed by the first write or
// by end(), which is how Next sends a page: the hook must see that path too
describe('setCspHeaderOnHtml on a real ServerResponse', () => {
  const serve = async (
    respond: (res: ServerResponse) => void,
  ): Promise<Headers> => {
    const server = createServer((req, res) => {
      setCspHeaderOnHtml(res, () => CSP);
      respond(res);
    });
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('no port');
    try {
      const response = await fetch(`http://127.0.0.1:${address.port}/`);
      await response.arrayBuffer();
      return response.headers;
    } finally {
      server.close();
    }
  };

  it('sets the header on a page sent with setHeader and end', async () => {
    const headers = await serve((res) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end('<!doctype html>');
    });
    expect(headers.get('content-security-policy')).toBe(CSP[1]);
  });

  it('sets the header on a page sent through writeHead', async () => {
    const headers = await serve((res) => {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('not found');
    });
    expect(headers.get('content-security-policy')).toBe(CSP[1]);
  });

  it('leaves a JSON response without the header', async () => {
    const headers = await serve((res) => {
      res.setHeader('Content-Type', 'application/json');
      res.end('{}');
    });
    expect(headers.get('content-security-policy')).toBeNull();
  });
});
