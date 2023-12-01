import { PageFAQ, parseFAQ } from '@lidofinance/ui-faq';
import { serverRuntimeConfig } from 'config';
import { standardFetcher } from 'utils/standardFetcher';
import { responseTimeExternalMetricWrapper } from './fetchApiWrapper';

export const fetchFAQ = async (path: string): Promise<string | null> => {
  console.debug(`[getFaq] Started fetching the '${path}' from CMS...`);
  const cmsHost = serverRuntimeConfig.faqContentHost;

  const data = await responseTimeExternalMetricWrapper({
    payload: cmsHost,
    request: () =>
      standardFetcher<string>(`${cmsHost}/${path}`, {
        method: 'GET',
        headers: {
          'Content-type': 'text/html',
        },
      }),
  });

  if (!data) {
    console.error(`[getFaq] Request the '${path}' to CMS failed!`);
    return null;
  }

  console.debug(`[getFaq] Fetched the '${path}' from CMS was successes!`);
  return data;
};

export const getFAQ = async (path: string): Promise<PageFAQ | null> => {
  try {
    const rawFaqData = await fetchFAQ(path);

    // We can't use `undefined` with Next `getStaticProps`.
    // Reason: `undefined` cannot be serialized as JSON. Please use `null` or omit this value.
    if (!rawFaqData) return null;

    return await parseFAQ(rawFaqData);
  } catch (err) {
    console.error(`Fetch or parse FAQ (${path}) raised exception: ${err}`);
    return null;
  }
};
