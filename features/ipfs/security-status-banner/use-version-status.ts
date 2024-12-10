import { useEffect, useState } from 'react';
import { useForceDisconnect } from 'reef-knot/core-react';
import { useQuery } from '@tanstack/react-query';

import buildInfo from 'build-info.json';
import { config } from 'config';
import { useUserConfig } from 'config/user-config';
import { STRATEGY_IMMUTABLE } from 'consts/react-query-strategies';
import { useDappStatus } from 'modules/web3';
import { overrideWithQAMockBoolean } from 'utils/qa';

import { isVersionLess } from './utils';
import { useRemoteVersion } from './use-remote-version';

export const NO_SAFE_VERSION = 'NONE_AVAILABLE';

// works with any type of IPFS hash
const URL_CID_REGEX =
  /[/.](?<cid>Qm[1-9A-HJ-NP-Za-km-z]{44,}|b[A-Za-z2-7]{58,}|B[A-Z2-7]{58,}|z[1-9A-HJ-NP-Za-km-z]{48,}|F[0-9A-F]{50,})([./#?]|$)/;

export const useVersionStatus = () => {
  const { isWalletConnected } = useDappStatus();
  const { setIsWalletConnectionAllowed } = useUserConfig();
  const { forceDisconnect } = useForceDisconnect();
  const [areConditionsAccepted, setConditionsAccepted] = useState(false);

  // only IPFS: local cid extraction
  const currentCidQueryResult = useQuery({
    queryKey: ['ipfs-cid-extraction'],
    ...STRATEGY_IMMUTABLE,
    enabled: !!config.ipfsMode,
    queryFn: async () => {
      const urlCid = URL_CID_REGEX.exec(window.location.href)?.groups?.cid;
      if (urlCid) return urlCid;

      const response = await fetch(
        `${config.BASE_PATH_ASSET}/runtime/window-env.js`,
        {
          method: 'HEAD',
        },
      );

      return response.headers.get('X-Ipfs-Roots');
    },
  });

  // ens cid extraction
  const remoteVersionQueryResult = useRemoteVersion();

  // update is available
  // for INFRA - leastSafeVersion is not NO_SAFE_VERSION
  // for IPFS - ^this and current cid doesn't match
  const isUpdateAvailable = overrideWithQAMockBoolean(
    Boolean(
      remoteVersionQueryResult.data &&
        ((currentCidQueryResult.data &&
          remoteVersionQueryResult.data.cid !== currentCidQueryResult.data) ||
          !config.ipfsMode) &&
        remoteVersionQueryResult.data.leastSafeVersion !== NO_SAFE_VERSION,
    ),
    'mock-qa-helpers-security-banner-is-update-available',
  );

  const isVersionUnsafe = overrideWithQAMockBoolean(
    Boolean(
      remoteVersionQueryResult.data?.leastSafeVersion &&
        (remoteVersionQueryResult.data.leastSafeVersion === NO_SAFE_VERSION ||
          isVersionLess(
            buildInfo.version,
            remoteVersionQueryResult.data.leastSafeVersion,
          )),
    ),
    'mock-qa-helpers-security-banner-is-version-unsafe',
  );

  const isNotVerifiable = overrideWithQAMockBoolean(
    !!remoteVersionQueryResult.error,
    'mock-qa-helpers-security-banner-is-not-verifiable',
  );

  // disconnect wallet and disallow connection for unsafe versions
  useEffect(() => {
    if (isVersionUnsafe) {
      setIsWalletConnectionAllowed(false);
    }
    if (
      isVersionUnsafe ||
      (config.ipfsMode && isNotVerifiable && isWalletConnected)
    ) {
      forceDisconnect();
    }
  }, [
    forceDisconnect,
    isNotVerifiable,
    isVersionUnsafe,
    isWalletConnected,
    setIsWalletConnectionAllowed,
  ]);

  return {
    setConditionsAccepted,
    areConditionsAccepted,
    isNotVerifiable,
    isVersionUnsafe,
    isUpdateAvailable,

    get data() {
      return {
        remoteCid: remoteVersionQueryResult.data?.cid,
        currentCid: currentCidQueryResult.data,
        remoteCidLink: remoteVersionQueryResult.data?.link,
      };
    },
    get isLoading() {
      return (
        remoteVersionQueryResult.isLoading || currentCidQueryResult.isLoading
      );
    },
    get isFetching() {
      return (
        remoteVersionQueryResult.isFetching || currentCidQueryResult.isFetching
      );
    },
    get error() {
      return remoteVersionQueryResult.error || currentCidQueryResult.error;
    },
  };
};
