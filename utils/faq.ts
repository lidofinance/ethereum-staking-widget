import { PageFAQ, parseFAQ } from '@lidofinance/ui-faq';

import { dynamics } from 'config';
import { getPathWithoutFirstSlash } from 'config/urls';
import { fetcherWithServiceResponse } from 'utils/fetcher-with-service-response';

export const fetchFaqOnClient = async (
  path: string,
): Promise<ReturnType<typeof fetcherWithServiceResponse<string>> | null> => {
  console.debug(
    `[fetchFaqOnClient] Started fetching the '${path}' from CMS...`,
  );

  const resp = await fetcherWithServiceResponse<any>(
    `${dynamics.faqContentBasePath}/${getPathWithoutFirstSlash(path)}`,
    {
      method: 'GET',
      headers: {
        'Content-type': 'text/html',
      },
    },
  );

  if (!resp || !resp.data) {
    console.error(`[fetchFaqOnClient] Request the '${path}' to CMS failed!`);
    return null;
  }

  console.debug(
    `[fetchFaqOnClient] Fetched the '${path}' from CMS was successes!`,
  );
  return resp;
};

export type FaqWithMeta = {
  pageFAQ: PageFAQ;
  path: string;
  eTag?: string | null;
};

export const getFaqOnClient = async (
  path: string,
): Promise<FaqWithMeta | null> => {
  try {
    const rawFaqResp = await fetchFaqOnClient(path);

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
      `[getFaqOnClient] Fetch or parse FAQ (${path}) raised exception: ${err}`,
    );
    return null;
  }
};
