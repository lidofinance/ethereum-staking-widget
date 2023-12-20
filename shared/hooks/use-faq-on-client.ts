import { useLidoSWR, SWRResponse } from '@lido-sdk/react';
import { isPageFAQ, PageFAQ } from '@lidofinance/ui-faq';

import { getFaqOnClient } from 'utils/faq';
import { STRATEGY_CONSTANT } from 'utils/swrStrategies';

export const useUpdatableFaq = (
  faqPath: string,
  eTag?: string | null,
): SWRResponse<PageFAQ | undefined> => {
  return useLidoSWR(
    ['swr:useUpdatableFaq', faqPath, eTag],
    async () => {
      if (!eTag) {
        return undefined;
      }

      const respFaq = await getFaqOnClient(faqPath);

      if (
        !respFaq ||
        !respFaq.faq ||
        !isPageFAQ(respFaq.faq) ||
        eTag === respFaq?.eTag
      ) {
        return undefined;
      }

      return respFaq.faq;
    },
    STRATEGY_CONSTANT,
  );
};
