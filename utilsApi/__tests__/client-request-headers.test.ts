import type { NextApiRequest } from 'next';

import {
  CLIENT_IP_HEADER,
  CLIENT_REFERER_HEADER,
  CLIENT_USER_AGENT_HEADER,
  getClientIp,
  getClientRequestHeaders,
} from '../client-request-headers';

const makeReq = (
  headers: Record<string, string | string[]> = {},
  remoteAddress?: string,
) => ({ headers, socket: { remoteAddress } }) as unknown as NextApiRequest;

describe('getClientIp', () => {
  it('reads cf-connecting-ip, not the socket peer', () => {
    const req = makeReq({ 'cf-connecting-ip': '52.8.121.91' }, '172.21.0.1');
    expect(getClientIp(req)).toBe('52.8.121.91');
  });

  it('accepts an IPv6 cf-connecting-ip', () => {
    const req = makeReq({ 'cf-connecting-ip': '2a0c:59c0:1::1061' });
    expect(getClientIp(req)).toBe('2a0c:59c0:1::1061');
  });

  it('unwraps an IPv4-mapped address and takes the first list entry', () => {
    const req = makeReq({ 'cf-connecting-ip': '::ffff:94.66.119.23, 1.2.3.4' });
    expect(getClientIp(req)).toBe('94.66.119.23');
  });

  it('has no fallback to the socket peer, which every user shares', () => {
    expect(getClientIp(makeReq({}, '127.0.0.1'))).toBeUndefined();
    expect(
      getClientIp(makeReq({ 'cf-connecting-ip': 'not-an-ip' }, '127.0.0.1')),
    ).toBeUndefined();
  });

  it('ignores x-forwarded-for, which the client controls', () => {
    const req = makeReq({ 'x-forwarded-for': '1.2.3.4' });
    expect(getClientIp(req)).toBeUndefined();
  });
});

describe('getClientRequestHeaders', () => {
  it('forwards ip, user-agent and referer', () => {
    const req = makeReq({
      'cf-connecting-ip': '52.8.121.91',
      'user-agent': 'Java-http-client/25.0.4',
      referer: 'https://stvaults.lido.fi/',
    });

    expect(getClientRequestHeaders(req)).toEqual({
      [CLIENT_IP_HEADER]: '52.8.121.91',
      [CLIENT_USER_AGENT_HEADER]: 'Java-http-client/25.0.4',
      [CLIENT_REFERER_HEADER]: 'https://stvaults.lido.fi/',
    });
  });

  it('omits headers the client did not send', () => {
    const req = makeReq({ 'cf-connecting-ip': '52.8.121.91' });

    expect(getClientRequestHeaders(req)).toEqual({
      [CLIENT_IP_HEADER]: '52.8.121.91',
    });
  });

  it('strips non-printable characters and caps the length', () => {
    const req = makeReq({ 'user-agent': `boté\u0001${'a'.repeat(600)}` });
    const ua = getClientRequestHeaders(req)[CLIENT_USER_AGENT_HEADER];

    expect(ua.startsWith('bota')).toBe(true);
    expect(ua).toHaveLength(512);
  });

  it('omits a value that is empty after sanitizing', () => {
    const req = makeReq({ 'user-agent': 'éé' });

    expect(getClientRequestHeaders(req)).toEqual({});
  });
});
