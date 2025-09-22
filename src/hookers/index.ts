import type { Flow } from 'nistate/flow';
import type { ProviderHooks } from 'nistate/types';
import { useContext } from 'react';
import getUseGetter from './getter';
import getUseSetter from './setter';
import getUseWatch from './watch';

export default function hookers<T extends Record<string, any>>(
  Context: React.Context<Flow<T>>,
): ProviderHooks<T> {
  const useFlow = () => useContext(Context);

  const useGetter = getUseGetter(useFlow);
  const useSetter = getUseSetter(useFlow);
  const useWatch = getUseWatch(useFlow);

  return {
    useGetter,
    useSetter,
    useWatch,
  };
}
