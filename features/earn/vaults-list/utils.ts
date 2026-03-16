// Not used at the moment, but kept for future use
export const getTvlSortFn = (tvlData?: Record<string, any>) => {
  if (tvlData && tvlData.data) {
    const { data } = tvlData;

    return (a: { name: string }, b: { name: string }) => {
      const tvlA = BigInt(data[a.name]?.tvlEthWei ?? 0n);
      const tvlB = BigInt(data[b.name]?.tvlEthWei ?? 0n);
      if (tvlA > tvlB) return -1;
      if (tvlA < tvlB) return 1;
      return 0;
    };
  } else {
    // No sorting as fallback
    return () => 0;
  }
};
