import { useEffect, useRef } from 'react';

export const useLaggyDataWrapper = <Data>(data: Data) => {
  const laggyDataRef = useRef<Data | undefined>();
  const isDataPresented = data !== undefined && data !== null;

  useEffect(() => {
    if (isDataPresented) {
      laggyDataRef.current = data;
    }
  }, [data, isDataPresented]);

  // Return to previous data if current data is not defined.
  const dataOrLaggyData = !isDataPresented ? laggyDataRef.current : data;

  // Shows previous data.
  const isLagging = !isDataPresented && laggyDataRef.current !== undefined;

  return {
    isLagging,
    dataOrLaggyData,
  };
};
