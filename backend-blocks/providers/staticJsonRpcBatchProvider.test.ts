import { CHAINS } from '@lido-sdk/constants';
import { StaticJsonRpcBatchProvider } from './staticJsonRpcBatchProvider';

describe('StaticJsonRpcBatchProvider', () => {
  test('should return a provider instance', () => {
    const url = '/api/rpc';
    const provider = new StaticJsonRpcBatchProvider(url, CHAINS.Mainnet);

    expect(provider).toBeInstanceOf(Object);
    expect(provider.connection.url).toBe(url);
  });

  test('should detect network', async () => {
    const url = '/api/rpc';
    const chainId = CHAINS.Mainnet;
    const provider = new StaticJsonRpcBatchProvider(url, chainId);

    const network = await provider.detectNetwork();

    expect(network).toBeInstanceOf(Object);
    expect(network.chainId).toBe(chainId);
  });

  test('should cache network', async () => {
    const url = '/api/rpc';
    const chainId = CHAINS.Mainnet;
    const provider = new StaticJsonRpcBatchProvider(url, chainId);

    jest.spyOn(provider, 'network', 'get').mockReturnValue(null as any);

    const sendMock = jest
      .spyOn(provider, 'send')
      .mockReturnValue(chainId as any);

    expect(sendMock).toHaveBeenCalledTimes(0);

    await provider.detectNetwork();
    expect(sendMock).toHaveBeenCalledTimes(1);

    await provider.detectNetwork();
    expect(sendMock).toHaveBeenCalledTimes(1);
  });

  test('should throw an error if network cannot be detected', async () => {
    const url = '/api/rpc';
    const provider = new StaticJsonRpcBatchProvider(url);

    jest.spyOn(provider, 'network', 'get').mockReturnValue(null as any);
    jest.spyOn(provider, '_uncachedDetectNetwork').mockReturnValue(null as any);

    await expect(provider.detectNetwork()).rejects.toThrowError();
  });

  test('should detect network if chainId is not passed', async () => {
    const url = '/api/rpc';
    const chainId = CHAINS.Mainnet;
    const provider = new StaticJsonRpcBatchProvider(url);

    jest.spyOn(provider, 'network', 'get').mockReturnValue(null as any);
    jest.spyOn(provider, 'send').mockReturnValue(chainId as any);

    const network = await provider.detectNetwork();
    expect(network.chainId).toBe(chainId);
  });
});
