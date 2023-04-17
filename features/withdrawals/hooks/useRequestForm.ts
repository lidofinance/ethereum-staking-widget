import { useContext } from 'react';
import {
  RequestFormContext,
  RequestFormValue,
} from '../providers/request-form-provider/provider';

export const useRequestForm = (): RequestFormValue => {
  return useContext(RequestFormContext);
};
