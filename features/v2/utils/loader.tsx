import { Skeleton } from '@lidofinance/lido-app-ui';

type LoaderProps = { isLoading?: boolean } & React.ComponentProps<
  typeof Skeleton
>;

export const Loader: React.FC<LoaderProps> = ({ children, ...props }) => {
  if (props.isLoading) return <Skeleton {...props} />;
  return children;
};
