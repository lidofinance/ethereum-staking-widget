import { ButtonIcon, Copy } from '@lidofinance/lido-ui';
import { useCopyToClipboard } from 'shared/hooks';

// TODO: move to separate folders
const CopyAddressUrl = ({ address }: { address: string }) => {
  const { href } = location;
  const withoutQuery = href.split('?')[0];
  const url = `${withoutQuery}?address=${address}`;

  const handleCopy = useCopyToClipboard(url);

  return (
    <ButtonIcon
      color="primary"
      icon={<Copy />}
      size="xs"
      variant="translucent"
      onClick={handleCopy}
    />
  );
};

export default CopyAddressUrl;
