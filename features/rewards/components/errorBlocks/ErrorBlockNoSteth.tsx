import { Box, Button } from '@lidofinance/lido-ui';
import { HOME_PATH } from 'consts/urls';
import { LocalLink } from 'shared/components/local-link';

type ErrorBlockNoStethProps = {
  hasSteth: boolean;
};

export const ErrorBlockNoSteth = ({ hasSteth }: ErrorBlockNoStethProps) => {
  const text = hasSteth
    ? "You haven't received rewards on your staked tokens yet. Please check back later to see your rewards."
    : "You don't have staked tokens. Stake now and receive daily rewards.";

  return (
    <Box
      id="nothingStaked"
      display="flex"
      flexDirection="column"
      alignItems="center"
      pt="32px"
      pb="18px"
    >
      <Box textAlign="center" pb="12px">
        {text}
      </Box>
      <LocalLink href={HOME_PATH}>
        {!hasSteth && (
          <Box width="150px">
            <Button>Stake now</Button>
          </Box>
        )}
      </LocalLink>
    </Box>
  );
};
