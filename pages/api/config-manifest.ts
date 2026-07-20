import type { API } from '@lidofinance/next-api-wrapper';
import {
  wrapRequest as wrapNextRequest,
  cacheControl,
} from '@lidofinance/next-api-wrapper';
import { config } from 'config';
import { API_ROUTES } from 'consts/api';
import {
  defaultErrorHandler,
  responseTimeMetric,
  rateLimit,
  httpMethodGuard,
  HttpMethod,
  cors,
} from 'utilsApi';
import Metrics from 'utilsApi/metrics';
import { fetchExternalManifest } from 'utilsApi/fetch-external-manifest';

// serves the manifest from the same source as the SSR prefetch:
// CONFIG_MANIFEST_PATH file or the cached remote manifest
const configManifest: API = async (req, res) => {
  const { ___prefetch_manifest___ } = await fetchExternalManifest();
  res.status(200).json(___prefetch_manifest___);
};

export default wrapNextRequest([
  httpMethodGuard([HttpMethod.GET]),
  cors({ origin: ['*'], methods: [HttpMethod.GET] }),
  rateLimit,
  responseTimeMetric(Metrics.request.apiTimings, API_ROUTES.CONFIG_MANIFEST),
  cacheControl({ headers: config.CACHE_EXTERNAL_MANIFEST_HEADERS }),
  defaultErrorHandler,
])(configManifest);
