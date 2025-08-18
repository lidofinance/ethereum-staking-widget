import { InlineLoader as LoaderLib } from '@lidofinance/lido-ui';

type LoaderProps = {
  isLoading?: boolean;
  width?: number;
} & React.PropsWithChildren &
  React.ComponentProps<'span'>;

export const InlineLoader = ({
  isLoading,
  width = 20,
  children,
  ...props
}: LoaderProps) => {
  if (!isLoading) return <>{children}</>;
  return (
    <span {...props}>
      <LoaderLib style={{ width: `${width}px` }} />
    </span>
  );
};
