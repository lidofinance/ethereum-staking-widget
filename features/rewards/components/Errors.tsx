import { Box, Block, Text, Button } from '@lidofinance/lido-ui';

// TODO: move to separate folders

type ErrorBlockProps = React.ComponentProps<typeof Box> & {
  text: React.ReactNode;
};
export const ErrorBlock = ({ text, ...rest }: ErrorBlockProps) => (
  <Block>
    <Box textAlign="center" {...rest}>
      <Text size="xxs">{text}</Text>
    </Box>
  </Block>
);

export const LimitsError = () => (
  <ErrorBlock text="Limits are hit, unable to show transactions of this address." />
);

export const NoStEthError = () => (
  <Box
    id="nothingStaked"
    display="flex"
    flexDirection="column"
    alignItems="center"
    pt="32px"
    pb="18px"
  >
    <Box textAlign="center" pb="12px">
      You don’t have staked assets. Stake now and recieve daily rewards.
    </Box>
    <a href="https://stake.lido.fi">
      <Box width="150px">
        <Button>Stake now</Button>
      </Box>
    </a>
  </Box>
);

export const NetworkError = () => (
  <ErrorBlock text="Unable to fetch rewards data." />
);
