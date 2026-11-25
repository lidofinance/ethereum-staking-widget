import { useCallback } from 'react';
import copy from 'copy-to-clipboard';
import { ToastInfo } from '@lidofinance/lido-ui';

export const useCopyToClipboard = (text: string): (() => void) => {
  return useCallback(() => {
    // copy-to-clipboard 4 resolves after the clipboard write, with whether it
    // took: the toast waits for that instead of claiming a copy up front
    void copy(text).then((copied) => {
      if (copied) ToastInfo('Copied to clipboard', {});
    });
  }, [text]);
};
