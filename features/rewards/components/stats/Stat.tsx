import { Box } from '@lidofinance/lido-ui';

type BoxProps = React.ComponentProps<typeof Box>;

// TODO: refactoring to style files
export const Stat = ({ children, ...rest }: BoxProps) => (
  <Box
    fontStyle="normal"
    fontWeight={[null, null, 600]}
    fontSize={['14px', '14px', '20px']}
    lineHeight="20px"
    color="text"
    height="20px"
    mb="6px"
    display={'flex'}
    {...rest}
  >
    {children}
  </Box>
);
