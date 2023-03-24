import { useContext } from 'react';
import {
  RequestDataContext,
  RequestDataValue,
} from '../providers/request-data-provider/provider';

export const useRequestData = (): RequestDataValue => {
  return useContext(RequestDataContext);
};
