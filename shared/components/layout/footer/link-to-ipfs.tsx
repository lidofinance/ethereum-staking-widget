import { IPFS_INFO_URL, useRemoteVersion } from 'features/ipfs';

import { OnlyInfraRender } from 'shared/components/only-infra-render';
import { ExternalLink } from './styles';

export const LinkToIpfs = () => {
  const { data } = useRemoteVersion();
  return (
    <OnlyInfraRender
      renderIPFS={<ExternalLink href={IPFS_INFO_URL}>IPFS Docs</ExternalLink>}
    >
      {data && <ExternalLink href={data?.link}>IPFS</ExternalLink>}
    </OnlyInfraRender>
  );
};
