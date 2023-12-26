import { parseFAQ } from '@lidofinance/ui-faq';

import { serverRuntimeConfig } from 'config';
import { fetcherWithServiceResponse } from 'utils/fetcher-with-service-response';
import { FaqWithMeta } from 'utils/faq';

import { responseTimeExternalMetricWrapper } from './fetchApiWrapper';

export const fetchFaqSSR = async (
  path: string,
): Promise<ReturnType<typeof fetcherWithServiceResponse<string>> | null> => {
  console.debug(`[fetchFaqSSR] Started fetching the '${path}' from CMS...`);
  const resp = await responseTimeExternalMetricWrapper({
    payload: serverRuntimeConfig.faqContentBasePath,
    request: () =>
      fetcherWithServiceResponse<string>(
        `${serverRuntimeConfig.faqContentBasePath}/${path}`,
        {
          method: 'GET',
          headers: {
            'Content-type': 'text/html',
          },
        },
      ),
  });

  if (!resp || !resp.data) {
    console.error(`[fetchFaqSSR] Request the '${path}' to CMS failed!`);
    return null;
  }

  console.debug(`[fetchFaqSSR] Successfully fetched the '${path}' from CMS!`);
  return resp;
};

export const getFaqSSR = async (path: string): Promise<FaqWithMeta | null> => {
  try {
    const rawFaqResp = await fetchFaqSSR(path);

    // We can't use `undefined` with Next `getStaticProps`.
    // Reason: `undefined` cannot be serialized as JSON. Please use `null` or omit this value.
    if (!rawFaqResp || !rawFaqResp.data) return null;

    const parsedFaq = await parseFAQ(rawFaqResp.data);
    if (!parsedFaq) return null;

    return {
      pageFAQ: parsedFaq,
      path,
      eTag: rawFaqResp?.headers?.get('ETag'),
    };
  } catch (err) {
    console.error(
      `[getFaqSSR] Fetch or parse FAQ (${path}) raised exception: ${err}`,
    );
    return null;
  }
};
