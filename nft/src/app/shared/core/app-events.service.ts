import { Injectable } from '@angular/core';

type EventCallback = (...args: unknown[]) => void;

@Injectable({
  providedIn: 'root',
})
export class AppEventsService {
  /** Shared instance for pre-Angular bootstrap code. */
  static readonly shared = new AppEventsService();

  private readonly callbacks: Record<string, EventCallback[]> = {};

  on(eventName: string, callback: EventCallback): void {
    if (!this.callbacks[eventName]) {
      this.callbacks[eventName] = [];
    }
    this.callbacks[eventName].push(callback);
  }

  off(eventName: string, callback: EventCallback): void {
    const list = this.callbacks[eventName];
    if (!list) return;
    const index = list.indexOf(callback);
    if (index >= 0) {
      list.splice(index, 1);
    }
  }

  trigger(eventName: string, ...args: unknown[]): void {
    const list = this.callbacks[eventName];
    if (!list?.length) return;
    for (const callback of list) {
      callback(...args);
    }
  }
}
