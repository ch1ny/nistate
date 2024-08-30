const ACCESS = Symbol();

export function shadow<T extends Record<string, any>>(obj: T) {
  const shadow = new Proxy(obj, {
    get(target, p) {
      return target[p as keyof T];
    },
    set(target, p, newValue, receiver) {
      if (
        newValue?.access === ACCESS &&
        Object.prototype.hasOwnProperty.call(newValue, 'value')
      ) {
        return Reflect.set(target, p, newValue.value, receiver);
      }

      return true;
    },
  });

  return [
    shadow,
    function setData<S extends keyof T>(key: S, value: T[S]) {
      // @ts-ignore
      shadow[key] = {
        access: ACCESS,
        value,
      };
    },
  ] as const;
}
