import { Box } from '@lidofinance/lido-ui';

type BoxProps = React.ComponentProps<typeof Box>;

// TODO: refactoring to style files
export const Stat = ({ children, ...rest }: BoxProps) => (
  <Box
    fontStyle="normal"
    fontWeight={[null, null, 600]}
    fontSize={['12px', '12px', '16px']}
    lineHeight="20px"
    color="text"
    height="20px"
    mb="2px"
    display={'flex'}
    {...rest}
  >
    {children}
  </Box>
);
