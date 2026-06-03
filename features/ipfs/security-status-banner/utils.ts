export const isVersionLess = (versionA: string, versionB: string): boolean => {
  const verA = versionA
    .trim()
    .split('.')
    .map((v) => parseInt(v));
  const verB = versionB
    .trim()
    .split('.')
    .map((v) => parseInt(v));

  // Iterate over the longer operand: a shorter prefix-equal version is "less"
  // (e.g. "1.0.0" < "1.0.0.1") — iterating by verA.length would miss that.
  const len = Math.max(verA.length, verB.length);
  // eslint-disable-next-line unicorn/no-for-loop
  for (let index = 0; index < len; index++) {
    const a = verA[index] ?? 0;
    const b = verB[index] ?? 0;
    // validation
    if (isNaN(a) || isNaN(b)) return false;
    if (a > b) return false;
    if (a < b) return true;
  }
  // versions are  equal
  return false;
};
