import { useMemo } from 'react';
import { ButtonIcon, Copy } from '@lidofinance/lido-ui';

import { getConfig } from 'config';
const { ipfsMode } = getConfig();

import { useCopyToClipboard } from 'shared/hooks';
import { getBasedHashHref } from 'utils/get-based-hash-href';

// TODO: move to separate folders
const CopyAddressUrl = ({ address }: { address: string }) => {
  const url = useMemo(() => {
    const { href } = location;

    if (ipfsMode) {
      let withoutHashAndQuery = href.split('?')[0].split('#')[0];
      if (withoutHashAndQuery[withoutHashAndQuery.length - 1] === '/') {
        // Remove first '/'
        withoutHashAndQuery = withoutHashAndQuery.slice(0, -1);
      }

      const hash = href.split('#')[1].split('?')[0];
      return (
        withoutHashAndQuery +
        getBasedHashHref(hash, { address } as Record<string, string>)
      );
    } else {
      // Infra version
      const withoutQuery = href.split('?')[0];
      return `${withoutQuery}?address=${address}`;
    }
  }, [address]);

  const handleCopy = useCopyToClipboard(url);

  return (
    <ButtonIcon
      color="primary"
      icon={<Copy />}
      size="xs"
      variant="translucent"
      onClick={handleCopy}
      data-testid="copyAddressButton"
    />
  );
};

export default CopyAddressUrl;
