import { serverRuntimeConfig } from 'config';
import { standardFetcher } from 'utils/standardFetcher';
import { responseTimeExternalMetricWrapper } from './fetchApiWrapper';

export const getFaq = async (path: string): Promise<string | null> => {
  console.debug('[getFaq] Started fetching from CMS...');
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
    console.error('[getFaq] Request to CMS failed');
    return null;
  }

  console.debug('[getFaq] Fetched from CMS was successes');
  return data;
};
