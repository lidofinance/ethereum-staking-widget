import { useContext } from 'react';
import {
  ClaimTxModalContext,
  ClaimTxModalValue,
} from '../providers/claim-tx-modal-provider';

export const useClaimTxModal = (): ClaimTxModalValue => {
  return useContext(ClaimTxModalContext);
};
