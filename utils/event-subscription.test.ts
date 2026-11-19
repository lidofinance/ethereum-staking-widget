import { EventSubscription } from './event-subscription';

describe('EventSubscription', () => {
  it('reports handled when no subscriber declines', async () => {
    const event = new EventSubscription();
    const subscriber = vi.fn();
    event.subscribe(subscriber);

    await expect(event.fire()).resolves.toBe(true);
    expect(subscriber).toHaveBeenCalledTimes(1);
  });

  it('reports not handled when a subscriber returns false', async () => {
    const event = new EventSubscription();
    event.subscribe(() => false);

    await expect(event.fire()).resolves.toBe(false);
  });

  it('declines when the form is no longer subscribed', async () => {
    const event = new EventSubscription();
    const unsubscribe = event.subscribe(() => true);
    unsubscribe();
    await expect(event.fire()).resolves.toBe(false);
  });

  it('waits for an asynchronous subscriber and preserves a declined result', async () => {
    const event = new EventSubscription();
    let finish!: (value: boolean) => void;
    event.subscribe(
      () =>
        new Promise<boolean>((resolve) => {
          finish = resolve;
        }),
    );
    let settled = false;
    const pending = Promise.resolve(event.fire()).then((result) => {
      settled = true;
      return result;
    });
    await Promise.resolve();
    expect(settled).toBe(false);
    finish(false);
    await expect(pending).resolves.toBe(false);
  });
});
