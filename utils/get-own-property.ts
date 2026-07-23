export const getOwnProperty = <T extends object>(
  object: T,
  key: PropertyKey,
): T[keyof T] | undefined =>
  Object.hasOwn(object, key) ? object[key as keyof T] : undefined;
