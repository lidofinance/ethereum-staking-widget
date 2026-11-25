type Subscriber = () => void | boolean | Promise<void | boolean>;

export class EventSubscription {
  private subscribers: Subscriber[] = [];

  // Wait for the attempts, including asynchronous validation. With no form
  // subscribed there is nothing to retry.
  fire = async (): Promise<boolean> => {
    const results = await Promise.all(this.subscribers.map(async (fn) => fn()));
    return results.length > 0 && results.every((result) => result !== false);
  };

  subscribe = (fn: Subscriber) => {
    this.subscribers.push(fn);
    return () => {
      const index = this.subscribers.indexOf(fn);
      if (index !== -1) this.subscribers.splice(index, 1);
    };
  };
}
