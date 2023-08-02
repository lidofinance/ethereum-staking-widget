import { Box, Block, Text } from '@lidofinance/lido-ui';

type Props = React.ComponentProps<typeof Box> & {
  text: React.ReactNode;
  textProps?: React.ComponentProps<typeof Text>;
};

export const ErrorBlockBase = ({ text, textProps = {}, ...rest }: Props) => (
  <Block>
    <Box textAlign="center" {...rest}>
      <Text size="xxs" {...textProps}>
        {text}
      </Text>
    </Box>
  </Block>
);
