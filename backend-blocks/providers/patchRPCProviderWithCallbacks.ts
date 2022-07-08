import { JsonRpcProvider } from '@ethersproject/providers';
import { startTimer, toPromise } from '../metrics';
import { ChainID } from '../fetch';

export type PatchRPCProviderWithCallbacksParameters<
  P extends typeof JsonRpcProvider,
> = {
  Provider: P;
  onRequest?: (
    chainId: ChainID,
    url: string,
    method: string,
    params: any[],
  ) => unknown;
  onResponse?: (chainId: ChainID, url: string, elapsedTime: number) => unknown;
};

export const patchRPCProviderWithCallbacks = <
  P extends typeof JsonRpcProvider,
>({
  Provider,
  onRequest,
  onResponse,
}: PatchRPCProviderWithCallbacksParameters<P>) =>
  //
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  class extends Provider {
    async send(method: string, params: any[]) {
      const chainId = this._network.chainId;
      const url = this.connection.url;
      void toPromise(onRequest)(chainId, url, method, params);

      const timer = startTimer();

      const response = await super.send(method, params);

      const elapsedTime = timer();
      void toPromise(onResponse)(chainId, url, elapsedTime);

      return response;
    }
  };
