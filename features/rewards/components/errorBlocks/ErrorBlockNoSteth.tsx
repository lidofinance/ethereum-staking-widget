import { Box, Button } from '@lidofinance/lido-ui';
import { LocalLink } from 'shared/components/local-link';

export const ErrorBlockNoSteth = () => (
  <Box
    id="nothingStaked"
    display="flex"
    flexDirection="column"
    alignItems="center"
    pt="32px"
    pb="18px"
  >
    <Box textAlign="center" pb="12px">
      You don&apos;t have staked tokens. Stake now and receive daily rewards.
    </Box>
    <LocalLink href="/">
      <Box width="150px">
        <Button>Stake now</Button>
      </Box>
    </LocalLink>
  </Box>
);
