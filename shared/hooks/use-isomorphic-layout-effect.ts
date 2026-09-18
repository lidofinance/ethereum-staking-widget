import { useEffect, useLayoutEffect } from 'react';

/**
 * useLayoutEffect on the client, useEffect on the server.
 * Avoids the React 18 "useLayoutEffect does nothing on the server" warning
 * while keeping before-paint timing in the browser.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;
