import { useWithdrawals } from '../contexts/withdrawals-context';
import { ClaimFaq } from './claim-faq';
import { RequestFaq } from './request-faq';

export const Faq = () => {
  const { isClaimTab } = useWithdrawals();

  return isClaimTab ? <ClaimFaq /> : <RequestFaq />;
};
