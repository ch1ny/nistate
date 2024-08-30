export function shallowEqual(objA: any, objB: any): boolean {
  if (Object.is(objA, objB)) return true;

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

    for (const [key, val] of objA) {
      if (!objB.has(key) || objB.get(key) !== val) return false;
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
    if (!Object.is(objA[key], objB[key])) return false;
  }

  return true;
}
