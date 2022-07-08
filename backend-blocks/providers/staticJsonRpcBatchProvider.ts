import { JsonRpcBatchProvider } from '@ethersproject/providers';
import { Network } from '@ethersproject/networks';
import { defineReadOnly } from '@ethersproject/properties';
import { Logger } from '@ethersproject/logger';

/*
 * is based on
 * https://github.com/ethers-io/ethers.js/blob/master/packages/providers/src.ts/url-json-rpc-provider.ts#L28
 */

const logger = new Logger('StaticJsonRpcBatchProvider/1.0');

// ❗️ Same as in lido-js-sdk
export class StaticJsonRpcBatchProvider extends JsonRpcBatchProvider {
  async detectNetwork(): Promise<Network> {
    let network = this.network;
    if (network == null) {
      network = await super.detectNetwork();

      if (!network) {
        logger.throwError(
          'no network detected',
          Logger.errors.UNKNOWN_ERROR,
          {},
        );
      }

      // If still not set, set it
      if (this._network == null) {
        // A static network does not support "any"
        defineReadOnly(this, '_network', network);

        this.emit('network', network, null);
      }
    }
    return network;
  }
}
