type EventMap = Record<string, (...args: any[]) => void>;

export class EventEmitter<Events extends EventMap> {
  private listeners = new Map<keyof Events, Set<(...args: any[]) => void>>();

  on<Event extends keyof Events>(event: Event, listener: Events[Event]) {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(listener);
  }
  off<Event extends keyof Events>(event: Event, listener: Events[Event]) {
    let set = this.listeners.get(event);
    set?.delete(listener);
  }

  emit<Event extends keyof Events>(
    event: Event,
    ...args: Parameters<Events[Event]>
  ) {
    let set = this.listeners.get(event);
    if (!set) {
      return;
    }
    for (const listener of set.values()) {
      listener(...args);
    }
  }
}
