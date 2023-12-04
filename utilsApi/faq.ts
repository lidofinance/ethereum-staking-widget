import { PageFAQ, parseFAQ } from '@lidofinance/ui-faq';

import { serverRuntimeConfig } from 'config';
import { fetcherWithServiceResponse } from 'utils/fetcher-with-service-response';

import { responseTimeExternalMetricWrapper } from './fetchApiWrapper';

export const fetchFaqSSR = async (
  path: string,
): Promise<ReturnType<typeof fetcherWithServiceResponse<string>> | null> => {
  console.debug(`[fetchFaqSSR] Started fetching the '${path}' from CMS...`);
  const cmsPartOfUrl = serverRuntimeConfig.faqContentPartOfUrl;

  const resp = await responseTimeExternalMetricWrapper({
    payload: cmsPartOfUrl,
    request: () =>
      fetcherWithServiceResponse<string>(`${cmsPartOfUrl}/${path}`, {
        method: 'GET',
        headers: {
          'Content-type': 'text/html',
        },
      }),
  });

  if (!resp || !resp.data) {
    console.error(`[fetchFaqSSR] Request the '${path}' to CMS failed!`);
    return null;
  }

  console.debug(`[fetchFaqSSR] Fetched the '${path}' from CMS was successes!`);
  return resp;
};

export const getFaqSSR = async (
  path: string,
): Promise<{ faq?: PageFAQ | null; eTag?: string | null } | null> => {
  try {
    const rawFaqResp = await fetchFaqSSR(path);

    // We can't use `undefined` with Next `getStaticProps`.
    // Reason: `undefined` cannot be serialized as JSON. Please use `null` or omit this value.
    if (!rawFaqResp || !rawFaqResp.data) return null;

    return {
      faq: await parseFAQ(rawFaqResp.data),
      eTag: rawFaqResp?.headers?.get('ETag'),
    };
  } catch (err) {
    console.error(
      `[getFaqSSR] Fetch or parse FAQ (${path}) raised exception: ${err}`,
    );
    return null;
  }
};
