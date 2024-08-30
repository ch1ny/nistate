import { Flow, type SubscriberProcessor } from 'nistate/classes';
import { shallowEqual } from 'nistate/common';
import { useCallback, useEffect, useState } from 'react';

export class ReactFlow<T extends Record<string, any>> extends Flow<T> {
  useSubscribe<S = T>(
    processor: SubscriberProcessor<T, S> = (state) => state,
    isEqual: (prev: S, next: S) => boolean = shallowEqual,
  ) {
    const [state, setState] = useState<S>(
      () => processor(this.getState()) as S,
    );

    useEffect(() => {
      this.subscribe(processor, (next) => setState(next), isEqual);

      return () => {
        this.unsubscribe(processor);
      };
    }, [processor, isEqual]);

    const setFlowState = useCallback<(typeof this)['setState']>(
      (...args) => this.setState(...args),
      [],
    );

    return [state, setFlowState] as const;
  }

  /**
   *
   * @param initKeys 通过预声明需要的键值，减少初始化时的渲染次数
   * @returns
   */
  usePicker(initKeys?: (keyof T)[]) {
    const [_, setCache] = useState({});
    const [keySet] = useState<Set<keyof T>>(() => new Set(initKeys));

    const buildProcessor = useCallback(() => {
      return (flowData: T) => {
        const pickedData: Partial<T> = {};

        keySet.forEach((key) => {
          pickedData[key] = flowData[key];
        });

        return pickedData;
      };
    }, []);

    const [processor, setProcessor] = useState<
      SubscriberProcessor<T, Partial<T>>
    >(() => buildProcessor());

    useEffect(() => {
      this.subscribe(
        processor,
        () => {
          setCache({});
        },
        shallowEqual,
      );
    }, [processor]);

    const [proxy] = useState(
      new Proxy(this.data, {
        get(target, p) {
          const key = p as keyof T;
          if (!keySet.has(key)) {
            keySet.add(key);
            setProcessor(() => buildProcessor());
          }
          return target[key];
        },
      }),
    );

    const setFlowState = useCallback<(typeof this)['setState']>(
      (...args) => this.setState(...args),
      [],
    );

    return [proxy, setFlowState] as const;
  }
}
