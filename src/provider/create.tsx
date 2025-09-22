import { noop } from 'nistate/common';
import { Flow } from 'nistate/flow';
import hookers from 'nistate/hookers';
import { useMemoizedFn } from 'nistate/hooks';
import type {
  ProviderHooks,
  ProviderProps,
  ProviderType,
  ProviderUtils,
} from 'nistate/types';
import React, { memo, useEffect, useRef, useState } from 'react';

// Type Declarations
export function createProvider<T extends Record<string, any>>(
  arg: T | (() => T),
): [ProviderType<T>, ProviderHooks<T>, ProviderUtils<T>];

// Implementation
export function createProvider<T extends Record<string, any>>(
  arg: T | (() => T),
) {
  const createFlow = (initial: typeof arg = arg) => new Flow(initial);

  const Context = React.createContext<Flow<T>>(null as any);

  const ProviderHooks = hookers(Context);

  const Provider = memo((props: ProviderProps<T>) => {
    const { children, flow: outFlow, onFlow = noop } = props;

    const [flow, setFlow] = useState(() => outFlow);
    const innerFlowRef = useRef<Flow<T> | null>(null);

    useEffect(() => {
      if (outFlow) {
        setFlow((prevFlow) => {
          if (prevFlow === innerFlowRef.current) {
            prevFlow?.dispose();
            innerFlowRef.current = null;
          }

          return outFlow;
        });
      } else {
        setFlow((prevFlow) => {
          if (prevFlow === innerFlowRef.current) return prevFlow;
          const nextFlow = createFlow();
          innerFlowRef.current = nextFlow;
          return nextFlow;
        });
      }
    }, [outFlow]);

    const latestOnFlow = useMemoizedFn(onFlow);
    useEffect(() => {
      if (flow) latestOnFlow(flow);
    }, [flow]);

    if (!flow) return null;

    return <Context.Provider value={flow}>{children}</Context.Provider>;
  });

  const Utils = {
    createFlow,
  };

  return [Provider, ProviderHooks, Utils] as const;
}
