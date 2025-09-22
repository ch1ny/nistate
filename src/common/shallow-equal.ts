/**
 * 浅比较两个对象是否相等
 * @param objA
 * @param objB
 * @param depth
 * @returns
 */
function shallowEqual(objA: any, objB: any, depth = 0): boolean {
  if (Object.is(objA, objB)) return true;

  if (objA === 0 && objB === 0) return true; // `Object.is(0, -0)` returns `false`

  if (
    typeof objA !== 'object' ||
    objA === null ||
    typeof objB !== 'object' ||
    objB === null
  ) {
    return false;
  }

  if (objA instanceof Map && objB instanceof Map) {
    if (objA.size !== objB.size) return false;

    for (const [key, valA] of objA) {
      if (!objB.has(key)) return false;
      const valB = objB.get(key);
      if (valA !== valB && (!depth || !shallowEqual(valA, valB, depth - 1)))
        return false;
    }
  }

  if (objA instanceof Set && objB instanceof Set) {
    if (objA.size !== objB.size) return false;

    for (const value of objA) {
      if (!objB.has(value)) return false;
    }
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (
      !Object.is(objA[key], objB[key]) &&
      (!depth || !shallowEqual(objA[key], objB[key], depth - 1))
    )
      return false;
  }

  return true;
}

shallowEqual.bindDepth = (depth: number) => {
  return function (objA: any, objB: any): boolean {
    return shallowEqual(objA, objB, depth);
  };
};

export default shallowEqual;
