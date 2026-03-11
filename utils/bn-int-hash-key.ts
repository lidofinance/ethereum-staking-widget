// Copied from: https://github.com/jonschlinkert/is-plain-object
const isPlainObject = (o: any): o is Record<PropertyKey, unknown> => {
  if (!hasObjectPrototype(o)) {
    return false;
  }

  // If has no constructor
  const ctor = o.constructor;
  if (ctor === undefined) {
    return true;
  }

  // If has modified prototype
  const prot = ctor.prototype;
  if (!hasObjectPrototype(prot)) {
    return false;
  }

  // If constructor does not have an Object-specific method
  // eslint-disable-next-line no-prototype-builtins
  if (!prot.hasOwnProperty('isPrototypeOf')) {
    return false;
  }

  // Handles Objects created by Object.create(<arbitrary prototype>)
  // eslint-disable-next-line sonarjs/prefer-single-boolean-return
  if (Object.getPrototypeOf(o) !== Object.prototype) {
    return false;
  }

  // Most likely a plain Object
  return true;
};

const hasObjectPrototype = (o: any): boolean => {
  return Object.prototype.toString.call(o) === '[object Object]';
};

// Copy of react-query's default hash function with support for BigInt
export const bigIntHashKey = (queryKey: unknown) =>
  JSON.stringify(queryKey, (_, val) => {
    if (isPlainObject(val)) {
      return Object.keys(val)
        .sort()
        .reduce((result, key) => {
          result[key] = val[key];
          return result;
        }, {} as any);
    }
    if (typeof val === 'bigint') {
      return val.toString();
    }
    return val;
  });
