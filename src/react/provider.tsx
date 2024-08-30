import React, {
  memo,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { ReactFlow } from './extends';

export interface ProviderProps<T extends Record<string, any>> {
  Loading?: React.ComponentType<{
    refresh: () => Promise<ReactFlow<T> | undefined>;
  }>;
  Error?: React.ComponentType<{
    error: any;
    refresh: () => Promise<ReactFlow<T> | undefined>;
  }>;
  children?: React.ReactNode;
}

type InitialState<T extends Record<string, any>> =
  | T
  | Promise<T>
  | (() => T | Promise<T>);

export function createProvider<T extends Record<string, any>>(
  initialState: InitialState<T>,
) {
  const Context = React.createContext<ReactFlow<T> | null>(null);

  const Provider = memo((props: ProviderProps<T>) => {
    const { children, Loading = () => null, Error = () => null } = props;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);
    const [flow, setFlow] = useState<ReactFlow<T> | null>(null);

    const refresh = useCallback(async () => {
      setLoading(true);
      setError(null);
      setFlow(null);

      try {
        const resultPromise =
          typeof initialState === 'function' ? initialState() : initialState;
        const result = await resultPromise;
        const flow = new ReactFlow(result);
        setFlow(flow);

        return flow;
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    }, []);

    useEffect(() => {
      refresh();
    }, []);

    useEffect(
      () => () => {
        flow?.dispose();
      },
      [flow],
    );

    if (loading) return <Loading refresh={refresh} />;

    if (error) return <Error refresh={refresh} error={error} />;

    return <Context.Provider value={flow}>{children}</Context.Provider>;
  });

  const useSubscribe = function (...args: any[]) {
    const flow = useContext(Context)!;
    return flow.useSubscribe(...args);
  } as ReactFlow<T>['useSubscribe'];

  const usePicker = function (...args: any[]) {
    const flow = useContext(Context)!;
    return flow.usePicker(...args);
  } as ReactFlow<T>['usePicker'];

  return {
    Provider,
    useSubscribe,
    usePicker,
  };
}
