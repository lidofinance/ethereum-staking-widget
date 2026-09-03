import { DATA_UNAVAILABLE } from 'consts/text';
import { InlineLoader } from 'features/earn/shared/inline-loader';

type Props = {
  value?: string;
  isLoading?: boolean;
};

export const ActiveFeesValue = ({ value, isLoading }: Props) => (
  <InlineLoader isLoading={isLoading} width={180}>
    {value ?? DATA_UNAVAILABLE}
  </InlineLoader>
);
