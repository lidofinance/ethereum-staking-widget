import { Wrap, InfoLink, Text } from './styles';

const GATEWAY_CHECKER_URL = 'https://ipfs.github.io/public-gateway-checker/';
const DESKTOP_APP_URL = 'https://github.com/ipfs/ipfs-desktop#ipfs-desktop';

export const CSPViolationBox = () => {
  return (
    <Wrap>
      <Text weight={700} size="xs">
        Insufficient Gateway CSP
      </Text>
      <Text weight={400} size="xxs">
        RPC requests are blocked by Content Security Policy set by IPFS Gateway
        service you are using.
      </Text>
      <Text weight={700} size="xxs">
        Possible actions:
      </Text>
      <Text weight={400} size="xxs">
        Use another gateway service:
        <br />
        <InfoLink href={GATEWAY_CHECKER_URL}>Public Gateway Checker</InfoLink>
      </Text>
      <Text weight={400} size="xxs">
        Or install your IPFS Gateway:
        <br />
        <InfoLink href={DESKTOP_APP_URL}>IPFS Desktop</InfoLink>
      </Text>
    </Wrap>
  );
};
