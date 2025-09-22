import type { Flow } from 'nistate/flow';
import type { UseGetter } from 'nistate/hookers/getter';
import type { UseSetter } from 'nistate/hookers/setter';
import type { UseWatch } from 'nistate/hookers/watch';

export type { UseGetter, UseSetter, UseWatch };

export interface ProviderProps<T extends Record<string, any>> {
  children?: React.ReactNode;
  flow?: Flow<T>;
  onFlow?: (flow: Flow<T>) => void;
}

export type ProviderType<T extends Record<string, any>> =
  React.MemoExoticComponent<
    (props: ProviderProps<T>) => React.JSX.Element | null
  >;

export type ProviderHooks<T extends Record<string, any>> = {
  useGetter: UseGetter<T>;
  useSetter: UseSetter<T>;
  useWatch: UseWatch<T>;
};

export type ProviderUtils<T extends Record<string, any>> = {
  createFlow: (initial?: T | (() => T)) => Flow<T>;
};
