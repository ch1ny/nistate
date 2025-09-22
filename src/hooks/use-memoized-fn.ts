import { useCallback } from 'react';
import { useLatest } from './use-latest';

export function useMemoizedFn<Fn extends (...args: any[]) => any>(fn: Fn) {
  const latest = useLatest(fn);

  return useCallback((...args: any[]) => latest.current(...args), []) as Fn;
}
