import { useContext } from 'react';
import {
  RequestTxModalContext,
  RequestTxModalValue,
} from '../providers/request-tx-modal-provider';

export const useRequestTxModal = (): RequestTxModalValue => {
  return useContext(RequestTxModalContext);
};
