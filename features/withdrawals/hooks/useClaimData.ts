import { useContext } from 'react';
import {
  ClaimDataContext,
  ClaimDataValue,
} from '../providers/claim-data-provider/provider';

export const useClaimData = (): ClaimDataValue => {
  return useContext(ClaimDataContext);
};
