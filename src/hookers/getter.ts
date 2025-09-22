import type { DeepReadonly } from 'metypes';
import type { Flow } from 'nistate/flow';
import { useLatest } from 'nistate/hooks';
import { useCallback } from 'react';

export type UseGetter<T extends Record<string, any>> =
  () => () => DeepReadonly<T>;

export default function getUseGetter<T extends Record<string, any>>(
  useFlow: () => Flow<T>,
): UseGetter<T> {
  return function useGetter() {
    const flow = useLatest(useFlow());

    const getter = useCallback(() => {
      return flow.current.getState();
    }, []);

    return getter;
  };
}
