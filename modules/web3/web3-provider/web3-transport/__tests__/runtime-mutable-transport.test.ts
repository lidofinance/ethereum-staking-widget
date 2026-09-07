import { vi } from 'vitest';
import {
  custom,
  http,
  InvalidParamsRpcError,
  MethodNotSupportedRpcError,
  type EIP1193Provider,
} from 'viem';
import { mainnet } from 'viem/chains';
// test-only import of wagmi's own pinned dependency (intentionally not a
// direct dep — a separate pin could drift from the copy wagmi actually runs):
// the WalletConnect rpcMap contract we quack for lives in this internal util,
// importing the real thing makes the test break loudly when a wagmi upgrade
// changes the contract
// eslint-disable-next-line import/no-extraneous-dependencies
import { extractRpcUrls } from '@wagmi/core';

import { runtimeMutableTransport } from '../runtime-mutable-transport';

type RequestFn = (args: {
  method: string;
  params?: unknown;
}) => Promise<unknown>;

const providerTransport = (request: RequestFn) =>
  custom({ request } as EIP1193Provider);

const setup = () => {
  const backendMock = vi.fn<RequestFn>(async () => 'backend');
  const publicMock = vi.fn<RequestFn>(async () => 'public');
  const [transport, setInjected] = runtimeMutableTransport([
    providerTransport(backendMock),
    providerTransport(publicMock),
  ]);
  const instance = transport({ chain: mainnet });
  return { backendMock, publicMock, instance, setInjected };
};

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});

describe('runtimeMutableTransport', () => {
  it('routes requests to the first main transport by default', async () => {
    const { backendMock, publicMock, instance } = setup();

    await expect(instance.request({ method: 'eth_blockNumber' })).resolves.toBe(
      'backend',
    );
    expect(backendMock).toHaveBeenCalledTimes(1);
    expect(publicMock).not.toHaveBeenCalled();
  });

  it('falls back to the next main transport on failure', async () => {
    const { backendMock, publicMock, instance } = setup();
    backendMock.mockRejectedValueOnce(new Error('backend down'));

    await expect(instance.request({ method: 'eth_blockNumber' })).resolves.toBe(
      'public',
    );
    expect(backendMock).toHaveBeenCalledTimes(1);
    expect(publicMock).toHaveBeenCalledTimes(1);
  });

  it('routes requests to the injected transport once set', async () => {
    const { backendMock, instance, setInjected } = setup();
    const walletMock = vi.fn<RequestFn>(async () => 'wallet');

    setInjected(providerTransport(walletMock));

    await expect(instance.request({ method: 'eth_blockNumber' })).resolves.toBe(
      'wallet',
    );
    expect(walletMock).toHaveBeenCalledTimes(1);
    expect(backendMock).not.toHaveBeenCalled();
  });

  it('falls back to main transports when the injected transport fails', async () => {
    const { backendMock, instance, setInjected } = setup();
    const walletMock = vi.fn<RequestFn>(async () => {
      throw new Error('wallet unavailable');
    });

    setInjected(providerTransport(walletMock));

    await expect(instance.request({ method: 'eth_blockNumber' })).resolves.toBe(
      'backend',
    );
    expect(walletMock).toHaveBeenCalled();
    expect(backendMock).toHaveBeenCalledTimes(1);
  });

  it('reverts to main transports when the injected transport is unset', async () => {
    const { backendMock, instance, setInjected } = setup();
    const walletMock = vi.fn<RequestFn>(async () => 'wallet');

    setInjected(providerTransport(walletMock));
    await instance.request({ method: 'eth_blockNumber' });

    setInjected(null);
    await expect(instance.request({ method: 'eth_blockNumber' })).resolves.toBe(
      'backend',
    );
    expect(backendMock).toHaveBeenCalledTimes(1);
    expect(walletMock).toHaveBeenCalledTimes(1);
  });

  it('memoizes the injected stack instead of rebuilding it per request', async () => {
    const { instance, setInjected } = setup();
    const walletMock = vi.fn<RequestFn>(async () => 'wallet');
    const walletFactory = vi.fn(providerTransport(walletMock));

    setInjected(walletFactory);
    await instance.request({ method: 'eth_blockNumber' });
    await instance.request({ method: 'eth_blockNumber' });
    await instance.request({ method: 'eth_blockNumber' });

    // one instantiation for the fallback value plus one per request by viem,
    // a per-request rebuild of the whole stack would at least double this
    expect(walletFactory.mock.calls.length).toBeLessThanOrEqual(4);
    expect(walletMock).toHaveBeenCalledTimes(3);
  });

  it('retries failing requests on the inner fallback layer only', async () => {
    const { backendMock, publicMock, instance } = setup();
    backendMock.mockRejectedValue(new Error('backend down'));
    publicMock.mockRejectedValue(new Error('public down'));

    await expect(
      instance.request({ method: 'eth_blockNumber' }),
    ).rejects.toThrow();

    // 1 initial try + 3 inner fallback retries; the outer wrapper must not
    // multiply them (a second retry layer would make it 16)
    expect(backendMock).toHaveBeenCalledTimes(4);
    expect(publicMock).toHaveBeenCalledTimes(4);
  });

  it.each([
    'eth_newFilter',
    'eth_getFilterChanges',
    'eth_sendTransaction',
    'eth_signTypedData_v4',
    'personal_sign',
    'eth_decrypt',
    'wallet_sendCalls',
    'eth_requestAccounts',
  ])('rejects %s without reaching any RPC', async (method) => {
    const { backendMock, publicMock, instance, setInjected } = setup();
    const walletMock = vi.fn<RequestFn>(async () => 'wallet');
    setInjected(providerTransport(walletMock));

    await expect(instance.request({ method })).rejects.toBeInstanceOf(
      MethodNotSupportedRpcError,
    );
    expect(walletMock).not.toHaveBeenCalled();
    expect(backendMock).not.toHaveBeenCalled();
    expect(publicMock).not.toHaveBeenCalled();
  });

  it.each([
    ['no filter', []],
    ['no address', [{ fromBlock: '0x1' }]],
    ['empty string address', [{ address: '' }]],
    ['empty array address', [{ address: [] }]],
  ])(
    'rejects eth_getLogs with %s before reaching any RPC',
    async (_, params) => {
      const { backendMock, instance } = setup();

      await expect(
        instance.request({ method: 'eth_getLogs', params }),
      ).rejects.toBeInstanceOf(InvalidParamsRpcError);
      expect(backendMock).not.toHaveBeenCalled();
    },
  );

  it('passes eth_getLogs with an address through', async () => {
    const { backendMock, instance } = setup();

    await instance.request({
      method: 'eth_getLogs',
      params: [{ address: '0x0000000000000000000000000000000000000001' }],
    });
    await instance.request({
      method: 'eth_getLogs',
      params: [{ address: ['0x0000000000000000000000000000000000000001'] }],
    });
    expect(backendMock).toHaveBeenCalledTimes(2);
  });

  it('exposes main transport urls to wagmi extractRpcUrls regardless of injected state', () => {
    const backendUrl = 'https://backend.example/rpc';
    const [transport, setInjected] = runtimeMutableTransport([
      http(backendUrl, { name: 'backend' }),
      http(undefined, { name: 'default' }),
    ]);
    const transports = { [mainnet.id]: transport };

    // WalletConnect builds its rpcMap from the first extracted url
    expect(extractRpcUrls({ chain: mainnet, transports })).toEqual([
      backendUrl,
      mainnet.rpcUrls.default.http[0],
    ]);

    setInjected(providerTransport(vi.fn<RequestFn>(async () => 'wallet')));
    expect(extractRpcUrls({ chain: mainnet, transports })[0]).toBe(backendUrl);
  });
});
