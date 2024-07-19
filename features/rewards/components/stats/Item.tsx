import { Box } from '@lidofinance/lido-ui';

type BoxProps = React.ComponentProps<typeof Box>;

// TODO: refactoring to style files
export const Item = ({ children, ...rest }: BoxProps) => (
  <Box
    flexGrow={1}
    width={['100%', '100%', 'initial']}
    display={['flex', 'flex', 'initial']}
    justifyContent={['space-between', 'space-between', null]}
    marginBottom={['6px']}
    {...rest}
  >
    {children}
  </Box>
);
