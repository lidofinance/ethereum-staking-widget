import { useLidoSWR, SWRResponse } from '@lido-sdk/react';
import { isPageFAQ, PageFAQ } from '@lidofinance/ui-faq';

import { getFaqOnClient, FaqWithMeta } from 'utils/faq';
import { STRATEGY_CONSTANT } from 'utils/swrStrategies';

export type UseUpdatableFaq = (props: FaqWithMeta) => SWRResponse<PageFAQ>;

export const useUpdatableFaq: UseUpdatableFaq = ({ pageFAQ, path, eTag }) => {
  return useLidoSWR(
    ['swr:useUpdatableFaq', path, eTag],
    async () => {
      if (!eTag) {
        return pageFAQ;
      }

      const respFaq = await getFaqOnClient(path);
      if (!respFaq || !isPageFAQ(respFaq.pageFAQ) || eTag === respFaq?.eTag) {
        return pageFAQ;
      }

      // Updated PageFAQ
      return respFaq.pageFAQ;
    },
    STRATEGY_CONSTANT,
  );
};
