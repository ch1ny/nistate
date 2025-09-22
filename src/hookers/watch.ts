import { shallowEqual } from 'kira-utils';
import type { Flow, SubscriberProcessor } from 'nistate/flow';
import { useMemoizedFn } from 'nistate/hooks';
import { useEffect, useState } from 'react';

export type UseWatch<T extends Record<string, any>> = <S = T>(
  processor?: SubscriberProcessor<T, S>,
  deps?: any[],
  isEqual?: (prev: S, next: S) => boolean,
) => S;

export default function getUseWatch<T extends Record<string, any>>(
  useFlow: () => Flow<T>,
): UseWatch<T> {
  return function useWatch<S = T>(
    processor: SubscriberProcessor<T, S> = (state) => state,
    deps: any[] = [],
    isEqual: (prev: S, next: S) => boolean = shallowEqual,
  ) {
    const flow = useFlow();

    const memoizedProcessor = useMemoizedFn(processor);
    const memoizedIsEqual = useMemoizedFn(isEqual);

    const [state, setState] = useState<S>(
      () => memoizedProcessor(flow.getState() as T) as S,
    );

    useEffect(() => {
      const unwatch = flow.watch(
        memoizedProcessor,
        (next) => setState(() => next),
        memoizedIsEqual,
        {
          instant: true,
        },
      );

      return () => {
        unwatch();
      };
    }, [flow, ...deps]);

    return state;
  };
}
