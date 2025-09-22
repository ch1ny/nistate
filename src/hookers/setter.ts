import type { Flow } from 'nistate/flow';
import { useLatest } from 'nistate/hooks';
import { useCallback } from 'react';

export type UseSetter<T extends Record<string, any>> = () => (
  recipe: ((draft: T) => void) | Partial<T>,
) => void;

export default function getUseSetter<T extends Record<string, any>>(
  useFlow: () => Flow<T>,
): UseSetter<T> {
  return function useSetter() {
    const flow = useLatest(useFlow());

    const setter = useCallback((recipe: ((draft: T) => void) | Partial<T>) => {
      if (typeof recipe === 'function') {
        return flow.current.update(recipe);
      } else {
        return flow.current.update((draft) => {
          Object.keys(recipe).forEach((key: keyof T) => {
            const value = recipe[key];
            draft[key] = value!; // 这里的 ！是为了过类型检查，实际可能为 undefined
          });
        });
      }
    }, []);

    return setter;
  };
}
