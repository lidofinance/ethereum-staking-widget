import { InlineLoader as LoaderLib } from '@lidofinance/lido-ui';

type LoaderProps = {
  isLoading?: boolean;
  width?: number;
  fullWidth?: boolean;
} & React.PropsWithChildren &
  React.ComponentProps<'span'>;

export const InlineLoader = ({
  isLoading,
  width = 20,
  children,
  fullWidth,
  ...props
}: LoaderProps) => {
  if (!isLoading) return <>{children}</>;
  return (
    <span {...props}>
      <LoaderLib style={{ width: fullWidth ? '100%' : `${width}px` }} />
    </span>
  );
};
