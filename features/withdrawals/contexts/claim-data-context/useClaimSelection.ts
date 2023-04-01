import { type RequestStatusClaimable } from 'features/withdrawals/types/request-status';
import { MAX_REQUESTS_COUNT } from 'features/withdrawals/withdrawalsConstants';

import { useCallback, useEffect, useMemo, useState } from 'react';

export const useClaimSelection = (
  claimableRequests: RequestStatusClaimable[],
) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [state, setSelectionState] = useState<{
    selection_set: Set<string>;
  }>({ selection_set: new Set() });

  const claimableIdToIndex = useMemo(() => {
    return claimableRequests.reduce((map, cur, i) => {
      map[cur.stringId] = i;
      return map;
    }, {} as { [key: string]: number });
  }, [claimableRequests]);

  // it's ok to rebuild array because we cap selected at MAX_REQUEST_PER_TX
  const sortedSelectedRequests = useMemo(() => {
    return Array.from(state.selection_set.keys())
      .map((id) => claimableRequests[claimableIdToIndex[id]])
      .filter((r) => r)
      .sort((aReq, bReq) => (aReq.id.gt(bReq.id) ? 1 : -1));
  }, [claimableRequests, claimableIdToIndex, state]);

  // because we get count from sortedSelectedRequests, we don't count stale ids from removed reqs
  const selectedCount = sortedSelectedRequests.length;

  // stablish setters
  const setSelected = useCallback(
    (key: string, value: boolean) => {
      setSelectionState((old) => {
        if (value && selectedCount >= MAX_REQUESTS_COUNT) return old;
        if (value) old.selection_set.add(key);
        else old.selection_set.delete(key);
        return { selection_set: old.selection_set };
      });
    },
    [selectedCount],
  );

  const setSelectedMany = useCallback(
    (keys: string[]) => {
      const freeSpace = MAX_REQUESTS_COUNT - selectedCount;
      if (freeSpace <= 0) return;
      setSelectionState((old) => {
        keys.slice(0, freeSpace).forEach((k) => old.selection_set.add(k));
        return { selection_set: old.selection_set };
      });
    },
    [selectedCount],
  );

  const setUnselectedMany = useCallback((keys: string[]) => {
    setSelectionState((old) => {
      keys.forEach((k) => old.selection_set.delete(k));
      return { selection_set: old.selection_set };
    });
  }, []);

  // getters
  const isSelected = useCallback(
    (key: string) =>
      Boolean(state.selection_set.has(key) && key in claimableIdToIndex),
    [state, claimableIdToIndex],
  );

  // populate state on claimableRequests
  useEffect(() => {
    if (isInitialized || claimableRequests.length === 0) return;
    setSelectedMany(
      claimableRequests.slice(0, MAX_REQUESTS_COUNT).map((r) => r.stringId),
    );
    setIsInitialized(true);
  }, [isInitialized, claimableRequests, setSelectedMany]);

  return {
    isSelected,
    setSelected,
    setSelectedMany,
    setUnselectedMany,
    sortedSelectedRequests,
    selectedCount,
    canSelectMore: selectedCount < MAX_REQUESTS_COUNT,
  };
};
