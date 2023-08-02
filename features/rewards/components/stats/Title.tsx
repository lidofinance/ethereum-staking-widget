import { Box } from '@lidofinance/lido-ui';

type BoxProps = React.ComponentProps<typeof Box>;
type TitleProps = BoxProps & {
  hideMobile?: boolean;
};

// TODO: refactoring to style files
export const Title = ({ children, hideMobile, ...rest }: TitleProps) => (
  <Box
    color="secondary"
    fontSize="14px"
    fontStyle="normal"
    fontWeight="normal"
    height="20px"
    lineHeight="20px"
    display={hideMobile ? ['none', 'none', 'flex'] : null}
    {...rest}
  >
    {children}
  </Box>
);
