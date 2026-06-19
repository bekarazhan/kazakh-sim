type Handler = (...args: unknown[]) => void;

export class EventBus {
  private listeners = new Map<string, Set<Handler>>();

  on(event: string, fn: Handler) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(fn);
  }

  off(event: string, fn: Handler) {
    this.listeners.get(event)?.delete(fn);
  }

  emit(event: string, ...args: unknown[]) {
    this.listeners.get(event)?.forEach(fn => fn(...args));
  }
}

export const bus = new EventBus();
