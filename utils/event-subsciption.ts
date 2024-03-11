export class EventSubsciption {
  private subscribers: (() => void)[] = [];

  fire = () => {
    for (const subscriber of this.subscribers) {
      subscriber();
    }
  };

  subscribe = (fn: () => void) => {
    this.subscribers.push(fn);
    return () => {
      this.subscribers.splice(this.subscribers.indexOf(fn), 1);
    };
  };
}
