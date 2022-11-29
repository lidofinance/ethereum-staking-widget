import {
  RewardsHistoryContext,
  RewardsHistoryValue,
} from 'providers/rewardsHistory';
import { useContext } from 'react';

export const useRewardsHistory = (): RewardsHistoryValue => {
  return useContext(RewardsHistoryContext);
};
