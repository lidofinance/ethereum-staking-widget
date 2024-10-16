import { useEffect, useState } from 'react';
import { useForceDisconnect } from 'reef-knot/core-react';
import { useLidoSWR } from '@lido-sdk/react';

import buildInfo from 'build-info.json';
import { config } from 'config';
import { useUserConfig } from 'config/user-config';
import { STRATEGY_IMMUTABLE } from 'consts/swr-strategies';
import { useDappStatus } from 'modules/web3';
import { overrideWithQAMockBoolean } from 'utils/qa';

import { isVersionLess } from './utils';
import { useRemoteVersion } from './use-remote-version';

export const NO_SAFE_VERSION = 'NONE_AVAILABLE';

// works with any type of IPFS hash
const URL_CID_REGEX =
  /[/.](?<cid>Qm[1-9A-HJ-NP-Za-km-z]{44,}|b[A-Za-z2-7]{58,}|B[A-Z2-7]{58,}|z[1-9A-HJ-NP-Za-km-z]{48,}|F[0-9A-F]{50,})([./#?]|$)/;

export const useVersionCheck = () => {
  const { isWalletConnected } = useDappStatus();
  const { setIsWalletConnectionAllowed } = useUserConfig();
  const { forceDisconnect } = useForceDisconnect();
  const [areConditionsAccepted, setConditionsAccepted] = useState(false);

  // only IPFS: local cid extraction
  const currentCidSWR = useLidoSWR(
    ['swr:ipfs-cid-extraction'],
    async () => {
      const urlCid = URL_CID_REGEX.exec(window.location.href)?.groups?.cid;
      if (urlCid) return urlCid;
      const headers = await fetch(
        `${config.BASE_PATH_ASSET}/runtime/window-env.js`,
        {
          method: 'HEAD',
        },
      );
      return headers.headers.get('X-Ipfs-Roots');
    },
    { ...STRATEGY_IMMUTABLE, isPaused: () => !config.ipfsMode },
  );

  // ens cid extraction
  const remoteVersionSWR = useRemoteVersion();

  // update is available
  // for INFRA - leastSafeVersion is not NO_SAFE_VERSION
  // for IPFS - ^this and current cid doesn't match
  const isUpdateAvailable = overrideWithQAMockBoolean(
    Boolean(
      remoteVersionSWR.data &&
        ((currentCidSWR.data &&
          remoteVersionSWR.data.cid !== currentCidSWR.data) ||
          !config.ipfsMode) &&
        remoteVersionSWR.data.leastSafeVersion !== NO_SAFE_VERSION,
    ),
    'mock-qa-helpers-security-banner-is-update-available',
  );

  const isVersionUnsafe = overrideWithQAMockBoolean(
    Boolean(
      remoteVersionSWR.data?.leastSafeVersion &&
        (remoteVersionSWR.data.leastSafeVersion === NO_SAFE_VERSION ||
          isVersionLess(
            buildInfo.version,
            remoteVersionSWR.data.leastSafeVersion,
          )),
    ),
    'mock-qa-helpers-security-banner-is-version-unsafe',
  );

  const isNotVerifiable = overrideWithQAMockBoolean(
    !!remoteVersionSWR.error,
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
        remoteCid: remoteVersionSWR.data?.cid,
        currentCid: currentCidSWR.data,
        remoteCidLink: remoteVersionSWR.data?.link,
      };
    },
    get initialLoading() {
      return remoteVersionSWR.initialLoading || currentCidSWR.initialLoading;
    },
    get loading() {
      return remoteVersionSWR.loading || currentCidSWR.loading;
    },
    get error() {
      return remoteVersionSWR.error || currentCidSWR.error;
    },
  };
};
