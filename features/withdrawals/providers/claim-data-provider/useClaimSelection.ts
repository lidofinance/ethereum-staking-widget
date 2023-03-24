import { useCallback, useState } from 'react';

type ClaimSelectionState = { [k: string]: boolean };

export const useClaimSelection = () => {
  const [selectionState, setSelectionState] = useState<ClaimSelectionState>({});

  // stable setters
  const setSelected = useCallback(
    (key: string, value: boolean) =>
      setSelectionState((old) => ({
        ...old,
        [key]: value,
      })),
    [],
  );
  const setSelectedMany = useCallback((keys: string[]) => {
    setSelectionState((old) => {
      return keys.reduce(
        (newMap, key) => {
          newMap[key] = true;
          return newMap;
        },
        { ...old },
      );
    });
  }, []);
  const setUnselectedMany = useCallback((keys: string[]) => {
    setSelectionState((old) => {
      return keys.reduce(
        (newMap, key) => {
          newMap[key] = false;
          return newMap;
        },
        { ...old },
      );
    });
  }, []);
  // getters
  const isSelected = useCallback(
    (key: string) => selectionState[key] ?? false,
    [selectionState],
  );
  const getSelected = useCallback(
    () =>
      Object.entries(selectionState)
        .filter((e) => e[1])
        .map((e) => e[0]),
    [selectionState],
  );
  const selectAll = useCallback(() => {
    const keys = Object.keys(selectionState);
    setSelectedMany(keys);
  }, [selectionState, setSelectedMany]);
  const clearAll = useCallback(() => {
    const keys = Object.keys(selectionState);
    setUnselectedMany(keys);
  }, [selectionState, setUnselectedMany]);

  return {
    isSelected,
    setSelected,
    getSelected,
    setSelectedMany,
    selectionState,
    selectAll,
    clearAll,
  };
};
