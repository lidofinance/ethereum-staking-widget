import { setImmediate } from 'node:timers/promises';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { WalletAdapterArgs } from 'reef-knot/types';
import {
  ApiController,
  CoreHelperUtil,
  EventsController,
  ModalController,
  OptionsController,
  RouterController,
} from '@reown/appkit-controllers';
import { OATH_WALLET, OathWallet } from '../oath-wallet';

const mocks = vi.hoisted(() => ({ connect: vi.fn() }));
vi.mock('wagmi/connectors', () => ({
  walletConnect: Object.assign(() => () => ({ connect: mocks.connect }), {
    type: 'walletConnect',
  }),
}));

afterEach(() => vi.restoreAllMocks());

describe('Oath presentation with installed AppKit controllers', () => {
  it.each([false, true])(
    'keeps Oath on modal reopen and releases routing after rejection (mobile=%s)',
    async (mobile) => {
      vi.spyOn(ApiController, 'prefetch').mockResolvedValue([]);
      vi.spyOn(CoreHelperUtil, 'isMobile').mockReturnValue(mobile);
      vi.spyOn(EventsController, 'sendEvent').mockImplementation(
        () => undefined,
      );
      const originalManualControl = OptionsController.state.manualWCControl;
      OptionsController.setManualWCControl(true);
      const rejection = new Error('Pairing cancelled');
      mocks.connect.mockImplementationOnce(async () => {
        await ModalController.open();
        await setImmediate();
        expect(RouterController.state.view).toBe('ConnectingWalletConnect');
        expect(RouterController.state.data?.wallet?.id).toBe(OATH_WALLET.id);

        await ModalController.open();
        await setImmediate();
        expect(RouterController.state.view).toBe('ConnectingWalletConnect');
        expect(RouterController.state.data?.wallet?.id).toBe(OATH_WALLET.id);
        ModalController.close();
        throw rejection;
      });
      const wallet = OathWallet({
        walletconnectProjectId: 'test-project',
      } as WalletAdapterArgs);
      const connector = wallet.createConnectorFn(
        {} as Parameters<typeof wallet.createConnectorFn>[0],
      );
      try {
        await expect(connector.connect()).rejects.toBe(rejection);
        await ModalController.open();
        await setImmediate();
        expect(RouterController.state.view).toBe(
          mobile ? 'AllWallets' : 'ConnectingWalletConnectBasic',
        );
        expect(RouterController.state.data).toBeUndefined();
      } finally {
        ModalController.close();
        OptionsController.setManualWCControl(originalManualControl);
      }
    },
  );
});
