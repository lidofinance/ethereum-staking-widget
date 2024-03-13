export const isVersionLess = (versionA: string, versionB: string): boolean => {
  const verA = versionA
    .trim()
    .split('.')
    .map((v) => parseInt(v));
  const verB = versionB
    .trim()
    .split('.')
    .map((v) => parseInt(v));

  // eslint-disable-next-line unicorn/no-for-loop
  for (let index = 0; index < verA.length; index++) {
    const a = verA[index];
    const b = verB[index];
    // validation
    if (b === undefined || isNaN(a) || isNaN(b)) return false;
    if (a > b) return false;
    if (a < b) return true;
  }
  // versions are  equal
  return false;
};
