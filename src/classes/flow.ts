import { debugThrow, shadow } from 'nistate/common';

type SetStateArg<T extends Record<string, any>> =
  | Partial<T>
  | ((state: T) => Partial<T>);

export interface SubscriberProcessor<T extends Record<string, any>, S = T> {
  (state: T): S | T;
}

interface Subscriber<S> {
  isEqual: (prev: S, next: S) => boolean;
  prev: S;
  callback: (next: S) => any;
}

export class Flow<T extends Record<string, any>> {
  protected _disposed: boolean = false;
  protected data: T;

  private setData: <S extends keyof T>(key: S, value: T[S]) => void;
  private _subscribers: Map<SubscriberProcessor<T, any>, Subscriber<any>> =
    new Map();
  // private _initialState: T;

  constructor(initialValue: T) {
    const [proxy, setData] = shadow(initialValue);
    this.data = proxy;
    this.setData = setData;
    // this._initialState = {
    //   ...initialValue,
    // };
  }

  setState(arg: SetStateArg<T>) {
    if (this._disposed) debugThrow('Flow has been disposed.');

    const nextPartialState = typeof arg === 'function' ? arg(this.data) : arg;

    for (const key in nextPartialState) {
      if (Object.prototype.hasOwnProperty.call(nextPartialState, key)) {
        const value = nextPartialState[key]!;
        this.setData(key, value);
      }
    }

    const processors = this._subscribers.keys();
    for (const processor of processors) {
      const { callback, isEqual, prev } = this._subscribers.get(processor)!;
      const next = processor(this.data);
      if (!isEqual(prev, next)) {
        callback(next);
      }
      this._subscribers.set(processor, {
        callback,
        isEqual,
        prev: next,
      });
    }
  }

  getState() {
    if (this._disposed) {
      debugThrow('Flow has been disposed.');
      return {} as T;
    }

    return this.data;
  }

  subscribe<S = T>(
    processor: SubscriberProcessor<T, S>,
    callback: (next: S) => any,
    isEqual: (prev: S, next: S) => boolean,
    options?: {
      instant?: boolean;
    },
  ) {
    if (this._disposed) return debugThrow('Flow has been disposed.');

    if (this._subscribers.has(processor))
      return debugThrow('Subscriber function has been registered.');

    const prev = processor(this.data);

    this._subscribers.set(processor, {
      callback,
      isEqual,
      prev,
    });

    if (options?.instant) callback(prev as S);
  }

  unsubscribe<S>(processor: SubscriberProcessor<T, S>) {
    if (this._disposed) {
      // debugThrow('Flow has been disposed.');
      return false;
    }

    return this._subscribers.delete(processor);
  }

  dispose() {
    if (this._disposed) return;

    this._disposed = true;
    // @ts-ignore
    this._subscribers = null;
    // @ts-ignore
    this.setData = null;
    // @ts-ignore
    this.data = null;
  }
}
