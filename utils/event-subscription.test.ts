import { EventSubscription } from './event-subscription';

describe('EventSubscription', () => {
  it('reports handled when no subscriber declines', () => {
    const event = new EventSubscription();
    const subscriber = vi.fn();
    event.subscribe(subscriber);

    expect(event.fire()).toBe(true);
    expect(subscriber).toHaveBeenCalledTimes(1);
  });

  it('reports not handled when a subscriber returns false', () => {
    const event = new EventSubscription();
    event.subscribe(() => false);

    expect(event.fire()).toBe(false);
  });
});
