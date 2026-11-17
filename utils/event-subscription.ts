export class EventSubscription {
  private subscribers: (() => void | boolean)[] = [];

  // false when a subscriber declined the event (returned false)
  fire = (): boolean => {
    let handled = true;
    for (const subscriber of this.subscribers) {
      if (subscriber() === false) handled = false;
    }
    return handled;
  };

  subscribe = (fn: () => void | boolean) => {
    this.subscribers.push(fn);
    return () => {
      this.subscribers.splice(this.subscribers.indexOf(fn), 1);
    };
  };
}
