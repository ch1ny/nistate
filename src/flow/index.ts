import { produce } from 'immer';
import type { DeepReadonly } from 'metypes';

export interface SubscriberProcessor<T extends Record<string, any>, S = T> {
  (state: T): S | T;
}

interface Subscriber<T extends Record<string, any>, S> {
  isEqual: (prev: S, next: S) => boolean;
  prev: S;
  callback: (next: S) => any;
  processor: SubscriberProcessor<T, S>;
}

export class Flow<T extends Record<string, any>> {
  protected _disposed: boolean = false;
  protected _data: T;

  private _watchers: Map<object, Subscriber<T, any>> = new Map();

  constructor(initial: T | (() => T)) {
    const initialValue = typeof initial === 'function' ? initial() : initial;
    this._data = produce(initialValue, () => {});
  }

  getState() {
    if (this._disposed) {
      throw new Error('[nistate][throw] Flow has been disposed.');
    }

    return this._data as DeepReadonly<T>;
  }

  get data() {
    return this.getState();
  }

  update(recipe: (draft: T) => void) {
    if (this._disposed)
      throw new Error('[nistate][throw] Flow has been disposed.');

    this._data = produce(this._data, recipe);

    this.postUpdate();
  }

  private postUpdate() {
    const keys = this._watchers.keys();
    for (const key of keys) {
      const { callback, isEqual, prev, processor } = this._watchers.get(key)!;
      const next = processor(this._data);
      if (!isEqual(prev, next)) {
        callback(next);
      }
      this._watchers.set(key, {
        callback,
        isEqual,
        prev: next,
        processor,
      });
    }
  }

  watch<S = T>(
    processor: SubscriberProcessor<T, S>,
    callback: (next: S) => any,
    isEqual: (prev: S, next: S) => boolean,
    options?: {
      instant?: boolean;
    },
  ) {
    if (this._disposed)
      throw new Error('[nistate][throw] Flow has been disposed.');

    const unwatchKey = Object.create(null);

    const prev = processor(this._data);

    this._watchers.set(unwatchKey, {
      callback,
      isEqual,
      prev,
      processor,
    });

    if (options?.instant) callback(prev as S);

    const unwatch = () => {
      if (this._disposed) return false;

      this._watchers.delete(unwatchKey);
    };

    return unwatch;
  }

  dispose() {
    if (this._disposed) return;

    this._disposed = true;
    // @ts-ignore
    this._watchers = null;
    // @ts-ignore
    this._data = null;
  }
}
