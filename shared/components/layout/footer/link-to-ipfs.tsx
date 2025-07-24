import { IPFS_INFO_URL, useRemoteVersion } from 'features/ipfs';

import { OnlyInfraRender } from 'shared/components/only-infra-render';
import { ExternalLink } from './external-link';

export const LinkToIpfs = () => {
  const { data } = useRemoteVersion();
  return (
    <OnlyInfraRender
      renderIPFS={
        <ExternalLink href={IPFS_INFO_URL} $marginLeft="auto">
          IPFS Docs
        </ExternalLink>
      }
    >
      {data && (
        <ExternalLink href={data?.link} $marginLeft="auto">
          IPFS
        </ExternalLink>
      )}
    </OnlyInfraRender>
  );
};
